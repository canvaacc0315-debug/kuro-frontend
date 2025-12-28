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

  /* ---------------- FILE HANDLING ---------------- */

  function handleFiles(e) {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    if (selected.length && selectedFileIndex === null) {
      setSelectedFileIndex(0);
      setShowPreview(true);
    }
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (index === selectedFileIndex) {
      setSelectedFileIndex(null);
      setShowPreview(false);
    }
  }

  const selectedFile = useMemo(() => {
    return selectedFileIndex !== null ? files[selectedFileIndex] : null;
  }, [files, selectedFileIndex]);

  /* ---------------- OCR START ---------------- */

  async function startOcr() {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    try {
      setIsRunning(true);
      setProgress(10);
      setOcrResult("");

      const formData = new FormData();

      // ✅ IMAGE OCR
      if (selectedFile.type.startsWith("image/")) {
        formData.append("file", selectedFile);

        const res = await fetch(
          "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/image/ocr",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) throw new Error("Image OCR failed");
        const data = await res.json();
        setOcrResult(data.text || "");
      }

      // ✅ PDF OCR (needs pdf_id from upload)
      else {
        if (!selectedFile.pdf_id) {
          alert("This PDF must be uploaded via PDF upload first.");
          setIsRunning(false);
          return;
        }

        formData.append("pdf_id", selectedFile.pdf_id);

        const res = await fetch(
          "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/pdf/ocr",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!res.ok) throw new Error("PDF OCR failed");
        const data = await res.json();
        setOcrResult(data.text || "");
      }

      setProgress(100);
    } catch (err) {
      console.error(err);
      alert("OCR failed. Check console.");
    } finally {
      setIsRunning(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>
          OCR & <span>Recognition</span>
        </h2>
        <p>Extract text from images and PDFs</p>
      </div>

      <div className="ocr-content">
        <div
          className="ocr-upload"
          onClick={() => document.getElementById("ocrFileInput").click()}
        >
          <div className="ocr-upload-icon">📄</div>
          <div className="ocr-upload-title">Upload Files</div>
          <div className="ocr-upload-desc">
            PDF, JPG, PNG supported
          </div>

          <button
            type="button"
            className="ocr-upload-btn"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("ocrFileInput").click();
            }}
          >
            Select Files
          </button>

          <input
            id="ocrFileInput"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
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

      {files.length > 0 && (
        <div className="ocr-settings" style={{ marginTop: 20 }}>
          <label>Select file</label>
          <select
            value={selectedFileIndex ?? ""}
            onChange={(e) => {
              setSelectedFileIndex(Number(e.target.value));
              setShowPreview(true);
            }}
          >
            <option value="" disabled>
              Select
            </option>
            {files.map((f, i) => (
              <option key={i} value={i}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showPreview && selectedFile && (
        <div className="ocr-preview">
          <div className="ocr-preview-header">
            <h4>Preview</h4>
            <button onClick={() => setShowPreview(false)}>✕</button>
          </div>

          {selectedFile.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              style={{ maxWidth: "100%" }}
            />
          ) : (
            <iframe
              src={URL.createObjectURL(selectedFile)}
              title="preview"
              className="ocr-preview-frame"
            />
          )}
        </div>
      )}

      <button
        className="ocr-start-btn"
        onClick={startOcr}
        disabled={isRunning}
      >
        {isRunning ? "Processing..." : "🚀 Start OCR"}
      </button>

      {ocrResult && (
        <div className="ocr-result-preview">
          <h4>OCR Result</h4>
          <pre>{ocrResult}</pre>
        </div>
      )}
    </div>
  );
}