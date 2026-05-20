from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.models.schemas import (
    AskQuestionRequest,
    AskQuestionResponse,
    TestAIRequest,
    TestAIResponse,
    UploadDocumentResponse,
)
from app.services.deepseek_service import ask_deepseek
from app.services.qa_service import answer_question, ingest_pdf
from app.services.vector_service import reset_vector_store


router = APIRouter()


def _to_http_error(exc: Exception) -> HTTPException:
    if isinstance(exc, ValueError):
        return HTTPException(status_code=400, detail=str(exc))
    return HTTPException(status_code=500, detail=str(exc))


@router.get("/health")
def health_check() -> dict:
    return {
        "status": "healthy",
        "key_loaded": bool(settings.DEEPSEEK_API_KEY),
        "model": settings.DEEPSEEK_MODEL,
        "directories": {
            "uploads": str(settings.UPLOAD_DIR),
            "chroma": str(settings.CHROMA_DIR),
        },
    }


@router.post("/test-ai", response_model=TestAIResponse)
def test_ai(payload: TestAIRequest) -> TestAIResponse:
    try:
        response = ask_deepseek(payload.message)
    except Exception as exc:
        raise _to_http_error(exc) from exc

    return TestAIResponse(response=response)


@router.post("/documents/upload", response_model=UploadDocumentResponse)
def upload_document(file: UploadFile = File(...)) -> UploadDocumentResponse:
    try:
        return ingest_pdf(file)
    except Exception as exc:
        raise _to_http_error(exc) from exc


@router.post("/documents/ask", response_model=AskQuestionResponse)
def ask_document_question(payload: AskQuestionRequest) -> AskQuestionResponse:
    try:
        return answer_question(payload.question)
    except Exception as exc:
        raise _to_http_error(exc) from exc


@router.delete("/documents/reset")
def reset_documents() -> dict[str, str]:
    try:
        reset_vector_store()
    except Exception as exc:
        raise _to_http_error(exc) from exc

    return {"message": "Vector store reset successfully."}
