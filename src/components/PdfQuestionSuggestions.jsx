import { PDF_QUESTION_SETS } from "../config/pdfQuestionSets";
import "../styles/chat-overrides.css";
import "../styles/no-scrollbar-override.css";
export default function PdfQuestionSuggestions({ onSelect }) {
  return (
    <div className="question-suggestions">
      <div className="question-header">💡 Try asking</div>

      {PDF_QUESTION_SETS.map((group) => (
        <div key={group.title} className="question-group">
          <div className="question-group-title">{group.title}</div>

          <div className="question-list">
            {group.questions.map((q) => (
              <button
                key={q}
                className="question-chip"
                onClick={() => onSelect(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}