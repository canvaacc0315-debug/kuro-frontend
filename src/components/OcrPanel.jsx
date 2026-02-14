import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { useAuth } from "@clerk/clerk-react"; // 🔥 ADDED: for authentication
import "/src/styles/ocr-override.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://canvaacc0315-debug-canvaacc0315-debug.hf.space";

export default function OcrPanel() {
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId, setSessionId] = useState(""); // 🔥 ADDED: session state
  
  const { getToken } = useAuth(); // 🔥 ADDED: auth hook
  const fileInputRef = useRef(null);

  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  /* ================= SESSION MANAGEMENT ================= */
  // 🔥 ADDED: Start session on component mount
  async function startSession() {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/session/start`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setSessionId(data.session_id);
      return data.session_id;
    } catch (err) {
      console.error("Failed to start session:", err);
      return "";
    }
  }

  // Initialize session on mount
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

    // 🔥 Ensure we have a session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await startSession();
    }

    setFiles([file]);
    setSelectedFileIndex(0);
    setOcrResult("");

    const formData = new FormData();
    formData.append("files", file);
    formData.append("session_id", currentSessionId); // 🔥 ADDED: required by backend

    try {
      const token = await getToken(); // 🔥 ADDED: auth token
      
      // 🔥 FIXED: Removed trailing space in URL
      const res = await fetch(`${API_BASE}/api/pdf/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // 🔥 ADDED: auth header
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      
      // 🔥 FIXED: Handle response properly
      if (data.pdfs && data.pdfs.length > 0) {
        file.pdf_id = data.pdfs[0].pdf_id;
        file.backendId = data.pdfs[0].pdf_id; // 🔥 ADDED: for consistency
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
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragEnter(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  /* ================= OCR ================= */
  async function startOcr() {
    if (!selectedFile?.pdf_id) {
      alert("Please upload a PDF first");
      return;
    }

    if (!sessionId) {
      alert("No active session. Please refresh the page.");
      return;
    }

    setIsRunning(true);
    setProgress(15);
    setOcrResult("");

    const formData = new FormData();
    formData.append("pdf_id", selectedFile.pdf_id);
    formData.append("session_id", sessionId); // 🔥 ADDED: required by backend
    formData.append("output_format", "text"); // 🔥 ADDED: explicit format

    try {
      const token = await getToken(); // 🔥 ADDED: auth token
      
      // 🔥 FIXED: Removed trailing space in URL
      const res = await fetch(`${API_BASE}/api/pdf/ocr`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // 🔥 ADDED: auth header
        },
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
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save("ocr-result.pdf");
  }

  function copyText() {
    navigator.clipboard.writeText(ocrResult);
    alert("Copied to clipboard");
  }

  function resetOcr() {
    setFiles([]);
    setSelectedFileIndex(null);
    setOcrResult("");
    setProgress(0);
    setIsRunning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* ================= UI ================= */
  return (
    <motion.div
      className="page-canvas"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="ocr-title">
        OCR & <span className="brand-red">Recognition</span>
      </h2>
      <p className="ocr-subtitle">Extract text from PDFs</p>

      <div className="ocr-main">
        {/* LEFT */}
        <div className="ocr-left">
          <div
            className={`ocr-upload ${isDragging ? "dragging" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <div className="ocr-upload-icon">📄</div>
            <div className="ocr-upload-title">Upload PDF</div>
            <button className="ocr-upload-btn" type="button">
              Select PDF
            </button>
            <input
              id="ocrFileInput"
              type="file"
              accept=".pdf"
              hidden
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {selectedFile && (
            <iframe
              src={URL.createObjectURL(selectedFile)}
              className="ocr-preview-frame"
              title="preview"
            />
          )}
        </div>

        {/* RIGHT */}
        <div className="ocr-right">
          <h4 className="ocr-actions-title">Actions</h4>

          <button
            className="ocr-action-button ocr-start-btn"
            onClick={startOcr}
            disabled={!selectedFile || isRunning || !sessionId} // 🔥 Also disable if no session
          >
            {isRunning ? "Processing..." : "🚀 Start OCR"}
          </button>

          <button
            className="ocr-action-button ocr-save-btn"
            disabled={!ocrResult}
            onClick={downloadTxt}
          >
            Save as TXT
          </button>
          <button
            className="ocr-action-button ocr-save-btn"
            disabled={!ocrResult}
            onClick={downloadCsv}
          >
            Save as CSV
          </button>
          <button
            className="ocr-action-button ocr-save-btn"
            disabled={!ocrResult}
            onClick={downloadPdf}
          >
            Save as PDF
          </button>
          <button
            className="ocr-action-button ocr-copy-btn"
            disabled={!ocrResult}
            onClick={copyText}
          >
            Copy To Clipboard
          </button>

          <motion.div
            className="ocr-result-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h5 className="ocr-result-title">Extracted Text</h5>
            {ocrResult ? (
              <pre className="ocr-result-text">{ocrResult}</pre>
            ) : (
              <div className="ocr-placeholder">OCR result will appear here</div>
            )}
          </motion.div>

          <button
            className="process-another-btn"
            disabled={!ocrResult}
            onClick={resetOcr}
          >
            🔁 Process Another File
          </button>

          {isRunning && (
            <div className="ocr-progress-wrapper">
              <div className="ocr-progress-bar">
                <div
                  className="ocr-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="ocr-progress-text">{progress}%</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}