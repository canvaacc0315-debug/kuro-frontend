import { useState, useMemo } from "react";
import "../styles/ocr-override.css";

export default function OcrPanel() {
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");

  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  /* ================= FILE UPLOAD ================= */
  async function handleFiles(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("pdf")) {
      alert("Only PDF supported");
      return;
    }

    setFiles([file]);
    setSelectedFileIndex(0);
    setShowPreview(true);
    setOcrResult("");

    const formData = new FormData();
    formData.append("files", file);

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
  }

  /* ================= OCR ================= */
  async function startOcr() {
    if (!selectedFile?.pdf_id) return;

    setIsRunning(true);
    setProgress(15);
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
    setIsRunning(false);
  }

  /* ================= ACTIONS ================= */
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

  function copyText() {
    navigator.clipboard.writeText(ocrResult);
    alert("Copied to clipboard");
  }

  function resetOcr() {
    setFiles([]);
    setSelectedFileIndex(null);
    setShowPreview(false);
    setOcrResult("");
    setProgress(0);
    setIsRunning(false);
    document.getElementById("ocrFileInput").value = "";
  }

  /* ================= UI ================= */
  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>OCR & <span>Recognition</span></h2>
        <p>Extract text from PDFs</p>
      </div>

      <div className="ocr-output-layout">
        {/* LEFT SIDE */}
        <div className="ocr-output-left">
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

          {selectedFile && showPreview && (
            <div className="ocr-preview">
              <iframe
                src={URL.createObjectURL(selectedFile)}
                className="ocr-preview-frame"
                title="preview"
              />
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="ocr-output-right">
          <h4>Actions</h4>

          <button
            onClick={startOcr}
            disabled={!selectedFile || isRunning}
          >
            {isRunning ? "Processing..." : "🚀 Start OCR"}
          </button>

          <button disabled={!ocrResult} onClick={downloadTxt}>TXT</button>
          <button disabled={!ocrResult} onClick={downloadCsv}>CSV</button>
          <button disabled={!ocrResult} onClick={copyText}>Copy</button>

          <div className="ocr-result-preview right-panel-result">
            <h5>Extracted Text</h5>
            {ocrResult ? (
              <pre>{ocrResult}</pre>
            ) : (
              <div className="ocr-placeholder">
                OCR result will appear here
              </div>
            )}
          </div>

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
    </div>
  );
}