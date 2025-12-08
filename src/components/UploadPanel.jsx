// frontend/src/components/UploadPanel.jsx
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function UploadPanel({ pdfs, onPdfsChange, onSelectPdf }) {
  const { getToken } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files) {
    if (!files || files.length === 0) return;

    try {
      setError("");
      const token = await getToken();

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file); // field name must match your FastAPI route
      });

      const res = await fetch(`${API_BASE}/api/pdf/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        let msg = `Upload failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch (_) {}
        throw new Error(msg);
      }

      const data = await res.json(); // expect { pdfs: [...] }
      onPdfsChange((prev) => [...prev, ...data.pdfs]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    }
  }

  function handleInputChange(e) {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    handleFiles(files); // ✅ fixed (was uploadFiles)
  }

  return (
    <div
      className={"upload-area" + (dragOver ? " drag-over" : "")}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById("pdfUploadInput")?.click()}
    >
      <div className="upload-icon">📁</div>
      <div className="upload-title">Drag &amp; Drop PDFs Here</div>
      <div className="upload-desc">
        Or click to browse from your computer. Supports multiple files.
      </div>

      <button
        type="button"
        className="upload-btn"
        onClick={(e) => {
          e.stopPropagation();
          document.getElementById("pdfUploadInput")?.click();
        }}
      >
        Select PDFs
      </button>

      <input
        id="pdfUploadInput"
        type="file"
        accept=".pdf"
        multiple
        style={{ display: "none" }}
        onChange={handleInputChange}
      />

      {error && (
        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#ff6b6b",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}