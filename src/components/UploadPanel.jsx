// frontend/src/components/UploadPanel.jsx
import { useState, useEffect } from "react"; // ✅ added useEffect
import { useAuth } from "@clerk/clerk-react";
import "/src/styles/uploadpdf.css";


const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function UploadPanel({ pdfs, onPdfsChange, onSelectPdf }) {
  const { getToken } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [viewedPdfUrl, setViewedPdfUrl] = useState(null); // New state for the PDF URL to view below
  const [viewedPdfId, setViewedPdfId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // New state for upload progress

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

    const pdfsToUpload = Array.from(files).filter(
      (f) => f.type === "application/pdf"
    );
    if (!pdfsToUpload.length) return;

    try {
      setError("");
      setUploadProgress(0); // Reset progress
      const token = await getToken();

      const formData = new FormData();
      pdfsToUpload.forEach((file) => {
        formData.append("files", file);
      });

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/api/pdf/upload`, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setUploadProgress(0); // Reset on complete
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText); // { pdfs: [...] }
            const backendPdfs = data?.pdfs || [];
            const mapped = backendPdfs.map((info, idx) => {
              const file = pdfsToUpload[idx];
              return {
                ...info,
                sizeMB: (file.size / 1024 / 1024).toFixed(2),
                url: URL.createObjectURL(file),
              };
            });
            onPdfsChange((prev) => [...prev, ...mapped]);
            if (pdfs.length === 0 && mapped.length > 0) {
              onSelectPdf(mapped[0].id);
            }
          } catch (err) {
            console.error(err);
            setError("Failed to parse response");
          }
        } else {
          let msg = `Upload failed (${xhr.status})`;
          try {
            const data = JSON.parse(xhr.responseText);
            if (data?.error) msg = data.error;
          } catch (_) {}
          setError(msg);
        }
      };

      xhr.onerror = () => {
        setUploadProgress(0);
        setError("Upload failed");
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
      setUploadProgress(0);
    }
  }

  // Updated handleView to set the PDF URL for viewing below instead of navigating
  async function handleView(pdf) {
    try {
      if (viewedPdfUrl) {
        URL.revokeObjectURL(viewedPdfUrl);
      }
      let url;
      if (pdf.url) {
        url = pdf.url;
      } else {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/pdf/${pdf.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch PDF');
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
      }
      setViewedPdfUrl(url); // Set the URL to display below
      setViewedPdfId(pdf.id);
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

  function handleRemove(id) {
    const pdfToRemove = pdfs.find((p) => p.id === id);
    if (pdfToRemove?.url) {
      URL.revokeObjectURL(pdfToRemove.url);
    }
    onPdfsChange(pdfs.filter((p) => p.id !== id));
    if (id === viewedPdfId) {
      if (viewedPdfUrl) {
        URL.revokeObjectURL(viewedPdfUrl);
      }
      setViewedPdfUrl(null);
      setViewedPdfId(null);
    }
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

        {uploadProgress > 0 && (
          <div className="upload-progress">
            <progress value={uploadProgress} max="100"></progress>
            <span>{uploadProgress}%</span>
          </div>
        )}

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
            <li key={pdf.id || index} className="file-row">
              <div className="pdf-icon">📄</div>
              <div className="file-info">
                <span className="file-name">{pdf.name || `PDF ${index + 1}`}</span>
                <span className="file-size">{pdf.sizeMB ? `${pdf.sizeMB} MB` : ''}</span>
              </div>
              <div className={`status-badge ${pdf.status?.toLowerCase() || ''}`}>
                {pdf.status === 'Ready' && '✅ Ready'}
                {pdf.status === 'Processing' && '⏳ Processing'}
                {pdf.status === 'Error' && '❌ Error'}
              </div>
              <button className="view-button" onClick={() => handleView(pdf)}>
                View
              </button>
              <button className="remove-button" onClick={() => handleRemove(pdf.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* New section to display the PDF below */}
      {viewedPdfUrl && (
        <div className="pdf-viewer-section">
          <h3 className="viewer-title">Viewing PDF</h3>
          <iframe
            src={viewedPdfUrl}
            className="pdf-iframe"
            title="PDF Viewer"
          ></iframe>
          <button className="close-viewer-button" onClick={() => setViewedPdfUrl(null)}>
            Close Viewer
          </button>
        </div>
      )}
    </div>
  );
}