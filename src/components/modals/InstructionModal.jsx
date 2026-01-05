import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./InstructionModal.css";

const STORAGE_KEY = "rovex_instructions_shown_session"; // Per-session (clears on tab close)

export default function InstructionModal() {
  const [open, setOpen] = useState(false); // Start closed
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    // Close if not on dashboard
    if (location.pathname !== "/dashboard") {
      setOpen(false);
      return;
    }

    // Show ONLY on dashboard entry, if not already shown in this session
    const shown = sessionStorage.getItem(STORAGE_KEY);
    if (!shown) {
      setOpen(true);
    }

    // Re-show only on initial page load/refresh to dashboard (not on other routes)
    const handlePageShow = () => {
      if (pathRef.current === "/dashboard" && !sessionStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [location.pathname]);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "true"); // Mark as shown for session
    setOpen(false);
  };

  // Extra guard: don't render if not on dashboard
  if (location.pathname !== "/dashboard") {
    return null;
  }

  if (!open) return null;

  return (
    <div className="instruction-overlay">
      <div className="instruction-modal">
        <div className="instruction-header">
          <h2>🧭 Quick Start Instructions</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="instruction-body">
          <p className="intro-text">
            Follow these steps to get started with RovexAI and unlock the power of your PDFs.
          </p>
          
          <ol className="features-list">
            <li className="highlight">
              <span className="icon">📱</span>
              <strong>Enable Desktop Mode:</strong> If on mobile, switch to desktop view in your browser for the full experience.
            </li>
            <li>
              <span className="icon">📤</span>
              <strong>Upload a PDF:</strong> Click the upload button and select your document to begin.
            </li>
            <li>
              <span className="icon">💬</span>
              <strong>Chat Naturally:</strong> Ask questions in plain English—extract info, summarize, or query content instantly.
            </li>
            <li>
              <span className="icon">📊</span>
              <strong>Analyze Deeply:</strong> Use tools to extract data, generate charts, or uncover insights from your PDF.
            </li>
            <li>
              <span className="icon">✏️</span>
              <strong>Edit & Create:</strong> Drag-and-drop elements, apply templates, or redesign with easy Canva-style tools.
            </li>
            <li>
              <span className="icon">🔍</span>
              <strong>Handle Scans:</strong> Apply OCR to convert images/text to editable content and pull out structured data.
            </li>
          </ol>
        </div>

        <div className="instruction-actions">
          <button onClick={handleClose} className="primary-btn">
            Got It! Let's Go
          </button>
        </div>
      </div>
    </div>
  );
}