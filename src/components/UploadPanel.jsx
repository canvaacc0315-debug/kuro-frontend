// frontend/src/components/UploadPanel.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import "/src/styles/uploadpdf.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function UploadPanel({ pdfs, onPdfsChange, onSelectPdf }) {
  const { getToken } = useAuth();

  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [viewedPdfUrl, setViewedPdfUrl] = useState(null);
  const [viewedPdfId, setViewedPdfId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Clear uploaded files on refresh
  useEffect(() => {
    onPdfsChange([]);
    localStorage.removeItem("rovex_uploaded_pdfs");
  }, []);

  async function handleFiles(files) {
    if (!files || files.length === 0) return;

    const pdfsToUpload = Array.from(files).filter(
      (f) => f.type === "application/pdf"
    );
    if (!pdfsToUpload.length) return;

    // Optimistic update: Add temporary PDFs to the list
    const optimisticPdfs = pdfsToUpload.map((file) => ({
      uid: crypto.randomUUID(),
      backendId: null,
      name: file.name,
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
      url: URL.createObjectURL(file),
      status: "Uploading",
    }));

    const uploadedUids = optimisticPdfs.map((p) => p.uid);

    onPdfsChange((prev) => [...prev, ...optimisticPdfs]);

    try {
      setError("");
      setUploadProgress(0);

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
          const percent = Math.round(
            (event.loaded / event.total) * 100
          );
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
                    return {
                      ...p,
                      ...info,
                      backendId: info.id || info._id || null,
                      status: info.status || "Processing",
                    };
                  }
                  return p;
                })
              );
            });

            if (pdfs.length === 0 && backendPdfs.length > 0) {
              onSelectPdf(backendPdfs[0].id || backendPdfs[0]._id);
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
        const res = await fetch(`${API_BASE}/api/pdf/${pdf.backendId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch PDF");

        const blob = await res.blob();
        url = URL.createObjectURL(blob);
      }

      setViewedPdfUrl(url);
      setViewedPdfId(pdf.uid);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to view PDF");
    }
  }

  function handleRemove(pdf) {
    if (pdf?.url) {
      URL.revokeObjectURL(pdf.url);
    }

    onPdfsChange((prev) =>
      prev.filter((p) => p.uid !== pdf.uid)
    );

    if (pdf.uid === viewedPdfId) {
      if (viewedPdfUrl) {
        URL.revokeObjectURL(viewedPdfUrl);
      }
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
      <h1 className="welcome-title">“Your PDFs now have a brain.”</h1>

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
            onClick={() =>
              document.getElementById("pdfUploadInput")?.click()
            }
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
          {pdfs.map((pdf) => (
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
                URL.revokeObjectURL(viewedPdfUrl);
                setViewedPdfUrl(null);
                setViewedPdfId(null);
              }}
            >
              Close Viewer
            </button>
          </div>

          <iframe
            src={viewedPdfUrl}
            className="pdf-iframe"
            title="PDF Viewer"
          />
        </div>
      )}
    </div>
  );
}