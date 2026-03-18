// frontend/src/components/UploadPanel.jsx
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, Clock, AlertCircle, Eye, Trash2, X } from "lucide-react";
import "/src/styles/uploadpdf.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Animation Variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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

  // Load existing PDFs
  useEffect(() => {
    async function loadExistingPdfs() {
      if (!userId || !sessionId) return;
      try {
        const token = await getToken();
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
    if (!pdfsToUpload.length) {
      setError("Only PDF files are supported");
      return;
    }

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
        setError("Upload failed due to a network error");
        onPdfsChange((prev) =>
          prev.filter((p) => !uploadedUids.includes(p.uid))
        );
      };

      xhr.send(formData);
    } catch (err) {
      setError(err.message || "Upload failed");
      setUploadProgress(0);
      onPdfsChange((prev) =>
        prev.filter((p) => !uploadedUids.includes(p.uid))
      );
    }
  }

  async function handleView(pdf) {
    setError("");
    setIsViewingLoading(true);
    try {
      if (viewedPdfUrl) URL.revokeObjectURL(viewedPdfUrl);
      let url;

      if (pdf.backendId) {
        const token = await getToken();
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

  async function handleRemove(pdf) {
    if (pdf.backendId) {
      try {
        const token = await getToken();
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

  const userPdfs = pdfs.filter((pdf) => pdf.ownerId === userId);

  return (
    <motion.div 
      className="upload-panel-container"
      variants={containerVariant}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariant} className="upload-header-text">
        <h1 className="welcome-title">Your PDFs now have a <span className="text-gradient">brain</span>.</h1>
        <p className="welcome-subtitle">Drop a PDF to instantly chat, summarize, and extract data.</p>
      </motion.div>

      <motion.div 
        variants={itemVariant}
        className={`upload-section ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Decorative background glow orb inside drop area */}
        <div className="upload-glow-orb" />

        <div className="drag-drop-card">
          <motion.div 
            className="cloud-container"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <UploadCloud size={60} className="cloud-icon stroke-accent" />
          </motion.div>
          <h2 className="drag-text">Drag & drop your PDFs here</h2>
          <p className="or-text">or</p>

          <button
            className="browse-button glass-btn"
            onClick={() => document.getElementById("pdfUploadInput")?.click()}
          >
            Browse Files
          </button>

          <p className="subtext">Supports PDF format up to 50MB. Multiple files allowed.</p>
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
          <div className="upload-progress-wrapper">
            <div className="upload-progress-info">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="upload-progress-bar">
               <motion.div 
                 className="progress-fill" 
                 initial={{ width: 0 }} 
                 animate={{ width: `${uploadProgress}%` }} 
               />
            </div>
          </div>
        )}

        {error && (
          <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="error-message">
            <AlertCircle size={14} className="error-icon" /> {error}
          </motion.p>
        )}
      </motion.div>

      {userPdfs.length > 0 && (
        <motion.div variants={itemVariant} className="files-section">
          <div className="files-header">
            <h3 className="files-title">Your Documents</h3>
            <span className="file-count">{userPdfs.length} file{userPdfs.length !== 1 && 's'}</span>
          </div>
          
          <ul className="files-list">
            <AnimatePresence>
              {userPdfs.map((pdf) => (
                <motion.li 
                  key={pdf.uid} 
                  className="file-row"
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  layout
                >
                  <div className="pdf-icon-wrapper">
                    <FileText size={24} className="pdf-icon" />
                  </div>

                  <div className="file-info">
                    <span className="file-name" title={pdf.name}>{pdf.name}</span>
                    <span className="file-size">{pdf.sizeMB ? `${pdf.sizeMB} MB` : "Unknown Size"}</span>
                  </div>

                  <div className={`status-badge ${pdf.status?.toLowerCase() || ""}`}>
                    {pdf.status === "Ready" && <><CheckCircle size={14} /> Ready</>}
                    {pdf.status === "Processing" && <><Clock size={14} className="spin-icon" /> Processing</>}
                    {pdf.status === "Uploading" && <><UploadCloud size={14} className="pulse-icon" /> Uploading</>}
                    {pdf.status === "Error" && <><X size={14} /> Error</>}
                  </div>

                  <div className="file-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleView(pdf)}
                      disabled={!pdf.backendId && !pdf.url}
                      title="View Document"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="action-btn remove-btn"
                      onClick={() => handleRemove(pdf)}
                      title="Remove Document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      )}

      {/* PDF Viewer Portal/Modal */}
      <AnimatePresence>
        {viewedPdfUrl && (
          <motion.div 
            className="pdf-viewer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="pdf-viewer-modal"
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="viewer-header-glass">
                <h3 className="viewer-title">
                  <FileText size={18} />
                  {pdfs.find(p => p.uid === viewedPdfId)?.name || "Document Preview"}
                </h3>
                <button
                  className="close-viewer-btn"
                  onClick={() => {
                    if (viewedPdfUrl) URL.revokeObjectURL(viewedPdfUrl);
                    setViewedPdfUrl(null);
                    setViewedPdfId(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="viewer-content">
                {isViewingLoading ? (
                  <div className="loading-spinner-container">
                    <div className="loader-ring"></div>
                    <p>Loading document securely...</p>
                  </div>
                ) : (
                  <iframe
                    src={viewedPdfUrl}
                    className="pdf-iframe"
                    title="PDF Viewer"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}