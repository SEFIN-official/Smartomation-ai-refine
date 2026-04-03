import io
import logging

logger = logging.getLogger(__name__)


def _extract_with_pymupdf(file_content: bytes) -> str:
    import fitz

    doc = fitz.open(stream=file_content, filetype="pdf")
    try:
        return "".join(page.get_text() for page in doc)
    finally:
        doc.close()


def _extract_with_pypdf(file_content: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(file_content), strict=False)
    chunks = []
    for page in reader.pages:
        chunks.append(page.extract_text() or "")
    return "".join(chunks)


async def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF bytes, preferring PyMuPDF and falling back to pypdf."""
    try:
        text = _extract_with_pymupdf(file_content)
    except Exception:
        try:
            text = _extract_with_pypdf(file_content)
        except Exception:
            text = (
                "This PDF could not be fully parsed by the available extractors. "
                "Please review the uploaded document manually for exact content."
            )

    if not text.strip():
        text = (
            "This PDF did not contain extractable text. "
            "A fallback summary will be generated from the document upload metadata."
        )

    return text
