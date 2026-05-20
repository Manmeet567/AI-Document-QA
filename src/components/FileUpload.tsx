import type { UploadDocumentResponse } from "../types/api";

type FileUploadProps = {
  selectedFile: File | null;
  uploadResult: UploadDocumentResponse | null;
  isUploading: boolean;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
};

export function FileUpload({
  selectedFile,
  uploadResult,
  isUploading,
  disabled,
  onFileChange,
  onUpload,
}: FileUploadProps) {
  return (
    <section className="panel upload-panel">
      <div className="section-heading">
        <p className="eyebrow">Document</p>
        <h2>Upload PDF</h2>
      </div>

      <label className="file-drop">
        <input
          type="file"
          accept="application/pdf,.pdf"
          disabled={disabled}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <span className="file-title">
          {selectedFile ? selectedFile.name : "Choose a PDF document"}
        </span>
        <span className="file-subtitle">
          {selectedFile
            ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
            : "The backend extracts, chunks, and stores it for RAG search."}
        </span>
      </label>

      {isUploading && (
        <div className="progress-wrap" aria-label="Uploading PDF">
          <div className="progress-bar" />
        </div>
      )}

      {uploadResult && (
        <div className="success-box">
          <strong>{uploadResult.filename}</strong>
          <span>{uploadResult.chunks_stored} chunks stored</span>
        </div>
      )}

      <button
        className="primary-button"
        type="button"
        disabled={!selectedFile || disabled}
        onClick={onUpload}
      >
        {isUploading ? "Uploading..." : "Upload PDF"}
      </button>
    </section>
  );
}
