from typing import Any

import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from chromadb.utils.embedding_functions.onnx_mini_lm_l6_v2 import ONNXMiniLM_L6_V2

from app.core.config import settings


# Chroma's default embedding function is local/free and uses an ONNX MiniLM model.
# Keep its model cache inside the project so setup is portable on Windows.
ONNXMiniLM_L6_V2.DOWNLOAD_PATH = (
    settings.CHROMA_DIR / "onnx_models" / ONNXMiniLM_L6_V2.MODEL_NAME
)
embedding_function = DefaultEmbeddingFunction()
client = chromadb.PersistentClient(path=str(settings.CHROMA_DIR))


def _get_collection():
    return client.get_or_create_collection(
        name=settings.COLLECTION_NAME,
        embedding_function=embedding_function,
    )


def store_document_chunks(filename: str, chunks: list[str]) -> int:
    clean_chunks = [chunk.strip() for chunk in chunks if chunk.strip()]
    if not clean_chunks:
        return 0

    collection = _get_collection()

    # Re-uploading the same filename replaces that document's old chunks.
    collection.delete(where={"filename": filename})

    ids = [f"{filename}:chunk:{index}" for index in range(len(clean_chunks))]
    metadatas = [
        {"filename": filename, "chunk_index": index}
        for index in range(len(clean_chunks))
    ]

    collection.upsert(
        ids=ids,
        documents=clean_chunks,
        metadatas=metadatas,
    )

    return len(clean_chunks)


def search_relevant_chunks(question: str, top_k: int = 4) -> list[dict[str, Any]]:
    clean_question = question.strip()
    if not clean_question:
        return []

    collection = _get_collection()
    if collection.count() == 0:
        return []

    result = collection.query(
        query_texts=[clean_question],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]

    chunks: list[dict[str, Any]] = []
    for index, text in enumerate(documents):
        metadata = metadatas[index] if index < len(metadatas) else {}
        distance = distances[index] if index < len(distances) else None
        chunks.append(
            {
                "text": text,
                "filename": metadata.get("filename", "unknown"),
                "chunk_index": metadata.get("chunk_index", index),
                "distance": distance,
            }
        )

    return chunks


def reset_vector_store() -> None:
    try:
        client.delete_collection(name=settings.COLLECTION_NAME)
    except Exception as exc:
        if "does not exist" not in str(exc).lower():
            raise
