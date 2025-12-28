import { useState, useMemo } from "react";
import "../styles/ocr-override.css";

export default function OcrPanel() {
  const [language, setLanguage] = useState("English");
  const [outputFormat, setOutputFormat] = useState("text");
  const [mode, setMode] = useState("fast");

  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");

  /* ✅ ALWAYS DEFINED */
  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  /* ---------------- FILE UPLOAD ---------------- */
  async function handleFiles(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const file = selected[0]; // PDF only for now
    setFiles([file]);
    setSelectedFileIndex(0);
    setShowPreview(true);

    // 🔴 Only PDF supported
    if (!file.type.includes("pdf")) {
      alert("Only PDF OCR is supported right now");
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

      // ✅ SAVE pdf_id
      file.pdf_id = data.pdfs[0].pdf_id;
      console.log("Uploaded PDF ID:", file.pdf_id);
    } catch (err) {
      console.error(err);
      alert("PDF upload failed");
    }
  }

  /* ---------------- OCR START ---------------- */
  async function startOcr() {
    if (!selectedFile) {
      alert("Select a PDF first");
      return;
    }

    if (!selectedFile.pdf_id) {
      alert("PDF not uploaded yet. Upload again.");
      return;
    }

    try {
      setIsRunning(true);
      setProgress(10);
      setOcrResult("");

      // 🔁 Fake progress while backend works
      const timer = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 5 : p));
      }, 400);

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

      clearInterval(timer);

      if (!res.ok) throw new Error("OCR failed");

      const data = await res.json();
      setOcrResult(data.text || "");
      setProgress(100);
    } catch (err) {
      console.error(err);
      alert("OCR failed. Check console.");
    } finally {
      setTimeout(() => setIsRunning(false), 500);
    }
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

      <div className="ocr-content">
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

        <div className="ocr-settings">
          <h3>OCR Settings</h3>

          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {["English", "Hindi", "French", "German"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>

          <label>Output Format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
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

      {/* START */}
      <button
        className="ocr-start-btn"
        onClick={startOcr}
        disabled={isRunning}
      >
        {isRunning ? "Processing..." : "🚀 Start OCR"}
      </button>

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

      {/* RESULT */}
      {ocrResult && (
        <div className="ocr-result-preview">
          <h4>OCR Result</h4>
          <pre>{ocrResult}</pre>
        </div>
      )}
    </div>
  );
}