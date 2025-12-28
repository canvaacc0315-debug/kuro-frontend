import { useState } from "react";
import "../styles/ocr-override.css";

export default function OcrPanel() {
  const [language, setLanguage] = useState("English");
  const [outputFormat, setOutputFormat] = useState("text");
  const [mode, setMode] = useState("fast");
  const [cleanText, setCleanText] = useState(true);
  const [detectTables, setDetectTables] = useState(true);
  const [preserveLayout, setPreserveLayout] = useState(false);

  const [files, setFiles] = useState([]);

  // Progress + result
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");

  /* ---------------- FILE HANDLING ---------------- */

  function handleFiles(e) {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  /* ---------------- OCR START ---------------- */

  async function startOcr() {
    if (!files.length) {
      alert("Please upload files first");
      return;
    }

    setIsRunning(true);
    setProgress(5);
    setOcrResult("");

    // Fake progress (safe for live site)
    let fake = 5;
    const timer = setInterval(() => {
      fake += 8;
      setProgress((p) => (p < 90 ? fake : p));
    }, 300);

    try {
      // 🔗 BACKEND READY (connect HuggingFace / FastAPI here)
      // const formData = new FormData();
      // files.forEach(f => formData.append("files", f));
      // formData.append("language", language);
      // formData.append("mode", mode);
      // const res = await fetch("/api/ocr", { method: "POST", body: formData });
      // const data = await res.json();

      await new Promise((r) => setTimeout(r, 2000));

      clearInterval(timer);
      setProgress(100);

      const extractedText =
        "This is a sample OCR extracted text.\n\n" +
        "Once the backend is connected, real OCR output will appear here.";

      setOcrResult(extractedText);

      // 🔥 Send OCR output to Analysis tab
      window.dispatchEvent(
        new CustomEvent("ocr-result-ready", { detail: extractedText })
      );
    } catch (err) {
      alert("OCR failed");
      console.error(err);
    } finally {
      setTimeout(() => setIsRunning(false), 600);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="ocr-root">
      {/* HEADER */}
      <div className="ocr-header">
        <h2>
          OCR & <span>Recognition</span>
        </h2>
        <p>Extract text from images and PDFs using powerful OCR</p>
      </div>

      {/* MAIN GRID */}
      <div className="ocr-content">
        {/* UPLOAD */}
        <div
          className="ocr-upload"
          onClick={() => document.getElementById("ocrFileInput").click()}
        >
          <div className="ocr-upload-icon">📄</div>
          <div className="ocr-upload-title">Upload Files</div>
          <div className="ocr-upload-desc">
            PDF, JPG, PNG supported (multiple allowed)
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

        {/* SETTINGS */}
        <div className="ocr-settings">
          <h3>OCR Settings</h3>

          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {[
              "English",
              "Hindi",
              "Spanish",
              "French",
              "German",
              "Chinese",
              "Japanese",
              "Arabic",
            ].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>

          <label>Output Format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
          >
            <option value="pdf">PDF (Searchable)</option>
            <option value="text">Text File</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>

          <label>Processing Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="fast">Fast</option>
            <option value="standard">Standard</option>
            <option value="accurate">High Accuracy</option>
          </select>

          <div className="ocr-checks">
            <label>
              <input
                type="checkbox"
                checked={cleanText}
                onChange={() => setCleanText(!cleanText)}
              />
              Clean & Format Text
            </label>
            <label>
              <input
                type="checkbox"
                checked={detectTables}
                onChange={() => setDetectTables(!detectTables)}
              />
              Detect Tables
            </label>
            <label>
              <input
                type="checkbox"
                checked={preserveLayout}
                onChange={() => setPreserveLayout(!preserveLayout)}
              />
              Preserve Layout
            </label>
          </div>
        </div>
      </div>

      {/* START BUTTON */}
      <button
        className="ocr-start-btn"
        onClick={startOcr}
        disabled={isRunning}
      >
        {isRunning ? "Processing..." : "🚀 Start OCR Extraction"}
      </button>

      {/* PROGRESS BAR */}
      {isRunning && (
        <div className="ocr-progress-wrapper">
          <div className="ocr-progress-bar">
            <div
              className="ocr-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="ocr-progress-text">
            Processing… {progress}%
          </div>
        </div>
      )}

      {/* UPLOADED FILES UI */}
      {files.length > 0 && (
        <div className="ocr-files">
          <h4>📂 Uploaded Files</h4>

          {files.map((file, index) => (
            <div key={index} className="ocr-file-item">
              <div>
                <div className="ocr-file-name">📄 {file.name}</div>
                <div className="ocr-file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>

              <div className="ocr-file-actions">
                <button
                  onClick={() =>
                    window.open(URL.createObjectURL(file), "_blank")
                  }
                >
                  View
                </button>
                <button onClick={() => removeFile(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OCR RESULT PREVIEW */}
      {ocrResult && (
        <div className="ocr-result-preview">
          <h4>📄 OCR Result Preview</h4>
          <pre>{ocrResult}</pre>
        </div>
      )}
    </div>
  );
}