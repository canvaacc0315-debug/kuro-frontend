import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./InstructionModal.css";

export default function InstructionModal() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Force show on every entry (refresh, reopen, route change)
    setOpen(true); // Always show for now – add localStorage logic later if needed

    // Re-show on tab focus/reopen or page show (refresh)
    const handleVisibilityChange = () => {
      if (!document.hidden) { // Tab became visible
        setOpen(true);
      }
    };

    const handlePageShow = () => {
      setOpen(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    // Re-trigger on route change (login/signup)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [location.pathname]);

  const handleClose = () => {
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