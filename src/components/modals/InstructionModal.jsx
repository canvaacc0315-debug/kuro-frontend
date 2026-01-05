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
          <h2>👋 Welcome to RovexAI</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="instruction-body">
          <ul className="features-list">
            <li className="highlight">
              <span className="icon">📱</span>
              Mobile Users For the best experience enable Desktop Mode in your browser settings.
            </li>
            <li>
              <span className="icon">💬</span>
              <span>PDF Chat: Interact with your PDFs using natural language. Ask questions, extract information, and get instant answers.</span>
            </li>
            <li>
              <span className="icon">📊</span>
              <span>Analysis: Deep dive into PDF content. Extract data, generate insights, and visualize information beautifully.</span>
            </li>
            <li>
              <span className="icon">✏️</span>
              <span>Create & Edit: Design and edit PDFs with Canva-like simplicity. Professional templates and easy tools.</span>
            </li>
            <li>
              <span className="icon">🔍</span>
              <span>OCR & Recognition: Convert scanned documents to editable text and extract data from complex layouts.</span>
            </li>
          </ul>
        </div>

        <div className="instruction-actions">
          <button onClick={handleClose} className="primary-btn">
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}