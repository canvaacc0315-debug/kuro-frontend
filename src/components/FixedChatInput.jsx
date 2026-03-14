import { useState, useRef, useEffect } from "react";
import "../styles/fixedChatInput.css";
import { PDF_QUESTION_SETS } from "../config/pdfQuestionSets.js";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles } from "lucide-react";

export default function FixedChatInput({ message, setMessage, onSend }) {
  const [view, setView] = useState("groups"); // groups | questions
  const [activeGroup, setActiveGroup] = useState(null);
  const scrollRef = useRef(null);

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

  // Reset scroll on view change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [view]);

  return (
    <div className="fixed-input-area" id="fixed-input-area">
      {/* Container for animations */}
      <div className="input-content-container">
        
        {/* Title/Header with Sparkle icon */}
        <div className="title-row">
          <AnimatePresence mode="wait">
            {view === "questions" ? (
              <motion.button 
                key="back"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="back-btn" 
                onClick={goBack}
              >
                <ArrowLeft size={14} /> Back
              </motion.button>
            ) : (
              <motion.div 
                key="sparkle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="sparkle-icon"
              >
                <Sparkles size={14} />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="title-text">
            {view === "groups" ? "Try these questions" : activeGroup?.title}
          </span>
        </div>

        {/* Horizontal Scrolling Chips */}
        <div className="scroll-outer">
          <div className="buttons-container no-scrollbar" ref={scrollRef}>
            <AnimatePresence mode="wait">
              {view === "groups" ? (
                <motion.div 
                  key="groups"
                  className="chips-row"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {PDF_QUESTION_SETS.map((group) => (
                    <motion.div
                      key={group.id}
                      className="group-header"
                      onClick={() => showQuestions(group)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {group.title}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="questions"
                  className="chips-row"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {activeGroup?.questions.map((q, i) => (
                    <motion.div
                      key={i}
                      className="question-chip"
                      onClick={() => setMessage(q)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {q}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Input Wrapper */}
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

          <motion.button 
            className={`send-button ${!message.trim() ? 'disabled' : ''}`}
            onClick={handleSend}
            whileHover={message.trim() ? { scale: 1.15 } : {}}
            whileTap={message.trim() ? { scale: 0.9 } : {}}
            disabled={!message.trim()}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}