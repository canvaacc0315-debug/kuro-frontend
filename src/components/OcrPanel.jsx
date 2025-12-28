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

  // 🔹 NEW: selected file for OCR + preview
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);

  // Progress + result
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");

  /* ---------------- FILE HANDLING ---------------- */

  function handleFiles(e) {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);

    // auto-select first file
    if (selected.length && selectedFileIndex === null) {
      setSelectedFileIndex(0);
    }
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (index === selectedFileIndex) {
      setSelectedFileIndex(null);
    }
  }

  /* ---------------- OCR START ---------------- */

  async function startOcr() {
    if (!files.length || selectedFileIndex === null) {
      alert("Please select a file to run OCR on");
      return;
    }

    setIsRunning(true);
    setProgress(5);
    setOcrResult("");

    let fake = 5;
    const timer = setInterval(() => {
      fake += 8;
      setProgress((p) => (p < 90 ? fake : p));
    }, 300);

    try {
      // 🔗 BACKEND READY (only selected file)
      // const formData = new FormData();
      // formData.append("file", files[selectedFileIndex]);
      // formData.append("language", language);
      // formData.append("mode", mode);

      await new Promise((r) => setTimeout(r, 2000));

      clearInterval(timer);
      setProgress(100);

      const extractedText =
        "This is a sample OCR extracted text.\n\n" +
        `File processed: ${files[selectedFileIndex].name}`;

      setOcrResult(extractedText);

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

  const selectedFile =
    selectedFileIndex !== null ? files[selectedFileIndex] : null;

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

      {/* 🔽 NEW: FILE SELECT DROPDOWN */}
      {files.length > 0 && (
        <div className="ocr-settings" style={{ marginTop: 20 }}>
          <label>Select file to run OCR on</label>
          <select
            value={selectedFileIndex ?? ""}
            onChange={(e) => setSelectedFileIndex(Number(e.target.value))}
          >
            <option value="" disabled>
              Select a file
            </option>
            {files.map((f, i) => (
              <option key={i} value={i}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 🖼️ NEW: FILE PREVIEW PANEL */}
      {selectedFile && (
        <div className="ocr-result-preview">
          <h4>👁️ File Preview</h4>

          {selectedFile.type.startsWith("image") ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              style={{ maxWidth: "100%", borderRadius: 10 }}
            />
          ) : (
            <iframe
              src={URL.createObjectURL(selectedFile)}
              title="pdf-preview"
              style={{
                width: "100%",
                height: "400px",
                borderRadius: 10,
                border: "1px solid #1f2937",
              }}
            />
          )}
        </div>
      )}

      {/* START BUTTON */}
      <button
        className="ocr-start-btn"
        onClick={startOcr}
        disabled={isRunning}
      >
        {isRunning ? "Processing..." : "🚀 Start OCR Extraction"}
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
          <div className="ocr-progress-text">
            Processing… {progress}%
          </div>
        </div>
      )}

      {/* OCR RESULT */}
      {ocrResult && (
        <div className="ocr-result-preview">
          <h4>📄 OCR Result Preview</h4>
          <pre>{ocrResult}</pre>
        </div>
      )}
    </div>
  );
}