import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  FileCode, 
  Table, 
  FileType, 
  Clipboard, 
  Globe, 
  Link2,
  FileBadge
} from "lucide-react";
import "../styles/chatExport.css";

const ChatExport = ({ exports, status }) => {
  const options = [
    { id: 'pdf', icon: <FileText size={24} />, title: "PDF Document", desc: "Download as a formatted PDF page.", handler: exports.handleExportPDF, color: "#ff4d4f" },
    { id: 'docx', icon: <FileType size={24} />, title: "Word File", desc: "Download as an editable Word document.", handler: exports.handleExportDOCX, color: "#1890ff" },
    { id: 'csv', icon: <Table size={24} />, title: "CSV Data", desc: "Download as a spreadsheet-friendly CSV.", handler: exports.handleExportCSV, color: "#52c41a" },
    { id: 'txt', icon: <FileText size={24} />, title: "Plain Text", desc: "Simple .txt file with full transcript.", handler: exports.handleExportTXT, color: "#722ed1" },
    { id: 'copy', icon: <Clipboard size={24} />, title: "Clipboard", desc: "Copy the entire conversation quickly.", handler: exports.handleCopyText, color: "#faad14" },
    { id: 'html', icon: <Globe size={24} />, title: "HTML Page", desc: "Download as a standalone web page.", handler: exports.handleExportHTML, color: "#13c2c2" },
    { id: 'md', icon: <FileCode size={24} />, title: "Markdown", desc: "Clean markdown formatting for logs.", handler: exports.handleExportMarkdown, color: "#0050b3" },
    { id: 'link', icon: <Link2 size={24} />, title: "Shareable Link", desc: "Generate a public link to share.", handler: exports.handleGenerateShareableLink, color: "#eb2f96" },
  ];

  return (
    <div className="chat-export-content">
      <header className="export-header-modern">
        <h2>Export Conversation</h2>
        <p>Choose your preferred format to save the current chat</p>
      </header>

      <div className="export-grid-modern">
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            className="export-card-modern"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ 
              y: -5, 
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--accent-glow)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={option.handler}
          >
            <div 
              className="card-icon-container" 
              style={{ 
                color: option.color, 
                backgroundColor: `${option.color}15`,
                boxShadow: `inset 0 0 12px ${option.color}10` 
              }}
            >
              {option.icon}
            </div>
            <div className="card-text">
              <h3>{option.title}</h3>
              <p>{option.desc}</p>
            </div>
            <div className="card-badge">
              {option.id === 'copy' ? 'Copy' : option.id === 'link' ? 'Link' : 'Download'}
            </div>
          </motion.div>
        ))}
      </div>

      {status && (
        <motion.div 
          className={`export-status-banner ${status.type}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="status-icon">
            {status.type === 'error' ? '!' : '✓'}
          </div>
          <p>{status.message}</p>
        </motion.div>
      )}
    </div>
  );
};

export default ChatExport;
