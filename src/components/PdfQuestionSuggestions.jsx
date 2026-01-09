import "../styles/chat-overrides.css";
import { PDF_QUESTION_SETS } from "../config/pdfQuestionSets";

export default function PdfQuestionSuggestions({ onSelect }) {
  return (
    <div className="question-suggestions" style={{ fontSize: "12px", padding: "8px" }}>
      <div className="question-header" style={{ fontSize: "14px", marginBottom: "8px" }}>💡 Try asking</div>

      {PDF_QUESTION_SETS.slice(0, 3).map((group) => (  // Limit to first 3 groups to make smaller
        <div key={group.title} className="question-group" style={{ marginBottom: "8px" }}>
          <div className="question-group-title" style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>{group.title}</div>

          <div className="question-list" style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {group.questions.slice(0, 3).map((q) => (  // Limit to 3 questions per group
              <button
                key={q}
                className="question-chip"
                onClick={() => onSelect(q)}
                style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", background: "#f0f0f0", border: "none", cursor: "pointer" }}
              >
                {q.substring(0, 30) + (q.length > 30 ? "..." : "")}  // Truncate long questions
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
