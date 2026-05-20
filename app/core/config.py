import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    DEEPSEEK_API_KEY: str
    DEEPSEEK_BASE_URL: str
    DEEPSEEK_MODEL: str
    UPLOAD_DIR: Path
    CHROMA_DIR: Path
    COLLECTION_NAME: str


settings = Settings(
    DEEPSEEK_API_KEY=os.getenv("DEEPSEEK_API_KEY", ""),
    DEEPSEEK_BASE_URL=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    DEEPSEEK_MODEL=os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
    UPLOAD_DIR=Path(os.getenv("UPLOAD_DIR", "data/uploads")),
    CHROMA_DIR=Path(os.getenv("CHROMA_DIR", "data/chroma")),
    COLLECTION_NAME=os.getenv("COLLECTION_NAME", "document_qa_collection"),
)

settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.CHROMA_DIR.mkdir(parents=True, exist_ok=True)
