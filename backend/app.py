from __future__ import annotations

import json
import os
import shlex
import subprocess
import tempfile
from email.message import EmailMessage
from pathlib import Path
from typing import Any

import smtplib
from dotenv import dotenv_values, load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.datastructures import UploadFile

load_dotenv(Path(__file__).with_name('.env'))

app = FastAPI(title='Smartomation Demo Test API', version='1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

DEMO_PREFIXES = {
    'demo1': 'DEMO1_',
    'demo2': 'DEMO2_',
    'demo3': 'DEMO3_',
    'demo4': 'DEMO4_',
}

REPO_ROOT = Path(__file__).resolve().parent.parent


@app.get('/api/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/demo-test/{demo_id}/run')
async def run_demo(demo_id: str, request: Request) -> dict[str, Any]:
    if demo_id not in DEMO_PREFIXES:
        raise HTTPException(status_code=404, detail=f'Unknown demo id: {demo_id}')

    prefix = DEMO_PREFIXES[demo_id]
    payload, temp_paths = await _extract_payload(request)

    try:
        result = _run_command(prefix, payload)
        email_status = _send_output_email(prefix, payload, demo_id, result)
        return {
            'success': True,
            'demo_id': demo_id,
            'result': result,
            'email': email_status,
        }
    finally:
        for path in temp_paths:
            try:
                os.unlink(path)
            except OSError:
                pass


async def _extract_payload(request: Request) -> tuple[dict[str, Any], list[str]]:
    content_type = request.headers.get('content-type', '')
    temp_paths: list[str] = []

    if 'multipart/form-data' in content_type or 'application/x-www-form-urlencoded' in content_type:
        form_data = await request.form()
        payload: dict[str, Any] = {}

        for key, value in form_data.multi_items():
            if isinstance(value, UploadFile):
                suffix = Path(value.filename or '').suffix
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                    temp_file.write(await value.read())
                    temp_paths.append(temp_file.name)
                payload[key] = {
                    'filename': value.filename,
                    'content_type': value.content_type,
                    'temp_path': temp_paths[-1],
                }
            else:
                payload[key] = value

        return payload, temp_paths

    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            raise ValueError('JSON body must be an object')
        return payload, temp_paths
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f'Invalid request payload: {exc}') from exc


def _run_command(prefix: str, payload: dict[str, Any]) -> Any:
    command = os.getenv(f'{prefix}COMMAND', '').strip()
    if not command:
        raise HTTPException(
            status_code=500,
            detail=(
                f'Missing {prefix}COMMAND in backend/.env. '
                'Set it to the command that runs your corresponding Python folder.'
            ),
        )

    timeout = int(os.getenv(f'{prefix}TIMEOUT_SECONDS', '180'))
    command_parts = shlex.split(command)

    child_env = os.environ.copy()
    for key, value in os.environ.items():
        if key.startswith(prefix):
            stripped_key = key[len(prefix):]
            child_env[stripped_key] = value

    try:
        completed = subprocess.run(  # noqa: S603
            command_parts,
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            timeout=timeout,
            env=child_env,
            cwd=str(REPO_ROOT),
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail=f'Runner timed out after {timeout}s') from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=f'Command not found: {command_parts[0]}') from exc

    if completed.returncode != 0:
        stderr = completed.stderr.strip() or 'Runner failed with no stderr output.'
        raise HTTPException(status_code=500, detail=f'Runner error: {stderr}')

    stdout = completed.stdout.strip()
    if not stdout:
        return {'message': 'Runner completed successfully with no output.'}

    try:
        return json.loads(stdout)
    except json.JSONDecodeError:
        lines = [line for line in stdout.splitlines() if line.strip()]
        if lines:
            try:
                return json.loads(lines[-1])
            except json.JSONDecodeError:
                pass
        return {'raw_output': stdout}


def _send_output_email(prefix: str, payload: dict[str, Any], demo_id: str, result: Any) -> dict[str, str]:
    recipient = str(payload.get('email', '')).strip()
    if not recipient:
        return {'status': 'skipped', 'reason': 'No email field in request payload.'}

    demo_env = _get_demo_env_values(prefix)

    smtp_host = _first_non_empty(
        demo_env.get('SMTP_HOST'),
        os.getenv(f'{prefix}SMTP_HOST', ''),
        'smtp.gmail.com',
    )
    smtp_port = int(_first_non_empty(
        demo_env.get('SMTP_PORT'),
        os.getenv(f'{prefix}SMTP_PORT', ''),
        '587',
    ))
    smtp_user = _first_non_empty(
        demo_env.get('SMTP_USER'),
        demo_env.get('EMAIL_USER'),
        os.getenv(f'{prefix}SMTP_USERNAME', ''),
    )
    smtp_password = _first_non_empty(
        demo_env.get('SMTP_PASS'),
        demo_env.get('EMAIL_PASS'),
        os.getenv(f'{prefix}SMTP_PASSWORD', ''),
    )
    # Gmail app passwords are often copied with spaces; normalize before login.
    smtp_password = smtp_password.replace(' ', '')
    smtp_from = _first_non_empty(
        demo_env.get('SMTP_FROM'),
        demo_env.get('EMAIL_FROM'),
        os.getenv(f'{prefix}SMTP_FROM', ''),
        smtp_user,
    )
    use_tls_value = _first_non_empty(
        demo_env.get('SMTP_USE_TLS'),
        os.getenv(f'{prefix}SMTP_USE_TLS', ''),
        'true',
    )
    use_tls = str(use_tls_value).strip().lower() == 'true'

    if not smtp_host or not smtp_user or not smtp_password or not smtp_from:
        return {'status': 'skipped', 'reason': f'Email not configured for {prefix}.'}

    subject = os.getenv(f'{prefix}EMAIL_SUBJECT', f'Smartomation {demo_id} output')
    if isinstance(result, dict):
        subject = str(result.get('email_subject') or subject)
        body = str(result.get('email_body') or result.get('final_report') or result.get('summary_html') or '')
        email_format = str(result.get('email_format') or 'plain').lower()
    else:
        body = ''
        email_format = 'plain'

    if not body:
        body = json.dumps(result, indent=2, ensure_ascii=True)
        email_format = 'plain'

    mime_subtype = 'html' if email_format == 'html' else 'plain'

    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = smtp_from
    message['To'] = recipient
    message.set_content(body, subtype=mime_subtype)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as smtp:
            if use_tls:
                smtp.starttls()
            smtp.login(smtp_user, smtp_password)
            smtp.send_message(message)
    except Exception as exc:  # noqa: BLE001
        return {'status': 'failed', 'reason': str(exc)}

    return {'status': 'sent', 'to': recipient}


def _first_non_empty(*values: Any) -> str:
    for value in values:
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text
    return ''


def _get_demo_env_values(prefix: str) -> dict[str, str]:
    env_path = _resolve_demo_env_path(prefix)
    if not env_path or not env_path.exists():
        return {}

    values = dotenv_values(env_path)
    return {
        str(key): str(value)
        for key, value in values.items()
        if key is not None and value is not None
    }


def _resolve_demo_env_path(prefix: str) -> Path | None:
    explicit = os.getenv(f'{prefix}ENV_FILE', '').strip()
    if explicit:
        explicit_path = Path(explicit)
        if not explicit_path.is_absolute():
            explicit_path = REPO_ROOT / explicit_path
        return explicit_path

    command = os.getenv(f'{prefix}COMMAND', '').strip()
    if not command:
        return None

    parts = shlex.split(command)
    runner_path: Path | None = None
    for part in reversed(parts):
        if part.lower().endswith('.py'):
            candidate = Path(part)
            if not candidate.is_absolute():
                candidate = REPO_ROOT / candidate
            runner_path = candidate
            break

    if runner_path is None:
        return None

    return runner_path.parent / '.env'
