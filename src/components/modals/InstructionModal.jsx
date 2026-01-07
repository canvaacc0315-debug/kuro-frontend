import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./InstructionModal.css";

const STORAGE_KEY = "rovex_instructions_shown_session"; // Per-session (clears on tab close)

export default function InstructionModal() {
  const [isOpen, setIsOpen] = useState(false); // Start closed
  const [isClosing, setIsClosing] = useState(false); // For close animation
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    // Close if not on dashboard
    if (location.pathname !== "/dashboard") {
      setIsOpen(false);
      setIsClosing(false);
      return;
    }

    // Show ONLY on dashboard entry, if not already shown in this session
    const shown = sessionStorage.getItem(STORAGE_KEY);
    if (!shown) {
      setIsOpen(true);
    }

    // Re-show only on initial page load/refresh to dashboard (not on other routes)
    const handlePageShow = () => {
      if (pathRef.current === "/dashboard" && !sessionStorage.getItem(STORAGE_KEY)) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setIsClosing(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [location.pathname]);

  const handleClose = () => {
    setIsClosing(true); // Trigger close animation
    setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "true"); // Mark as shown for session
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Extra guard: don't render if not on dashboard
  if (location.pathname !== "/dashboard") {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className={`instruction-overlay ${isClosing ? "fade-out" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`instruction-modal ${isClosing ? "pop-out" : ""}`}>
        <div className="instruction-header">
          <h2 id="modal-title">🧭 Quick Start Instructions</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close modal">
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
              <strong>Handle Scans:</strong> Apply OCR to convert pdfs to editable content and pull out structured data.
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