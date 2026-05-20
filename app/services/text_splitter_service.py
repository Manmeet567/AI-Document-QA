from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_text_into_chunks(text: str) -> list[str]:
    clean_text = text.strip()
    if not clean_text:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_text(clean_text)
    return [chunk.strip() for chunk in chunks if chunk.strip()]
