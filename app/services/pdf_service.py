import shutil
from pathlib import Path

from fastapi import UploadFile
from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.core.config import settings


def _safe_filename(filename: str) -> str:
    return Path(filename).name.replace(" ", "_")


def save_uploaded_pdf(file: UploadFile) -> str:
    filename = _safe_filename(file.filename or "")
    if not filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are allowed.")

    destination = settings.UPLOAD_DIR / filename
    file.file.seek(0)

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return str(destination)


def extract_text_from_pdf(file_path: str) -> str:
    try:
        reader = PdfReader(file_path)
    except (PdfReadError, OSError) as exc:
        raise ValueError(f"Could not read PDF file: {exc}") from exc

    page_texts: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            page_texts.append(text.strip())

    full_text = "\n\n".join(page_texts).strip()
    if not full_text:
        raise ValueError("This PDF has no extractable text.")

    return full_text
