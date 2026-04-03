from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv

load_dotenv(PROJECT_ROOT / '.env')

from services.ai_service import summarize_document
from services.pdf_service import extract_text_from_pdf


def _load_payload() -> dict:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    return json.loads(raw)


def _emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=True))


async def main() -> None:
    payload = _load_payload()

    email = str(payload.get('email', '')).strip()
    document = payload.get('document') or {}
    if not isinstance(document, dict):
        document = {}

    temp_path = str(document.get('temp_path') or payload.get('file_path') or '').strip()
    filename = str(document.get('filename') or payload.get('filename') or '').strip()
    content_type = str(document.get('content_type') or payload.get('content_type') or '').strip().lower()

    if not email:
        raise ValueError('email is required')
    if not temp_path:
        raise ValueError('document.temp_path is required')
    if filename and not filename.lower().endswith('.pdf') and content_type != 'application/pdf':
        raise ValueError('Only PDF files are supported')

    file_content = Path(temp_path).read_bytes()
    text = await extract_text_from_pdf(file_content)
    html_summary = await summarize_document(text)

    result = {
        'status': 'success',
        'email': email,
        'source_file': filename,
        'summary_html': html_summary,
        'email_subject': 'Here is your Summary !!',
        'email_format': 'html',
        'email_body': html_summary,
    }

    _emit(result)


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except Exception as exc:  # noqa: BLE001
        _emit({'status': 'error', 'error': str(exc)})
        raise SystemExit(1) from exc