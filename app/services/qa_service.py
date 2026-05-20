from pathlib import Path

from fastapi import UploadFile

from app.models.schemas import AskQuestionResponse, UploadDocumentResponse
from app.services.deepseek_service import ask_deepseek
from app.services.pdf_service import extract_text_from_pdf, save_uploaded_pdf
from app.services.text_splitter_service import split_text_into_chunks
from app.services.vector_service import search_relevant_chunks, store_document_chunks


def ingest_pdf(file: UploadFile) -> UploadDocumentResponse:
    file_path = save_uploaded_pdf(file)
    text = extract_text_from_pdf(file_path)
    chunks = split_text_into_chunks(text)

    if not chunks:
        raise ValueError("Could not create text chunks from this PDF.")

    filename = Path(file_path).name
    chunks_stored = store_document_chunks(filename=filename, chunks=chunks)

    return UploadDocumentResponse(
        message="PDF uploaded, extracted, chunked, and stored successfully.",
        filename=filename,
        chunks_stored=chunks_stored,
    )


def _build_rag_prompt(question: str, chunks: list[dict]) -> str:
    context = "\n\n".join(
        f"[Source: {chunk['filename']} | Chunk {chunk['chunk_index']}]\n{chunk['text']}"
        for chunk in chunks
    )

    return f"""
You are answering questions about uploaded PDF documents.

Rules:
- Answer only from the context below.
- If the context does not contain the answer, say: "I do not know based on the uploaded document."
- Do not use outside knowledge.
- Keep the answer clear and concise.

Context:
{context}

Question:
{question}

Answer:
""".strip()


def answer_question(question: str) -> AskQuestionResponse:
    clean_question = question.strip()
    if not clean_question:
        raise ValueError("Question cannot be empty.")

    chunks = search_relevant_chunks(clean_question, top_k=4)
    if not chunks:
        return AskQuestionResponse(
            answer="No document chunks were found. Upload a PDF before asking questions.",
            sources=[],
            context_chunks=[],
        )

    prompt = _build_rag_prompt(clean_question, chunks)
    answer = ask_deepseek(prompt)

    sources = []
    for chunk in chunks:
        source = f"{chunk['filename']}#chunk-{chunk['chunk_index']}"
        if source not in sources:
            sources.append(source)

    return AskQuestionResponse(
        answer=answer,
        sources=sources,
        context_chunks=[chunk["text"] for chunk in chunks],
    )
