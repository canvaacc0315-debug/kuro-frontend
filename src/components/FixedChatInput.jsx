import { useState } from "react";
import pdfQuestionSets from "../config/pdfQuestionSets.js";
import "../styles/fixedChatInput.css";

export default function FixedChatInput({ chatInput, setChatInput, onSend }) {
  const [view, setView] = useState("groups"); // groups | questionsdsadsd
  const [activeGroup, setActiveGroup] = useState(null);

  const showQuestions = (group) => {
    setActiveGroup(group);
    setView("questions");
  };

  const goBack = () => {
    setView("groups");
    setActiveGroup(null);
  };

  return (
    <div className="fixed-input-area">
      {/* Title Row */}
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
          pdfQuestionSets.map((group) => (
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
              onClick={() => {
                setChatInput(q);
              }}
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
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend();
              setView("groups");
            }
          }}
        />

        <svg
          className="send-icon"
          viewBox="0 0 24 24"
          onClick={() => {
            onSend();
            setView("groups");
          }}
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </div>
    </div>
  );
}