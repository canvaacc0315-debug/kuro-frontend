// src/components/OcrPanel.jsx
import { useState } from "react";
import "../styles/ocr-panel.css";

export default function OcrPanel() {
  const [language, setLanguage] = useState("English");
  const [format, setFormat] = useState("PDF");
  const [mode, setMode] = useState("Standard");

  return (
    <div className="ocr-root">
      {/* STATS */}
      <div className="ocr-stats">
        <div className="ocr-stat">
          <div className="ocr-stat-value">0</div>
          <div className="ocr-stat-label">Files Processed</div>
        </div>
        <div className="ocr-stat">
          <div className="ocr-stat-value">0</div>
          <div className="ocr-stat-label">Characters Extracted</div>
        </div>
        <div className="ocr-stat">
          <div className="ocr-stat-value">0%</div>
          <div className="ocr-stat-label">Average Accuracy</div>
        </div>
        <div className="ocr-stat">
          <div className="ocr-stat-value">0</div>
          <div className="ocr-stat-label">Languages Detected</div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="ocr-grid">
        {/* UPLOAD CARD */}
        <div className="ocr-upload-card">
          <div className="ocr-upload-icon">📄</div>
          <h3>OCR Text Extractor</h3>
          <p>
            Convert images (JPG / PNG) and PDFs into searchable text documents
          </p>

          <button className="ocr-upload-btn">Click to Upload</button>

          <span className="ocr-upload-hint">
            Supported: PDF, JPG, PNG (Max 50MB)
          </span>
        </div>

        {/* SETTINGS */}
        <div className="ocr-settings-card">
          <h3>OCR Settings</h3>

          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Arabic</option>
            <option>Chinese</option>
            <option>Japanese</option>
          </select>

          <label>Output Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="PDF">PDF (Searchable)</option>
            <option value="TXT">Text File</option>
            <option value="JSON">JSON</option>
            <option value="CSV">CSV</option>
          </select>

          <label>Processing Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option>Standard</option>
            <option>High Accuracy</option>
            <option>Fast</option>
          </select>

          <div className="ocr-checkbox">
            <input type="checkbox" defaultChecked />
            <span>Clean & Format Text</span>
          </div>

          <div className="ocr-checkbox">
            <input type="checkbox" defaultChecked />
            <span>Detect Tables</span>
          </div>

          <div className="ocr-checkbox">
            <input type="checkbox" />
            <span>Preserve Layout</span>
          </div>
        </div>
      </div>

      {/* RECENT FILES */}
      <div className="ocr-recent">
        <h3>Recent Uploads</h3>

        <div className="ocr-file">
          <span>📄 sample_document.pdf</span>
          <span className="ocr-file-meta">Processed · 95%</span>
        </div>

        <div className="ocr-file">
          <span>🖼️ invoice_scan.jpg</span>
          <span className="ocr-file-meta">Processing · 92%</span>
        </div>

        <div className="ocr-file">
          <span>🖼️ receipt_photo.png</span>
          <span className="ocr-file-meta">Pending</span>
        </div>
      </div>
    </div>
  );
}