from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv

load_dotenv(PROJECT_ROOT / '.env')

from main import run_pipeline
from utils.formatter import text_to_html


def _load_payload() -> dict:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    return json.loads(raw)


def _emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=True))


async def main() -> None:
    payload = _load_payload()

    query = str(
        payload.get('query')
        or payload.get('topic')
        or payload.get('prompt')
        or payload.get('chat')
        or ''
    ).strip()
    email = str(payload.get('email', '')).strip()

    if not query:
        raise ValueError('query is required')
    if not email:
        raise ValueError('email is required')

    responses, latency, summary_dict = await run_pipeline(query)
    html_body = text_to_html(
        f"## {summary_dict.get('title', 'Summary')}\n\n"
        + summary_dict.get('overview', '')
        + "\n\n## Key Points\n"
        + "\n".join(f"- {p}" for p in summary_dict.get('key_points', []))
        + "\n\n## Strengths\n"
        + "\n".join(f"- {p}" for p in summary_dict.get('strengths', []))
        + "\n\n## Challenges\n"
        + "\n".join(f"- {p}" for p in summary_dict.get('challenges', []))
        + "\n\n## Conclusion\n"
        + summary_dict.get('conclusion', '')
    )

    result = {
        'status': 'success',
        'input': query,
        'models': responses,
        'latency': latency,
        'final_summary': summary_dict,
        'email': email,
        'email_subject': 'AI Summary Report',
        'email_format': 'html',
        'email_body': html_body,
    }

    _emit(result)


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except Exception as exc:  # noqa: BLE001
        _emit({'status': 'error', 'error': str(exc)})
        raise SystemExit(1) from exc