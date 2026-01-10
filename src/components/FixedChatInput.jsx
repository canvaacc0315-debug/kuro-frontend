import { useState } from "react";
import "../styles/fixedChatInput.css";
import { PDF_QUESTION_SETS } from "../config/pdfQuestionSets.js";

export default function FixedChatInput({ message, setMessage, onSend }) {
  const [view, setView] = useState("groups"); // groups | questions
  const [activeGroup, setActiveGroup] = useState(null);

  const showQuestions = (group) => {
    setActiveGroup(group);
    setView("questions");
  };

  const goBack = () => {
    setView("groups");
    setActiveGroup(null);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSend();
    setView("groups");
  };

  return (
    <div className="fixed-input-area">
      {/* Title */}
      <div className="title-row">
        {view === "questions" && (
          <button className="back-btn" onClick={goBack}>
            ← Back
          </button>
        )}
        <span className="title-text">
          {view === "groups" ? "💡 Try these questions" : "Select a question"}
        </span>
      </div>

      {/* Buttons */}
      <div className="buttons-container">
        {view === "groups" &&
          PDF_QUESTION_SETS.map((group) => (
            <div
              key={group.id}
              className="group-header"
              onClick={() => showQuestions(group)}
            >
              {group.title}
            </div>
          ))}

        {view === "questions" &&
          activeGroup?.questions.map((q, i) => (
            <div
              key={i}
              className="question-chip"
              onClick={() => setMessage(q)}
            >
              {q}
            </div>
          ))}
      </div>

      {/* Input */}
      <div className="input-wrapper">
        <input
          type="text"
          className="main-input"
          placeholder="Talk with your PDF..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <svg
          className="send-icon"
          viewBox="0 0 24 24"
          onClick={handleSend}
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </div>
    </div>
  );
}
