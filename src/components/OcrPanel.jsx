import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import "../styles/ocr-override.css";

export default function OcrPanel() {
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");

  /* ---------- SELECTED FILE ---------- */
  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  /* ---------- FILE UPLOAD ---------- */
  async function handleFiles(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const file = selected[0];
    if (!file.type.includes("pdf")) {
      alert("Only PDF OCR is supported");
      return;
    }

    setFiles([file]);
    setSelectedFileIndex(0);
    setShowPreview(true);

    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await fetch(
        "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/pdf/upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();
      file.pdf_id = data.pdfs[0].pdf_id;
    } catch {
      alert("PDF upload failed");
    }
  }

  /* ---------- OCR ---------- */
  async function startOcr() {
    if (!selectedFile?.pdf_id) {
      alert("Upload PDF first");
      return;
    }

    try {
      setIsRunning(true);
      setProgress(20);
      setOcrResult("");

      const formData = new FormData();
      formData.append("pdf_id", selectedFile.pdf_id);

      const res = await fetch(
        "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/pdf/ocr",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();
      setOcrResult(data.text || "");
      setProgress(100);
    } catch {
      alert("OCR failed");
    } finally {
      setIsRunning(false);
    }
  }

  /* ---------- RESET ---------- */
  function resetOcr() {
    setFiles([]);
    setSelectedFileIndex(null);
    setShowPreview(false);
    setOcrResult("");
    setProgress(0);
    setIsRunning(false);
    const input = document.getElementById("ocrFileInput");
    if (input) input.value = "";
  }

  /* ---------- EXPORT HELPERS ---------- */
  function downloadTxt() {
    const blob = new Blob([ocrResult], { type: "text/plain" });
    downloadBlob(blob, "ocr-result.txt");
  }

  function downloadCsv() {
    const lines = ocrResult.split("\n");
    const csv = "line\n" + lines.map(l => `"${l.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, "ocr-result.csv");
  }

  function downloadPdf() {
    const doc = new jsPDF("p", "mm", "a4");
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;
    const width = doc.internal.pageSize.width - margin * 2;
    const lines = doc.splitTextToSize(ocrResult, width);

    let y = margin;
    lines.forEach(line => {
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

  function downloadBlob(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ---------- UI ---------- */
  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>OCR & <span>Recognition</span></h2>
        <p>Extract text from PDFs</p>
      </div>

      <div className="ocr-layout">
        {/* LEFT */}
        <div className="ocr-left">
          <div
            className="ocr-upload"
            onClick={() => document.getElementById("ocrFileInput").click()}
          >
            <div className="ocr-upload-icon">📄</div>
            <div className="ocr-upload-title">Upload PDF</div>
            <button className="ocr-upload-btn">Select PDF</button>
            <input
              id="ocrFileInput"
              type="file"
              accept=".pdf"
              hidden
              onChange={handleFiles}
            />
          </div>

          {showPreview && selectedFile && (
            <iframe
              className="ocr-preview-frame"
              src={URL.createObjectURL(selectedFile)}
              title="preview"
            />
          )}
        </div>

        {/* RIGHT */}
        <div className="ocr-right">
          {!ocrResult && (
            <div className="ocr-placeholder">
              📄 OCR result will appear here
            </div>
          )}

          {ocrResult && (
            <>
              <div className="ocr-actions">
                <button onClick={downloadTxt}>TXT</button>
                <button onClick={downloadCsv}>CSV</button>
                <button onClick={downloadPdf}>PDF</button>
                <button onClick={copyText}>Copy</button>
              </div>

              <pre className="ocr-text">{ocrResult}</pre>

              <button className="ocr-reset-btn" onClick={resetOcr}>
                🔁 Process Another File
              </button>
            </>
          )}
        </div>
      </div>

      {selectedFile && !ocrResult && (
        <button className="ocr-start-btn" onClick={startOcr}>
          {isRunning ? "Processing..." : "🚀 Start OCR"}
        </button>
      )}
    </div>
  );
}