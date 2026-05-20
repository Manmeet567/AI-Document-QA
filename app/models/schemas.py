from pydantic import BaseModel, Field


class AskQuestionRequest(BaseModel):
    question: str = Field(..., min_length=1)


class AskQuestionResponse(BaseModel):
    answer: str
    sources: list[str]
    context_chunks: list[str]


class UploadDocumentResponse(BaseModel):
    message: str
    filename: str
    chunks_stored: int


class TestAIRequest(BaseModel):
    message: str = Field(..., min_length=1)


class TestAIResponse(BaseModel):
    response: str
