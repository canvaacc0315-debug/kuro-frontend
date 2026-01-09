import "../styles/chatInputBar.css";
import { useState, useRef, useEffect } from "react";
import PdfQuestionSuggestions from "./PdfQuestionSuggestions.jsx";

export default function ChatInputBar({ value, onChange, onSend, disabled = false }) {
  const inputRef = useRef(null);
  const [isComposing, setIsComposing] = useState(false); // For IME input handling

  // Auto-focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    // Send on Enter (but not when Shift+Enter or during IME composition)
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
    // Allow new line with Shift+Enter
    if (e.key === "Enter" && e.shiftKey) {
      return; // Let the default behavior add a new line
    }
  };

  const handleSend = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !disabled) {
      onSend(trimmedValue);
      // Don't clear input here - let parent component handle state
    }
  };

  return (
    <div className="chat-input-bar">
      <PdfQuestionSuggestions />
      <div className="chat-input-wrapper">
        <div className="left-icons">
          <button className="icon-btn" aria-label="Upload" disabled={disabled}>+</button>
          <button className="icon-btn" aria-label="Voice input" disabled={disabled}>🎤</button>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Describe symptoms..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          disabled={disabled}
          aria-label="Message input"
          aria-describedby="send-instructions"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="true"
        />
        <button className="icon-btn right-icon" aria-label="Emoji picker" disabled={disabled}>😀</button>
      </div>
    </div>
  );
}