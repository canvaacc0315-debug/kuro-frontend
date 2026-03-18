import { useState } from "react";
import { MessageCircle, X, ChevronRight, ChevronDown, ChevronLeft, MessageSquare } from "lucide-react";
import "./floating-help.css";

const categories = [
  {
    id: "using",
    title: "Using the RovexAI Chatbot",
    subtitle: "Basics & Privacy",
    questions: [
      { q: "What types of PDFs can I upload?", a: "You can upload almost any standard PDF document (textbooks, financial reports, research papers). Both text-based and scanned PDFs are supported depending on your plan tier." },
      { q: "How does the AI answer questions?", a: "RovexAI parses your documents instantly. When you ask a question, it searches the document's content to generate highly accurate answers directly citing your text." },
      { q: "Is my uploaded data private?", a: "Absolutely! We employ industry-standard encryption. Your PDFs are processed securely and never used to train global AI models without your explicit consent." },
      { q: "Can the chatbot read charts and tables?", a: "Yes. Advanced Analysis mode is capable of understanding structured data inside tables and interpreting simple charts within your PDF." },
      { q: "Is there a file size limit?", a: "The free tier supports up to 10MB per PDF. Premium users can upload documents up to 50MB and hundreds of pages at once." }
    ]
  },
  {
    id: "analysis",
    title: "Analysis Types",
    subtitle: "Simple vs Advanced Check",
    questions: [
      { q: "How does Basic Analysis work?", a: "Basic mode uses straightforward text extraction, making it ultra-fast and perfect for simple text-based PDFs and quick summaries." },
      { q: "What is Advanced Analysis?", a: "Advanced Analysis uses deep AI patterns to extract insights, understand complex document layouts, and generate detailed, structured multi-page reports." },
      { q: "When should I turn on OCR?", a: "OCR (Optical Character Recognition) should be enabled when you upload scanned documents or image-based PDFs where the text isn't normally selectable." },
      { q: "Can I export the analysis results?", a: "Yes! You can instantly download your summaries, extracted data, or chat histories as PDF, Markdown, or CSV files from the results panel." }
    ]
  },
  {
    id: "tools",
    title: "PDF Tools & Study Mode",
    subtitle: "Editing and Flashcards",
    questions: [
      { q: "Can I generate flashcards?", a: "Yes! Study Mode can automatically generate interactive flashcards and practice quizzes based on the textbook or notes you upload." },
      { q: "Does RovexAI support merging PDFs?", a: "The PDF Tools section allows you to merge multiple documents into a single file before beginning your chat session." },
      { q: "Can I highlight and add notes?", a: "The native PDF viewer within the workspace allows you to highlight text, draw, and drop pins which you can then reference in your AI chat." }
    ]
  }
];

export default function FloatingHelp() {
  const [open, setOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  const handleCategoryClick = (id) => {
    setActiveCategoryId(id);
    setExpandedIndex(null);
  };

  const handleBack = () => {
    setActiveCategoryId(null);
    setExpandedIndex(null);
  };

  const toggleQuestion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleOpen = () => {
    setOpen((v) => {
      if (v) {
        // Reset state when closing panel
        setTimeout(() => {
          setActiveCategoryId(null);
          setExpandedIndex(null);
        }, 300);
      }
      return !v;
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        className={`floating-help-btn ${open ? 'open' : ''}`}
        onClick={toggleOpen}
        aria-label={open ? "Close Help" : "Open Help"}
        aria-expanded={open}
        aria-controls="help-panel"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>

      {/* Floating panel */}
      <div
        id="help-panel"
        className={`floating-help-panel ${open ? 'panel-open' : 'panel-closed'}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="help-header-top">
          <h4>RovexAI Help Center</h4>
        </div>

        <div className="help-body">
          {activeCategoryId === null ? (
            <div className="category-list">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="category-card"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <div className="category-card-info">
                    <strong>{cat.title}</strong>
                    <span>{cat.subtitle}</span>
                  </div>
                  <ChevronRight size={18} className="category-arrow" />
                </button>
              ))}
            </div>
          ) : (
            <div className="faq-list">
              <div className="faq-list-header">
                <button className="faq-back-btn" onClick={handleBack}>
                  <ChevronLeft size={16} /> Back
                </button>
                <span className="faq-list-title">{activeCategory.title}</span>
              </div>

              <div className="faq-accordion">
                {activeCategory.questions.map((q, idx) => (
                  <div key={idx} className={`faq-item ${expandedIndex === idx ? 'expanded' : ''}`}>
                    <button className="faq-item-header" onClick={() => toggleQuestion(idx)}>
                      <strong>{q.q}</strong>
                      <ChevronDown size={16} className="faq-chevron" />
                    </button>
                    <div className="faq-item-body">
                      <div className="faq-item-content">
                        {q.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}