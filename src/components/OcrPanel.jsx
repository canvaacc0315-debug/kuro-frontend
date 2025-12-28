// src/components/OcrPanel.jsx
import { useState } from "react";
import Tesseract from "tesseract.js";

export default function OcrPanel() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("eng");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setText("");
    setProgress(0);
  };

  const runOcr = async () => {
    if (!file) return alert("Please upload a file first");

    setLoading(true);
    setText("");

    try {
      const result = await Tesseract.recognize(file, language, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.floor(m.progress * 100));
          }
        },
      });

      setText(result.data.text);
    } catch (err) {
      console.error(err);
      alert("OCR failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ocr-container">
      <h2 className="ocr-title">
        🔍 OCR & <span>Recognition</span>
      </h2>
      <p className="ocr-subtitle">
        Extract text from PDFs and images using powerful offline OCR
      </p>

      {/* Upload */}
      <div className="ocr-card">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="eng">English</option>
          <option value="hin">Hindi</option>
          <option value="spa">Spanish</option>
          <option value="fra">French</option>
          <option value="deu">German</option>
        </select>

        <button onClick={runOcr} disabled={loading}>
          {loading ? "Processing..." : "Run OCR"}
        </button>

        {loading && <p>Progress: {progress}%</p>}
      </div>

      {/* Output */}
      <div className="ocr-output">
        <h3>Extracted Text</h3>
        <textarea
          value={text}
          placeholder="OCR output will appear here..."
          readOnly
        />
      </div>
    </div>
  );
}