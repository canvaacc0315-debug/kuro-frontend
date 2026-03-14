import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Calendar, FileText, LayoutList } from "lucide-react";
import "../styles/chatHistory.css";

const ChatHistory = ({
  paginatedHistory,
  searchQuery,
  setSearchQuery,
  onLoad,
  onDelete,
  onClear,
  currentPage,
  setCurrentPage,
  totalPages
}) => {
  return (
    <div className="chat-history-content">
      <header className="history-header-modern">
        <div className="title-group">
          <h2>Chat History</h2>
          <p>{paginatedHistory.length} items found</p>
        </div>
        <button className="clear-all-btn" onClick={onClear}>
          <Trash2 size={16} />
          Clear All
        </button>
      </header>

      <div className="search-box-container">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search your conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {paginatedHistory.length === 0 ? (
          <motion.div
            key="empty"
            className="history-empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="empty-visual">
              <LayoutList size={64} />
            </div>
            <h3>No conversations yet</h3>
            <p>Your saved chats will appear here once you save them from the chat tab.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="list" 
            className="history-list-grid"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {paginatedHistory.map((h) => (
              <motion.div
                key={h.id}
                className="history-card"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
              >
                <div className="card-top">
                  <div className="card-icon">
                    <MessageSquare size={18} />
                  </div>
                  <div className="card-mains">
                    <h4 title={h.title}>{h.title}</h4>
                    <span className="card-date">
                      <Calendar size={12} />
                      {h.meta}
                    </span>
                  </div>
                </div>
                
                <div className="card-sub">
                  <FileText size={12} />
                  <span>{h.pdfName}</span>
                </div>

                <div className="card-actions">
                  <button className="btn-load" onClick={() => onLoad(h.id)}>
                    View Chat
                  </button>
                  <button className="btn-delete" onClick={() => onDelete(h.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="history-pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Prev
          </button>
          <div className="page-indicators">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === currentPage ? "active" : ""}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Internal mini-component for consistenty if needed
const MessageSquare = ({ size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default ChatHistory;
