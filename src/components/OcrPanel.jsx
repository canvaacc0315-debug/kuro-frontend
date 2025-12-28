import { useState, useMemo } from "react";
import "../styles/ocr-override.css";

export default function OcrPanel() {
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");

  /* ---------------- SELECTED FILE ---------------- */
  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  /* ---------------- FILE UPLOAD ---------------- */
  async function handleFiles(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const file = selected[0];
    setFiles([file]);
    setSelectedFileIndex(0);
    setShowPreview(true);

    if (!file.type.includes("pdf")) {
      alert("Only PDF files are supported");
      return;
    }

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

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      file.pdf_id = data.pdfs[0].pdf_id;
      console.log("PDF uploaded:", file.pdf_id);
    } catch (err) {
      console.error(err);
      alert("PDF upload failed");
    }
  }

  /* ---------------- OCR START ---------------- */
  async function startOcr() {
    if (!selectedFile || !selectedFile.pdf_id) {
      alert("Upload PDF first");
      return;
    }

    try {
      setIsRunning(true);
      setProgress(10);
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

      if (!res.ok) throw new Error("OCR failed");

      const data = await res.json();
      setOcrResult(data.text || "");
      setProgress(100);
    } catch (err) {
      console.error(err);
      alert("OCR failed");
    } finally {
      setIsRunning(false);
    }
  }

  /* ---------------- EXPORT HELPERS ---------------- */
  function downloadTxt() {
    const blob = new Blob([ocrResult], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr-result.txt";
    a.click();
  }

  function downloadCsv() {
    const csv =
      "line\n" +
      ocrResult
        .split("\n")
        .map((l) => `"${l.replace(/"/g, '""')}"`)
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr-result.csv";
    a.click();
  }

  function downloadPdf() {
    const blob = new Blob([ocrResult], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr-result.pdf";
    a.click();
  }

  function copyText() {
    navigator.clipboard.writeText(ocrResult);
    alert("Copied to clipboard");
  }

  /* ---------------- RESET ---------------- */
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

  /* ---------------- UI ---------------- */
  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>
          OCR & <span>Recognition</span>
        </h2>
        <p>Extract text from PDFs</p>
      </div>

      {/* UPLOAD */}
      <div
        className="ocr-upload"
        onClick={() => document.getElementById("ocrFileInput").click()}
      >
        <div className="ocr-upload-icon">📄</div>
        <div className="ocr-upload-title">Upload PDF</div>
        <button
          type="button"
          className="ocr-upload-btn"
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById("ocrFileInput").click();
          }}
        >
          Select PDF
        </button>

        <input
          id="ocrFileInput"
          type="file"
          accept=".pdf"
          hidden
          onChange={handleFiles}
        />
      </div>

      {/* PREVIEW */}
      {showPreview && selectedFile && (
        <div className="ocr-preview">
          <div className="ocr-preview-header">
            <h4>PDF Preview</h4>
            <button onClick={() => setShowPreview(false)}>✕</button>
          </div>
          <iframe
            src={URL.createObjectURL(selectedFile)}
            title="preview"
            className="ocr-preview-frame"
          />
        </div>
      )}

      {/* START OCR */}
      {selectedFile && !ocrResult && (
        <button
          className="ocr-start-btn"
          onClick={startOcr}
          disabled={isRunning}
        >
          {isRunning ? "Processing..." : "🚀 Start OCR"}
        </button>
      )}

      {/* PROGRESS */}
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

      {/* RESULT + RIGHT PANEL */}
      {ocrResult && (
        <div className="ocr-output-layout">
          {/* LEFT */}
          <div className="ocr-output-left">
            <div className="ocr-result-preview">
              <h4>OCR Result</h4>
              <pre>{ocrResult}</pre>
            </div>
          </div>

          {/* RIGHT */}
          <div className="ocr-output-right">
            <h4>📤 Export</h4>

            <button onClick={downloadTxt}>TXT</button>
            <button onClick={downloadCsv}>CSV</button>
            <button onClick={downloadPdf}>PDF</button>
            <button onClick={copyText}>Copy</button>

            <button
              className="process-another-btn"
              onClick={resetOcr}
            >
              🔁 Process Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}