import { useEffect, useMemo, useState } from "react";

import { askQuestion, getHealth, resetDocuments, uploadPdf } from "./api/client";
import { ChatArea } from "./components/ChatArea";
import { FileUpload } from "./components/FileUpload";
import { QuestionBox } from "./components/QuestionBox";
import { ResetButton } from "./components/ResetButton";
import { StatusBar } from "./components/StatusBar";
import type { ChatMessage, HealthResponse, UploadDocumentResponse } from "./types/api";

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadDocumentResponse | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const isBusy = isUploading || isAsking || isResetting;
  const hasDocument = Boolean(uploadResult);

  useEffect(() => {
    getHealth()
      .then((response) => {
        setHealth(response);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message || "Could not reach the backend.");
      });
  }, []);

  const subtitle = useMemo(() => {
    if (uploadResult) {
      return `${uploadResult.filename} is ready for questions.`;
    }
    return "Upload a PDF and ask questions powered by your FastAPI RAG backend.";
  }, [uploadResult]);

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    setError(null);
    setNotice(null);
    setIsUploading(true);

    try {
      const response = await uploadPdf(selectedFile);
      setUploadResult(response);
      setMessages([]);
      setNotice(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAsk() {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      return;
    }

    setError(null);
    setNotice(null);
    setQuestion("");
    setIsAsking(true);

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: cleanQuestion,
    };

    setMessages((current) => [...current, userMessage]);

    try {
      const response = await askQuestion(cleanQuestion);
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Question failed.");
    } finally {
      setIsAsking(false);
    }
  }

  async function handleReset() {
    setError(null);
    setNotice(null);
    setIsResetting(true);

    try {
      const response = await resetDocuments();
      setSelectedFile(null);
      setUploadResult(null);
      setQuestion("");
      setMessages([]);
      setNotice(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">RAG PDF Assistant</p>
          <h1>AI Document Q&A</h1>
          <p>{subtitle}</p>
        </div>
        <ResetButton isResetting={isResetting} disabled={isBusy} onReset={handleReset} />
      </header>

      <StatusBar health={health} error={error} />

      {(error || notice) && (
        <div className={error ? "alert error" : "alert success"} role="status">
          {error || notice}
        </div>
      )}

      <div className="workspace">
        <FileUpload
          selectedFile={selectedFile}
          uploadResult={uploadResult}
          isUploading={isUploading}
          disabled={isBusy}
          onFileChange={setSelectedFile}
          onUpload={handleUpload}
        />

        <section className="panel qa-panel">
          <div className="section-heading">
            <p className="eyebrow">Question</p>
            <h2>Ask the document</h2>
          </div>
          <ChatArea messages={messages} isAsking={isAsking} />
          <QuestionBox
            question={question}
            isAsking={isAsking}
            disabled={isBusy || !hasDocument}
            onQuestionChange={setQuestion}
            onAsk={handleAsk}
          />
        </section>
      </div>
    </main>
  );
}
