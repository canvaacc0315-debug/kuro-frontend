import { useEffect, useState } from "react";
import "./InstructionModal.css";

const STORAGE_KEY = "rovex_show_instructions";

export default function InstructionModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Always show on site re-entry unless explicitly dismissed
    const shouldShow = localStorage.getItem(STORAGE_KEY);
    if (shouldShow !== "false") {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "false"); // Persist dismissal across sessions
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="instruction-overlay">
      <div className="instruction-modal">
        <div className="instruction-header">
          <h2>👋 Welcome to RovexAI</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="instruction-body">
          <p className="intro-text">
            Transform your PDF workflows with intelligent processing and creation. Here's a quick guide to get started:
          </p>

          <ul className="features-list">
            <li>
              <span className="icon">📄</span>
              <span>Upload PDFs to start chatting with your documents</span>
            </li>
            <li>
              <span className="icon">💬</span>
              <span>Ask questions and get instant answers based on your content</span>
            </li>
            <li>
              <span className="icon">📊</span>
              <span>Unlock deeper insights with AI-powered analysis</span>
            </li>
            <li>
              <span className="icon">🔍</span>
              <span>OCR magic: Extract text from scanned or image-based PDFs</span>
            </li>
            <li>
              <span className="icon">✏️</span>
              <span>Create, edit, and export PDFs in real time</span>
            </li>
            <li className="highlight">
              <span className="icon">📱</span>
              <strong>Mobile Users:</strong><br />
              For the best experience, enable <strong>Desktop Mode</strong> in your browser settings.
            </li>
          </ul>
        </div>

        <div className="instruction-actions">
          <button onClick={handleClose} className="primary-btn">
            Got It! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}