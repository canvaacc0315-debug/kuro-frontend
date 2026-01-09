import "./chatInputBar.css";
import { useState, useRef, useEffect } from "react";

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

  const isSendDisabled = !value.trim() || disabled;

  return (
    <div className="chat-input-bar">
      <div className="chat-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message here..."
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
        
        <button
          onClick={handleSend}
          disabled={isSendDisabled}
          aria-label="Send message"
          aria-disabled={isSendDisabled}
          className={isSendDisabled ? "disabled" : ""}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path 
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span id="send-instructions" className="visually-hidden">
            Press Enter to send, Shift+Enter for new line
          </span>
        </button>
      </div>
      
      <div className="input-hints">
        <span className="hint-text">Press ↵ Enter to send</span>
        <span className="hint-text">Shift + ↵ Enter for new line</span>
      </div>
    </div>
  );
}