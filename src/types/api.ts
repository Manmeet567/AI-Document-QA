export type HealthResponse = {
  status: string;
  key_loaded: boolean;
  model: string;
  directories: {
    uploads: string;
    chroma: string;
  };
};

export type UploadDocumentResponse = {
  message: string;
  filename: string;
  chunks_stored: number;
};

export type AskQuestionResponse = {
  answer: string;
  sources: string[];
  context_chunks: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};
