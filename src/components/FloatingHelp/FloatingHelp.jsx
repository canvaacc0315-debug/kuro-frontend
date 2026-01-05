import { useState } from "react";
import "./floating-help.css";

export default function FloatingHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        className="floating-help-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Help"
      >
        {open ? "✕" : "❓"}
      </button>

      {/* Floating panel */}
      {open && (
        <div className="floating-help-panel">
          <div className="help-header">
            <h4>👋 Welcome to RovexAI Help</h4>
            <p>Quick answers for PDF Chatbot & more</p>
          </div>

          <div className="help-item">
            <strong>How do I upload a PDF?</strong>
            <span>Click the upload icon in the dashboard, select your file, and start chatting instantly.</span>
          </div>

          <div className="help-item">
            <strong>What can I ask the chatbot?</strong>
            <span>Ask anything: "Summarize this page," "Extract tables," or "Explain this section" – it uses AI for natural responses.</span>
          </div>

          <div className="help-item">
            <strong>How does Analysis work?</strong>
            <span>Basic mode uses simple matching; Advanced dives deeper with AI patterns for insights, charts, and data extraction.</span>
          </div>

          <div className="help-item warning">
            <strong>📱 Mobile Tip</strong>
            <span>Enable <b>Desktop Mode</b> in your browser for full features like editing and OCR.</span>
          </div>

          <div className="help-item">
            <strong>Is my data private?</strong>
            <span>Yes! PDFs are processed securely and not stored without consent. Learn more at <a href="https://rovexai.com/privacy" target="_blank" rel="noopener noreferrer">rovexai.com/privacy</a>.</span>
          </div>

          <div className="help-item">
            <strong>Need more?</strong>
            <span>Visit <a href="https://rovexai.com/support" target="_blank" rel="noopener noreferrer">rovexai.com/support</a> or email help@rovexai.com</span>
          </div>
        </div>
      )}
    </>
  );
}