// frontend/src/components/UploadPanel.jsx
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; // Removed useAuth, using prop instead
import "/src/styles/uploadpdf.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ✅ Accept getToken as prop instead of using useAuth internally
export default function UploadPanel({ pdfs, onPdfsChange, onSelectPdf, sessionId, getToken }) {
  const { user } = useUser();
  const userId = user?.id;

  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [viewedPdfUrl, setViewedPdfUrl] = useState(null);
  const [viewedPdfId, setViewedPdfId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isViewingLoading, setIsViewingLoading] = useState(false);

  // Clear PDFs when user changes
  useEffect(() => {
    onPdfsChange([]);
  }, [userId]);

  // Cleanup viewedPdfUrl on unmount
  useEffect(() => {
    return () => {
      if (viewedPdfUrl) URL.revokeObjectURL(viewedPdfUrl);
    };
  }, [viewedPdfUrl]);

  // 🔥 FIXED: Load existing PDFs WITH session_id in URL
  useEffect(() => {
    async function loadExistingPdfs() {
      // ❌ CRITICAL: Must have sessionId to list PDFs
      if (!userId || !sessionId) return;

      try {
        const token = await getToken();
        // 🔥 FIX #1: Added sessionId to URL path
        const res = await fetch(`${API_BASE}/api/pdf/list/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const backendPdfs = data?.pdfs || [];
          onPdfsChange(
            backendPdfs.map((pdf) => ({
              uid: crypto.randomUUID(),
              backendId: pdf.pdf_id,
              name: pdf.filename,
              sizeMB: pdf.size_mb ? pdf.size_mb.toFixed(2) : null,
              status: pdf.status || "Ready",
              url: null,
              ownerId: userId,
            }))
          );
        } else {
          console.error("Failed to load existing PDFs");
        }
      } catch (err) {
        console.error("Error loading PDFs:", err);
      }
    }

    if (userId && sessionId && pdfs.length === 0) {
      loadExistingPdfs();
    }
  }, [getToken, onPdfsChange, userId, sessionId]);

  // Polling for status updates
  useEffect(() => {
    const pollInterval = 5000;

    const pollStatuses = async () => {
      const processingPdfs = pdfs.filter(
        (p) => p.status === "Processing" && p.backendId && p.ownerId === userId
      );
      if (processingPdfs.length === 0) return;

      try {
        const token = await getToken();

        for (const pdf of processingPdfs) {
          // 🔥 FIX #2: Added sessionId to status URL
          const res = await fetch(
            `${API_BASE}/api/pdf/status/${sessionId}/${pdf.backendId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.ok) {
            const updatedPdf = await res.json();
            if (updatedPdf.status && updatedPdf.status !== pdf.status) {
              onPdfsChange((prev) =>
                prev.map((p) =>
                  p.backendId === pdf.backendId
                    ? { ...p, status: updatedPdf.status }
                    : p
                )
              );
            }
          }
        }
      } catch (err) {
        console.error("Status polling error:", err);
      }
    };

    pollStatuses();
    const interval = setInterval(pollStatuses, pollInterval);
    return () => clearInterval(interval);
  }, [pdfs, getToken, onPdfsChange, userId, sessionId]);

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    if (!sessionId) {
      setError("No active session. Please refresh the page.");
      return;
    }

    const pdfsToUpload = Array.from(files).filter(
      (f) => f.type === "application/pdf"
    );
    if (!pdfsToUpload.length) return;

    const optimisticPdfs = pdfsToUpload.map((file) => ({
      uid: crypto.randomUUID(),
      backendId: null,
      name: file.name,
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
      url: URL.createObjectURL(file),
      status: "Uploading",
      ownerId: userId,
    }));

    const uploadedUids = optimisticPdfs.map((p) => p.uid);
    onPdfsChange((prev) => [...prev, ...optimisticPdfs]);

    try {
      setError("");
      setUploadProgress(0);

      const token = await getToken();
      const formData = new FormData();

      pdfsToUpload.forEach((file) => formData.append("files", file));
      formData.append("session_id", sessionId);

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
        setUploadProgress(0);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const backendPdfs = data?.pdfs || [];

            if (backendPdfs.length !== pdfsToUpload.length) {
              setError("Upload response mismatch");
              onPdfsChange((prev) =>
                prev.filter((p) => !uploadedUids.includes(p.uid))
              );
              return;
            }

            backendPdfs.forEach((info, idx) => {
              const uid = uploadedUids[idx];
              onPdfsChange((prev) =>
                prev.map((p) => {
                  if (p.uid === uid) {
                    if (p.url) URL.revokeObjectURL(p.url);
                    return {
                      ...p,
                      ...info,
                      backendId: info.pdf_id,
                      name: info.filename,
                      status: info.status || "Processing",
                      url: null,
                    };
                  }
                  return p;
                })
              );
            });

            const currentUserPdfs = pdfs.filter((p) => p.ownerId === userId);
            if (currentUserPdfs.length === 0 && backendPdfs.length > 0) {
              onSelectPdf(backendPdfs[0].pdf_id);
            }
          } catch (err) {
            console.error(err);
            setError("Failed to parse server response");
            onPdfsChange((prev) =>
              prev.filter((p) => !uploadedUids.includes(p.uid))
            );
          }
        } else {
          let msg = `Upload failed (${xhr.status})`;
          try {
            const data = JSON.parse(xhr.responseText);
            if (data?.error) msg = data.error;
          } catch {}
          setError(msg);
          onPdfsChange((prev) =>
            prev.filter((p) => !uploadedUids.includes(p.uid))
          );
        }
      };

      xhr.onerror = () => {
        setUploadProgress(0);
        setError("Upload failed");
        onPdfsChange((prev) =>
          prev.filter((p) => !uploadedUids.includes(p.uid))
        );
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
      setUploadProgress(0);
      onPdfsChange((prev) =>
        prev.filter((p) => !uploadedUids.includes(p.uid))
      );
    }
  }

  // 🔥 FIX #3: View PDF with session_id in URL
  async function handleView(pdf) {
    setError("");
    setIsViewingLoading(true);

    try {
      if (viewedPdfUrl) URL.revokeObjectURL(viewedPdfUrl);

      let url;

      if (pdf.backendId) {
        const token = await getToken();
        // 🔥 CRITICAL FIX: Added sessionId to URL path
        const res = await fetch(
          `${API_BASE}/api/pdf/view/${sessionId}/${pdf.backendId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to fetch PDF (status: ${res.status})`
          );
        }

        if (!res.headers.get("Content-Type")?.includes("application/pdf")) {
          throw new Error("Invalid content type from server");
        }

        const blob = await res.blob();
        url = URL.createObjectURL(blob);
      } else if (pdf.url) {
        url = pdf.url;
      } else {
        throw new Error("No PDF source available");
      }

      setViewedPdfUrl(url);
      setViewedPdfId(pdf.uid);
    } catch (err) {
      console.error("View error:", err);
      setError(err.message || "Failed to view PDF");
      setViewedPdfUrl(null);
      setViewedPdfId(null);
    } finally {
      setIsViewingLoading(false);
    }
  }

  // 🔥 FIX #4: Delete PDF with session_id in URL
  async function handleRemove(pdf) {
    if (pdf.backendId) {
      try {
        const token = await getToken();
        // 🔥 CRITICAL FIX: Added sessionId to URL path
        const res = await fetch(
          `${API_BASE}/api/pdf/${sessionId}/${pdf.backendId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Failed to delete PDF from server"
          );
        }
      } catch (err) {
        console.error("Delete error:", err);
        setError(err.message || "Failed to delete PDF");
        return;
      }
    }

    if (pdf?.url) URL.revokeObjectURL(pdf.url);

    onPdfsChange((prev) => prev.filter((p) => p.uid !== pdf.uid));

    if (pdf.uid === viewedPdfId) {
      if (viewedPdfUrl) URL.revokeObjectURL(viewedPdfUrl);
      setViewedPdfUrl(null);
      setViewedPdfId(null);
    }
  }

  function handleInputChange(e) {
    handleFiles(Array.from(e.target.files || []));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files || []));
  }

  return (
    <div className="upload-panel-container">
      <h1 className="welcome-title">"Your PDF's now have a brain."</h1>

      <div
        className={`upload-section ${dragOver ? "drag-over" : ""}`}
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
            className="browse-button"
            onClick={() => document.getElementById("pdfUploadInput")?.click()}
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
          hidden
          onChange={handleInputChange}
        />

        {uploadProgress > 0 && (
          <div className="upload-progress">
            <progress value={uploadProgress} max="100" />
            <span>{uploadProgress}%</span>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="files-section">
        <h3 className="files-title">Uploaded Files</h3>
        <ul className="files-list">
          {pdfs
            .filter((pdf) => pdf.ownerId === userId)
            .map((pdf) => (
              <li key={pdf.uid} className="file-row">
                <div className="pdf-icon">📄</div>

                <div className="file-info">
                  <span className="file-name">{pdf.name}</span>
                  <span className="file-size">
                    {pdf.sizeMB && `${pdf.sizeMB} MB`}
                  </span>
                </div>

                <div
                  className={`status-badge ${pdf.status?.toLowerCase() || ""}`}
                >
                  {pdf.status === "Ready" && "✅ Ready"}
                  {pdf.status === "Processing" && "⏳ Processing"}
                  {pdf.status === "Error" && "❌ Error"}
                  {pdf.status === "Uploading" && "⏳ Uploading"}
                </div>

                <button
                  className="view-button"
                  onClick={() => handleView(pdf)}
                  disabled={!pdf.backendId && !pdf.url}
                >
                  View
                </button>

                <button
                  className="remove-button"
                  onClick={() => handleRemove(pdf)}
                >
                  Remove
                </button>
              </li>
            ))}
        </ul>
      </div>

      {viewedPdfUrl && (
        <div className="pdf-viewer-section">
          <div className="viewer-header">
            <h3 className="viewer-title">Viewing PDF</h3>
            <button
              className="close-viewer-button"
              onClick={() => {
                if (viewedPdfUrl) URL.revokeObjectURL(viewedPdfUrl);
                setViewedPdfUrl(null);
                setViewedPdfId(null);
              }}
            >
              Close Viewer
            </button>
          </div>

          {isViewingLoading ? (
            <div className="loading-spinner">Loading PDF...</div>
          ) : (
            <iframe
              src={viewedPdfUrl}
              className="pdf-iframe"
              title="PDF Viewer"
            />
          )}
        </div>
      )}
    </div>
  );
}