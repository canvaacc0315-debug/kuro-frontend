import { useState } from "react";
import { MessageCircle, X, ChevronRight, ChevronDown, ChevronLeft, MessageSquare } from "lucide-react";
import "./floating-help.css";

const categories = [
  {
    id: "using",
    title: "Using the RovexAI Chatbot",
    subtitle: "Basics & Privacy",
    questions: [
      { q: "Is this a formal medical diagnosis?", a: "No. RovexAI provides intelligent analysis of your texts and PDFs based on AI, but it is not intended for medical, legal, or formal professional advice." },
      { q: "How does RovexAI work?", a: "RovexAI parses your documents instantly and uses an advanced language model to let you chat naturally about the contents, extract data, or build study materials." },
      { q: "Is my data private?", a: "Yes! PDFs are processed securely and not stored without consent. Learn more at rovexai.com/privacy." }
    ]
  },
  {
    id: "analysis",
    title: "Analysis Types",
    subtitle: "Simple vs Advanced Check",
    questions: [
      { q: "How does Analysis work?", a: "Basic mode uses straightforward extraction; Advanced dives deeper with AI patterns for insights, charts, and table extraction." },
      { q: "What is OCR and when to use it?", a: "OCR extracts text from scanned or image-based PDFs. Enable it for non-digital documents to unlock full chatbot functionality." },
      { q: "Can I export analysis results?", a: "Absolutely! Download summaries, extracted data, or charts as PDF, CSV, or images directly from the results panel." }
    ]
  },
  {
    id: "safety",
    title: "Safety & Emergencies",
    subtitle: "When to seek urgent care",
    questions: [
      { q: "What if there is an emergency?", a: "Always call your local emergency services immediately. RovexAI is a document tool, not an emergency response system." },
      { q: "Can it handle sensitive documents?", a: "We employ Military-Grade security, but advise against uploading highly classified or top-secret national security files." }
    ]
  }
];

export default function FloatingHelp() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("faq");
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
          setActiveTab("faq");
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
          <h4>RovexAI Support</h4>
          <div className="help-tabs">
            <button
              className={`help-tab ${activeTab === 'faq' ? 'active' : ''}`}
              onClick={() => { setActiveTab('faq'); setActiveCategoryId(null); }}
            >
              FAQ
            </button>
            <button
              className={`help-tab ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              Live Chat
            </button>
          </div>
        </div>

        <div className="help-body">
          {activeTab === 'live' ? (
            <div className="help-live-chat">
              <MessageSquare size={40} className="live-icon" />
              <h5>Live support coming soon</h5>
              <p>Our team is currently building the live chat integration. For urgent requests, please check the Contact page.</p>
            </div>
          ) : activeCategoryId === null ? (
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

              <button
                className="category-card contact-card"
                onClick={() => setActiveTab('live')}
              >
                <div className="category-card-info">
                  <strong>Still need help?</strong>
                  <span>Ask our AI Assistant specifically about RovexAI.</span>
                </div>
                <MessageCircle size={18} className="category-arrow" style={{ opacity: 0.6 }} />
              </button>
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