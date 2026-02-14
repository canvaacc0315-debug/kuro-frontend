  import { useState, useMemo, useRef } from "react";
  import { motion } from "framer-motion";
  import jsPDF from "jspdf";
  import "/src/styles/ocr-override.css";
  // Note: Import the new CSS file in your parent component or via index.css
  // e.g., import './ocr-panel.css';

  export default function OcrPanel({ selectedPdfId = '', sessionId = '' } = {}) {
    const [files, setFiles] = useState([]);
    const [selectedFileIndex, setSelectedFileIndex] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [ocrResult, setOcrResult] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef(null);
    const sessionRef = useRef(sessionId || null);

    const selectedFile = useMemo(() => {
      if (selectedFileIndex === null) return null;
      return files[selectedFileIndex] || null;
    }, [files, selectedFileIndex]);

    const effectivePdfId = selectedPdfId || selectedFile?.pdf_id;
    const effectiveSessionId = sessionId || sessionRef.current;

    /* ================= FILE UPLOAD ================= */
    async function handleFiles(inputFiles) {
      const file = inputFiles[0];
      if (!file) return;

      if (!file.type.includes("pdf")) {
        alert("Only PDF supported");
        return;
      }

      setFiles([file]);
      setSelectedFileIndex(0);
      setOcrResult("");

      const uploadSessionId = sessionId || crypto.randomUUID();
      sessionRef.current = uploadSessionId;

      const formData = new FormData();
      formData.append("file", file); // Fixed: Changed from "files" to "file"

      formData.append("session_id", uploadSessionId);

      const res = await fetch(
        "http://localhost:8000/api/pdf/upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend Error:", text);
        throw new Error("Upload failed");
      }

      const data = await res.json();
      file.pdf_id = data.pdfs[0].pdf_id;
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
    const runOCR = async () => {
      if (!effectivePdfId || !effectiveSessionId) {
        alert("Select a PDF first");
        return;
      }

      setIsRunning(true);
      setProgress(15);
      setOcrResult("");

      const formData = new FormData();
      formData.append("pdf_id", effectivePdfId);
      formData.append("session_id", effectiveSessionId);

      // Optional OCR settings
      formData.append("output_format", "text");
      formData.append("clean_text", true);
      formData.append("detect_tables", false);
      formData.append("preserve_layout", false);

      const res = await fetch("https:/canvaacc0315-debug/canvaacc0315-debug.hf.space/api/pdf/ocr", {
        method: "POST",
        body: formData, // ❗ NO headers
        credentials: "include"  
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("OCR failed", text);
        throw new Error("OCR failed");
      }

      const data = await res.json();
      setOcrResult(data.text || "");
      setProgress(100);
      setIsRunning(false);
    };

    /* ================= EXPORT ACTIONS ================= */
    function downloadTxt() {
      const blob = new Blob([ocrResult], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ocr.txt";
      a.click();
    }

    function downloadCsv() {
      const blob = new Blob(["text\n" + ocrResult], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ocr.csv";
      a.click();
    }

    function downloadPdf() {
      const doc = new jsPDF("p", "mm", "a4");

      const margin = 15;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      const lines = doc.splitTextToSize(
        ocrResult,
        pageWidth - margin * 2
      );

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
      if (!sessionId) sessionRef.current = null;
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
        <h2 className="ocr-title">OCR & <span className="brand-red">Recognition</span></h2>
        <p className="ocr-subtitle">Extract text from PDFs</p>

        <div className="ocr-main">
          {/* LEFT */}
          <div className="ocr-left">
            <div
              className={`ocr-upload ${isDragging ? 'dragging' : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <div className="ocr-upload-icon">📄</div>
              <div className="ocr-upload-title">Upload PDF</div>
              <button className="ocr-upload-btn" type="button">Select PDF</button>
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
              onClick={runOCR}
              disabled={!effectivePdfId || isRunning}
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
                <div className="ocr-placeholder">
                  OCR result will appear here
                </div>
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
  