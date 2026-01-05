import { useState } from "react";
import "./floating-help.css";

export default function FloatingHelp() {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    using: false,
    analysis: false,
    privacy: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      {/* Floating button */}
      <button
        className="floating-help-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Help"
      >
        {open ? "✕" : "💭"}
      </button>

      {/* Floating panel */}
      <div 
        className="floating-help-panel"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          visibility: open ? 'visible' : 'hidden',
          pointerEvents: open ? 'auto' : 'none'
        }}
      >
        <div className="help-header">
          <h4>👋 Welcome to RovexAI Help</h4>
          <p>Quick answers for PDF Chatbot & more</p>
        </div>

        {/* Main Section 1: Using the PDF Chatbot */}
        <div className="help-section">
          <button 
            className={`section-header ${expandedSections.using ? 'expanded' : ''}`}
            onClick={() => toggleSection('using')}
          >
            <strong>Using the PDF Chatbot</strong>
            <span className="toggle-icon">{expandedSections.using ? "−" : "+"}</span>
          </button>
          <div className={`section-content ${expandedSections.using ? 'expanded' : ''}`}>
            <div className="help-item">
              <strong>How do I upload a PDF?</strong>
              <span>Click the upload icon in the dashboard, select your file, and start chatting instantly.</span>
            </div>
            <div className="help-item">
              <strong>What can I ask the chatbot?</strong>
              <span>Ask anything: "Summarize this page," "Extract tables," or "Explain this section" – it uses AI for natural responses.</span>
            </div>
            <div className="help-item">
              <strong>Can I chat with multiple PDFs at once?</strong>
              <span>Yes! Upload several files to the workspace, and the chatbot can reference all of them in a single conversation for cross-document insights.</span>
            </div>
          </div>
        </div>

        {/* Main Section 2: Analysis Features */}
        <div className="help-section">
          <button 
            className={`section-header ${expandedSections.analysis ? 'expanded' : ''}`}
            onClick={() => toggleSection('analysis')}
          >
            <strong>Analysis & OCR</strong>
            <span className="toggle-icon">{expandedSections.analysis ? "−" : "+"}</span>
          </button>
          <div className={`section-content ${expandedSections.analysis ? 'expanded' : ''}`}>
            <div className="help-item">
              <strong>How does Analysis work?</strong>
              <span>Basic mode uses simple matching; Advanced dives deeper with AI patterns for insights, charts, and data extraction.</span>
            </div>
            <div className="help-item">
              <strong>What is OCR and when to use it?</strong>
              <span>OCR extracts text from scanned or image-based PDFs. Enable it for non-digital documents to unlock full chatbot functionality.</span>
            </div>
            <div className="help-item">
              <strong>Can I export analysis results?</strong>
              <span>Absolutely! Download summaries, extracted data, or charts as PDF, CSV, or images directly from the results panel.</span>
            </div>
          </div>
        </div>

        {/* Main Section 3: Privacy & Support */}
        <div className="help-section">
          <button 
            className={`section-header ${expandedSections.privacy ? 'expanded' : ''}`}
            onClick={() => toggleSection('privacy')}
          >
            <strong>Privacy</strong>
            <span className="toggle-icon">{expandedSections.privacy ? "−" : "+"}</span>
          </button>
          <div className={`section-content ${expandedSections.privacy ? 'expanded' : ''}`}>
            <div className="help-item">
              <strong>Is my data private?</strong>
              <span>Yes! PDFs are processed securely and not stored without consent. Learn more at <a href="https://www.rovexai.com/privacy-policy" target="_blank" rel="noopener noreferrer">rovexai.com/privacy</a>.</span>
            </div>
            <div className="help-item warning">
              <strong>📱 Mobile Tip</strong>
              <span>Enable <b>Desktop Mode</b> in your browser for full features like editing and OCR.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}