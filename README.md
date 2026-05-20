# AI Document Q&A System

A beginner-friendly FastAPI project that lets you upload PDF documents, store their content in a local Chroma vector database, and ask questions using Retrieval-Augmented Generation (RAG) with DeepSeek.

## What It Does

- Upload a PDF through an API endpoint.
- Extract text from every readable PDF page.
- Split the text into overlapping chunks.
- Store chunks in ChromaDB with local/free embeddings.
- Search for the most relevant chunks when a user asks a question.
- Send only the retrieved context to DeepSeek using the OpenAI-compatible SDK.
- Return an answer with source chunks.

## Why It Matters

Document Q&A is a practical AI workflow used in support tools, knowledge bases, legal review, research assistants, and internal company search. This project shows the full RAG pipeline in a clean, production-style FastAPI structure without hardcoded secrets.

## Tech Stack

- Python 3.14.5
- FastAPI
- Uvicorn
- React
- TypeScript
- Vite
- DeepSeek Chat API through the OpenAI SDK
- ChromaDB persistent vector storage
- Chroma default local embedding function
- LangChain text splitter
- pypdf
- python-dotenv
- Pydantic

## Architecture Flow

1. User uploads a PDF to `POST /documents/upload`.
2. The PDF is saved in `data/uploads`.
3. Text is extracted with `pypdf`.
4. Text is split into chunks with `RecursiveCharacterTextSplitter`.
5. Chunks are embedded and stored in ChromaDB at `data/chroma`.
6. User asks a question with `POST /documents/ask`.
7. ChromaDB retrieves relevant chunks.
8. A strict RAG prompt is sent to DeepSeek.
9. The API returns the answer, sources, and context chunks.

## Setup on Windows

Create and activate a virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Create your `.env` file:

```powershell
copy .env.example .env
```

Edit `.env` and add your DeepSeek API key:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

Run the API:

```powershell
uvicorn app.main:app --reload --port 8000
```

Open the interactive docs:

```text
http://127.0.0.1:8000/docs
```

## Run Backend and Frontend Together

Terminal 1: start the FastAPI backend.

```powershell
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Terminal 2: install and start the Vite frontend.

```powershell
npm install
npm run dev
```

Open the frontend:

```text
http://localhost:5173
```

The frontend calls the backend at `http://127.0.0.1:8000` by default. To use a different backend URL, create a `.env.local` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## API Endpoints

### `GET /`

Returns app name and status.

### `GET /health`

Returns service health, whether the DeepSeek key is loaded, active model, and storage directories.

### `POST /test-ai`

Tests DeepSeek directly.

Request:

```json
{
  "message": "Say hello in one sentence."
}
```

### `POST /documents/upload`

Uploads and ingests a PDF using `multipart/form-data`.

Field:

```text
file: your-document.pdf
```

### `POST /documents/ask`

Asks a question against uploaded document chunks.

Request:

```json
{
  "question": "What is this document about?"
}
```

### `DELETE /documents/reset`

Deletes the Chroma collection so you can start fresh.

## Sample Curl Usage

Health check:

```powershell
curl http://127.0.0.1:8000/health
```

Test DeepSeek:

```powershell
curl -X POST http://127.0.0.1:8000/test-ai -H "Content-Type: application/json" -d "{\"message\":\"Explain RAG in one sentence.\"}"
```

Upload a PDF:

```powershell
curl -X POST http://127.0.0.1:8000/documents/upload -F "file=@C:\path\to\document.pdf"
```

Ask a question:

```powershell
curl -X POST http://127.0.0.1:8000/documents/ask -H "Content-Type: application/json" -d "{\"question\":\"What are the main points?\"}"
```

Reset documents:

```powershell
curl -X DELETE http://127.0.0.1:8000/documents/reset
```

## Future Improvements

- Add authentication.
- Add support for multiple file types.
- Add document listing and per-document deletion.
- Add streaming responses.
- Add drag-and-drop upload and conversation export.
- Add tests for services and API routes.
