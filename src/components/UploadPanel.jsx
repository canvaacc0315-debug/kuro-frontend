// frontend/src/components/UploadPanel.jsx
import { useState, useEffect } from "react"; // ✅ added useEffect
import { useAuth } from "@clerk/clerk-react";
import "/src/styles/uploadpdf.css";


const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function UploadPanel({ pdfs, onPdfsChange, onSelectPdf }) {
  const { getToken } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  // ✅ ADDITION 1: restore PDFs on first load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rovex_uploaded_pdfs");
      if (stored) {
        onPdfsChange(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ ADDITION 2: persist PDFs whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "rovex_uploaded_pdfs",
        JSON.stringify(pdfs)
      );
    } catch {
      // ignore
    }
  }, [pdfs]);

  async function handleFiles(files) {
    if (!files || files.length === 0) return;

    try {
      setError("");
      const token = await getToken();

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
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

      const data = await res.json(); // { pdfs: [...] }
      onPdfsChange((prev) => [...prev, ...data.pdfs]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    }
  }

  // Assume pdf object from server includes 'id' for fetching the PDF
  async function handleView(pdf) {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/pdf/${pdf.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.location.href = url; // Open in same tab
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to view PDF");
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
    handleFiles(files);
  }

  function handleRemove(index) {
    onPdfsChange(pdfs.filter((_, i) => i !== index));
  }

  return (
    <div className="upload-panel-container">
      <h1 className="welcome-title">Welcome to RovexAI</h1>
      <div
        className={"upload-section" + (dragOver ? " drag-over" : "")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="drag-drop-card">
          <div className="cloud-icon">☁️↑</div>
          <p className="drag-text">Drag & drop your PDFs</p>
          <p className="or-text">— or —</p>
          <button
            type="button"
            className="browse-button"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("pdfUploadInput")?.click();
            }}
          >
            Browse Files
          </button>
          <p className="subtext">PDF only · Multiple files supported</p>
        </div>

        <input
          id="pdfUploadInput"
          type="file"
          accept=".pdf"
          multiple
          style={{ display: "none" }}
          onChange={handleInputChange}
        />

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      </div>

      <div className="files-section">
        <h3 className="files-title">Uploaded Files</h3>
        <ul className="files-list">
          {pdfs.map((pdf, index) => (
            <li key={index} className="file-row">
              <div className="pdf-icon">📄</div>
              <span className="file-name">{pdf.name}</span>
              <div className={`status-badge ${pdf.status?.toLowerCase() || ''}`}>
                {pdf.status === 'Ready' && '✅ Ready'}
                {pdf.status === 'Processing' && '⏳ Processing'}
                {pdf.status === 'Error' && '❌ Error'}
              </div>
              {pdf.status === 'Ready' && (
                <button className="view-button" onClick={() => handleView(pdf)}>
                  View
                </button>
              )}
              <button className="remove-button" onClick={() => handleRemove(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button className="view-pdfs-button" onClick={onSelectPdf}>
          View PDFs →
        </button>
      </div>
    </div>
  );
}