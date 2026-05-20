import type {
  AskQuestionResponse,
  HealthResponse,
  UploadDocumentResponse,
} from "../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : "Request failed. Please try again.";
    throw new Error(detail);
  }

  return data as T;
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return parseJsonResponse<HealthResponse>(response);
}

export async function uploadPdf(file: File): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  return parseJsonResponse<UploadDocumentResponse>(response);
}

export async function askQuestion(question: string): Promise<AskQuestionResponse> {
  const response = await fetch(`${API_BASE_URL}/documents/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  return parseJsonResponse<AskQuestionResponse>(response);
}

export async function resetDocuments(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/documents/reset`, {
    method: "DELETE",
  });

  return parseJsonResponse<{ message: string }>(response);
}
