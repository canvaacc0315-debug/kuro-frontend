import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import { useAuth } from "@clerk/clerk-react";
import {
  Upload,
  ScanSearch,
  FileText,
  FileSpreadsheet,
  FileDown,
  Clipboard,
  RefreshCw,
  Sparkles,
  Check,
  AlertCircle,
  FileUp
} from "lucide-react";
import "/src/styles/ocr-override.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://canvaacc0315-debug-canvaacc0315-debug.hf.space";

export default function OcrPanel() {
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const { getToken } = useAuth();
  const fileInputRef = useRef(null);

  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  /* ================= SESSION MANAGEMENT ================= */
  async function startSession() {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/session/start`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      setSessionId(data.session_id);
      return data.session_id;
    } catch (err) {
      console.error("Failed to start session:", err);
      return "";
    }
  }

  useState(() => {
    startSession();
  }, []);

  /* ================= FILE UPLOAD ================= */
  async function handleFiles(inputFiles) {
    const file = inputFiles[0];
    if (!file) return;
    if (!file.type.includes("pdf")) {
      alert("Only PDF supported");
      return;
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await startSession();
    }

    setFiles([file]);
    setSelectedFileIndex(0);
    setOcrResult("");

    const formData = new FormData();
    formData.append("files", file);
    formData.append("session_id", currentSessionId);

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/pdf/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      if (data.pdfs && data.pdfs.length > 0) {
        file.pdf_id = data.pdfs[0].pdf_id;
        file.backendId = data.pdfs[0].pdf_id;
        file.status = data.pdfs[0].status;
      } else {
        throw new Error("No PDF data in response");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.message || "Failed to upload PDF");
      setFiles([]);
      setSelectedFileIndex(null);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) handleFiles(droppedFiles);
  }

  function handleDragOver(e) { e.preventDefault(); }
  function handleDragEnter(e) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e) { e.preventDefault(); setIsDragging(false); }

  /* ================= OCR ================= */
  async function startOcr() {
    if (!selectedFile?.pdf_id) { alert("Please upload a PDF first"); return; }
    if (!sessionId) { alert("No active session. Please refresh the page."); return; }

    setIsRunning(true);
    setProgress(15);
    setOcrResult("");

    const formData = new FormData();
    formData.append("pdf_id", selectedFile.pdf_id);
    formData.append("session_id", sessionId);
    formData.append("output_format", "text");

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/pdf/ocr`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `OCR failed: ${res.status}`);
      }

      const data = await res.json();
      setOcrResult(data.text || data.result || "No text extracted");
      setProgress(100);
    } catch (err) {
      console.error("OCR error:", err);
      setOcrResult(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }

  /* ================= EXPORT ACTIONS ================= */
  function downloadTxt() {
    const blob = new Blob([ocrResult], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function downloadCsv() {
    const blob = new Blob(["text\n" + ocrResult], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function downloadPdf() {
    const doc = new jsPDF("p", "mm", "a4");
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const lines = doc.splitTextToSize(ocrResult, pageWidth - margin * 2);
    let y = margin;
    lines.forEach((line) => {
      if (y > pageHeight - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 7;
    });
    doc.save("ocr-result.pdf");
  }

  function copyText() {
    navigator.clipboard.writeText(ocrResult);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function resetOcr() {
    setFiles([]);
    setSelectedFileIndex(null);
    setOcrResult("");
    setProgress(0);
    setIsRunning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const exportActions = [
    { icon: <FileText size={18} />, label: "Save as TXT", handler: downloadTxt, color: "#6366f1" },
    { icon: <FileSpreadsheet size={18} />, label: "Save as CSV", handler: downloadCsv, color: "#10b981" },
    { icon: <FileDown size={18} />, label: "Save as PDF", handler: downloadPdf, color: "#f59e0b" },
    { icon: copySuccess ? <Check size={18} /> : <Clipboard size={18} />, label: copySuccess ? "Copied!" : "Copy Text", handler: copyText, color: "#8b5cf6" },
  ];

  /* ================= UI ================= */
  return (
    <div className="ocr-container-modern">
      <motion.div
        className="ocr-header-premium"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="ocr-title-section">
          <div className="ocr-accent-badge">
            <ScanSearch size={14} />
            OCR Engine
          </div>
          <h1>Text Recognition</h1>
          <p>Upload a PDF and extract all readable text with AI-powered OCR.</p>
        </div>
      </motion.div>

      <div className="ocr-layout-grid">
        {/* Upload & Preview */}
        <motion.div
          className="ocr-upload-panel-glass"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className={`ocr-dropzone-modern ${isDragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <input
              id="ocrFileInput"
              type="file"
              accept=".pdf"
              hidden
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />
            {selectedFile ? (
              <div className="ocr-file-info">
                <div className="ocr-file-icon-wrap">
                  <FileUp size={32} />
                </div>
                <span className="ocr-file-name">{selectedFile.name}</span>
                <span className="ocr-file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <div className="ocr-dropzone-content">
                <div className="ocr-upload-glow-icon">
                  <Upload size={36} />
                </div>
                <p className="ocr-drop-title">Drop your PDF here</p>
                <span className="ocr-drop-hint">or click to browse files</span>
              </div>
            )}
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="ocr-preview-wrapper"
            >
              <iframe
                src={URL.createObjectURL(selectedFile)}
                className="ocr-preview-frame-modern"
                title="preview"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Controls & Result */}
        <motion.div
          className="ocr-controls-panel-glass"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Start OCR Button */}
          <button
            className={`ocr-run-button ${isRunning ? "running" : ""}`}
            onClick={startOcr}
            disabled={!selectedFile || isRunning || !sessionId}
          >
            <Sparkles size={20} />
            {isRunning ? "Processing…" : "Start OCR"}
          </button>

          {/* Progress Bar */}
          <AnimatePresence>
            {isRunning && (
              <motion.div
                className="ocr-progress-modern"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="ocr-progress-track">
                  <motion.div
                    className="ocr-progress-fill-modern"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="ocr-progress-label">{progress}% complete</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Export Actions */}
          <div className="ocr-export-grid">
            {exportActions.map((action, i) => (
              <motion.button
                key={action.label}
                className="ocr-export-action"
                disabled={!ocrResult}
                onClick={action.handler}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="ocr-export-icon-wrap"
                  style={{ color: action.color, backgroundColor: `${action.color}15` }}
                >
                  {action.icon}
                </div>
                <span>{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Result Area */}
          <div className="ocr-result-section">
            <div className="ocr-result-header-bar">
              <h3>Extracted Text</h3>
              {ocrResult && (
                <button className="ocr-reset-btn" onClick={resetOcr}>
                  <RefreshCw size={14} />
                  New File
                </button>
              )}
            </div>

            <div className="ocr-result-body">
              <AnimatePresence mode="wait">
                {isRunning ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ocr-skeleton-state"
                  >
                    <div className="skeleton-strip long" />
                    <div className="skeleton-strip medium" />
                    <div className="skeleton-strip short" />
                    <div className="skeleton-strip long" />
                  </motion.div>
                ) : ocrResult ? (
                  <motion.pre
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ocr-result-text-modern"
                  >
                    {ocrResult}
                  </motion.pre>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="ocr-empty-state"
                  >
                    <ScanSearch size={48} />
                    <p>Upload a document and run OCR to see extracted text here.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}