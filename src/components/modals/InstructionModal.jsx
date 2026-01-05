import { useEffect, useState } from "react";
import "./InstructionModal.css";

const STORAGE_KEY = "rovex_show_instructions";

export default function InstructionModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Always show on site re-entry
    const shouldShow = localStorage.getItem(STORAGE_KEY);

    if (shouldShow !== "false") {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="instruction-overlay">
      <div className="instruction-modal">
        <h2>👋 Welcome to RovexAI</h2>

        <ul>
          <li>📄 Upload PDFs to start chatting</li>
          <li>💬 Ask questions based on your PDFs</li>
          <li>📊 Use Analysis for deeper insights</li>
          <li>🔍 OCR extracts text from scanned PDFs</li>
          <li>✏️ Create & edit PDFs in real time</li>
        
        <li className="highlight">
            📱 <strong>Mobile Users:</strong><br />
            Please enable <strong>Desktop Mode</strong> in your browser menu for the best experience.
        </li>
        </ul>
        <div className="instruction-actions">
          <button onClick={handleClose} className="primary">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
