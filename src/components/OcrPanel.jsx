import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import { useAuth } from "@clerk/clerk-react";
import { createWorker } from "tesseract.js";
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
  FileUp,
  Image as ImageIcon,
  FileIcon,
} from "lucide-react";
import "/src/styles/ocr-override.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://canvaacc0315-debug-canvaacc0315-debug.hf.space";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp", "image/gif", "image/tiff"];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, "application/pdf"];

function isImageFile(file) {
  return file && ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export default function OcrPanel() {
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [tesseractProgress, setTesseractProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const { getToken } = useAuth();
  const fileInputRef = useRef(null);

  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  const fileIsImage = useMemo(() => isImageFile(selectedFile), [selectedFile]);

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

    setErrorMsg("");

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg("Unsupported file type. Please upload a PDF or image (PNG, JPG, WEBP, BMP, GIF, TIFF).");
      return;
    }

    // Clear previous state
    setFiles([file]);
    setSelectedFileIndex(0);
    setOcrResult("");
    setProgress(0);
    setTesseractProgress(0);

    if (isImageFile(file)) {
      // For images, create a local preview URL
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(URL.createObjectURL(file));
      // No backend upload needed for images
      return;
    }

    // PDF flow — upload to backend
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await startSession();
    }

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
        setFiles([file]);
      } else {
        throw new Error("No PDF data in response");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Failed to upload PDF");
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

  /* ================= OCR — IMAGE (Tesseract.js) ================= */
  async function startImageOcr() {
    if (!selectedFile) return;
    setIsRunning(true);
    setProgress(5);
    setTesseractProgress(0);
    setOcrResult("");
    setErrorMsg("");

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const pct = Math.round(m.progress * 100);
            setTesseractProgress(pct);
            setProgress(10 + Math.round(pct * 0.88));
          }
        },
      });

      const { data: { text } } = await worker.recognize(selectedFile);
      await worker.terminate();

      setOcrResult(text.trim() || "No text found in image.");
      setProgress(100);
    } catch (err) {
      console.error("Image OCR error:", err);
      setErrorMsg(`Image OCR failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }

  /* ================= OCR — PDF (Backend) ================= */
  async function startPdfOcr() {
    if (!selectedFile?.pdf_id) { setErrorMsg("Please upload a PDF first"); return; }
    if (!sessionId) { setErrorMsg("No active session. Please refresh the page."); return; }

    setIsRunning(true);
    setProgress(15);
    setOcrResult("");
    setErrorMsg("");

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
      setErrorMsg(err.message || "OCR failed");
    } finally {
      setIsRunning(false);
    }
  }

  function startOcr() {
    if (fileIsImage) return startImageOcr();
    return startPdfOcr();
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
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setFiles([]);
    setSelectedFileIndex(null);
    setOcrResult("");
    setProgress(0);
    setTesseractProgress(0);
    setIsRunning(false);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const exportActions = [
    { icon: <FileText size={18} />, label: "Save as TXT", handler: downloadTxt, color: "#6366f1" },
    { icon: <FileSpreadsheet size={18} />, label: "Save as CSV", handler: downloadCsv, color: "#10b981" },
    { icon: <FileDown size={18} />, label: "Save as PDF", handler: downloadPdf, color: "#f59e0b" },
    { icon: copySuccess ? <Check size={18} /> : <Clipboard size={18} />, label: copySuccess ? "Copied!" : "Copy Text", handler: copyText, color: "#8b5cf6" },
  ];

  const canStartOcr = selectedFile && !isRunning && (fileIsImage || (selectedFile.pdf_id && sessionId));

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
          <p>Upload a <strong>PDF</strong> or an <strong>image</strong> and extract all readable text with AI-powered OCR.</p>
        </div>

        {/* Supported formats strip */}
        <div className="ocr-format-strip">
          <span className="ocr-format-tag pdf-tag"><FileIcon size={11} /> PDF</span>
          <span className="ocr-format-tag img-tag"><ImageIcon size={11} /> PNG</span>
          <span className="ocr-format-tag img-tag"><ImageIcon size={11} /> JPG</span>
          <span className="ocr-format-tag img-tag"><ImageIcon size={11} /> WEBP</span>
          <span className="ocr-format-tag img-tag"><ImageIcon size={11} /> BMP</span>
          <span className="ocr-format-tag img-tag"><ImageIcon size={11} /> GIF</span>
          <span className="ocr-format-tag img-tag"><ImageIcon size={11} /> TIFF</span>
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
              accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.gif,.tiff,.tif"
              hidden
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />
            {selectedFile ? (
              <div className="ocr-file-info">
                <div className={`ocr-file-icon-wrap ${fileIsImage ? "img-mode" : "pdf-mode"}`}>
                  {fileIsImage ? <ImageIcon size={32} /> : <FileUp size={32} />}
                </div>
                <div className={`ocr-file-type-badge ${fileIsImage ? "img-badge" : "pdf-badge"}`}>
                  {fileIsImage ? "🖼 Image" : "📄 PDF"}
                </div>
                <span className="ocr-file-name">{selectedFile.name}</span>
                <span className="ocr-file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <div className="ocr-dropzone-content">
                <div className="ocr-upload-glow-icon">
                  <Upload size={36} />
                </div>
                <p className="ocr-drop-title">Drop your file here</p>
                <span className="ocr-drop-hint">PDF, PNG, JPG, WEBP, BMP, GIF, TIFF — or click to browse</span>
              </div>
            )}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                className="ocr-error-banner"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={16} />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="ocr-preview-wrapper"
            >
              {fileIsImage ? (
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="ocr-preview-image"
                />
              ) : (
                <iframe
                  src={URL.createObjectURL(selectedFile)}
                  className="ocr-preview-frame-modern"
                  title="preview"
                />
              )}
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
            className={`ocr-run-button ${isRunning ? "running" : ""} ${fileIsImage ? "img-mode-btn" : ""}`}
            onClick={startOcr}
            disabled={!canStartOcr}
          >
            {fileIsImage ? <ImageIcon size={20} /> : <Sparkles size={20} />}
            {isRunning
              ? (fileIsImage ? `Scanning… ${tesseractProgress}%` : "Processing…")
              : (fileIsImage ? "Scan Image" : "Start OCR")}
          </button>

          {/* Mode indicator */}
          {selectedFile && (
            <motion.div
              className={`ocr-mode-indicator ${fileIsImage ? "img-mode-indicator" : "pdf-mode-indicator"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {fileIsImage ? (
                <><ImageIcon size={13} /> Client-side OCR via Tesseract.js</>
              ) : (
                <><FileIcon size={13} /> Server-side OCR via Backend API</>
              )}
            </motion.div>
          )}

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
                    transition={{ duration: 0.4 }}
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
              {(ocrResult || selectedFile) && (
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
                    <div className="skeleton-strip medium" />
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
                    <p>Upload a PDF or image, then click "Start OCR" to extract text.</p>
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