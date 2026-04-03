// src/pages/KuroWorkspacePage.jsx
import { useState, useEffect, useRef } from "react";
import { useUser, UserButton, useAuth } from "@clerk/clerk-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RovexProvider } from "../core/RovexProvider";
import "../styles/workspace.css";
import AnalysisPanel from "../components/AnalysisPanel.jsx";
import CreatePdfPanel from "../components/CreatePdfPanel.jsx";
import { useApiClient } from "../api/client";
import { jsPDF } from "jspdf";
import OcrPanel from "../components/OcrPanel";
import logoIcon from "../assets/logo.svg";
// ❌ REMOVED: import ReactMarkdown from "react-markdown";

import { useClerk } from "@clerk/clerk-react";
import KuroHeader from "../components/layout/KuroHeader.jsx";
import UploadPanel from "../components/UploadPanel";
import FixedChatInput from "../components/FixedChatInput";
import PDFWorkspace from "../components/PDFTools/PDFWorkspace.jsx";
import StudyWorkspace from "../components/StudyMode/StudyWorkspace.jsx";
import ChatHistory from "../components/ChatHistory.jsx";
import ChatExport from "../components/ChatExport.jsx";
import {
  FileUp,
  MessageSquare,
  BarChart2,
  ScanSearch,
  PenTool,
  Wrench,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  SlidersHorizontal,
  Search,
  Trash2,
  Save,
  Download,
  Share2,
  History,
  MessageCircle,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ✅ ZERO-DEPENDENCY Markdown renderer
const parseMarkdownToHTML = (text) => {
  if (!text) return '';
  
  let html = text
    // Escape HTML to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (```code```)
    .replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg-tertiary);padding:12px 16px;border-radius:8px;overflow-x:auto;margin:10px 0;border:1px solid var(--border-color);"><code style="font-size:0.85em;font-family:monospace;color:var(--text-primary);white-space:pre;">$1</code></pre>')
    // Headers (###, ##, #)
    .replace(/^### (.*$)/gim, '<h3 style="font-size:1rem;font-weight:600;margin:10px 0 4px;color:var(--text-primary);">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size:1.1rem;font-weight:600;margin:12px 0 6px;color:var(--text-primary);">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size:1.2rem;font-weight:600;margin:14px 0 6px;color:var(--text-primary);border-bottom:1px solid var(--border-color);padding-bottom:4px;">$1</h1>')
    // Bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600;color:var(--text-primary);">$1</strong>')
    // Italic (*text*)
    .replace(/\*(.*?)\*/g, '<em style="color:var(--text-secondary);font-style:italic;">$1</em>')
    // Inline code (`code`)
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-tertiary);color:var(--accent);padding:2px 6px;border-radius:4px;font-size:0.85em;font-family:monospace;border:1px solid var(--border-color);">$1</code>')
    // Blockquote (> text)
    .replace(/^&gt; (.*$)/gim, '<blockquote style="border-left:3px solid var(--accent);padding-left:12px;margin:10px 0;color:var(--text-secondary);font-style:italic;background:var(--bg-secondary);border-radius:0 6px 6px 0;padding:8px 8px 8px 14px;">$1</blockquote>')
    // Bullet points (- item)
    .replace(/^- (.*$)/gim, '<li style="margin-bottom:4px;line-height:1.6;color:var(--text-primary);list-style-type:disc;margin-left:1.5em;">$1</li>')
    // Numbered lists (1. item)
    .replace(/^\d+\. (.*$)/gim, '<li style="margin-bottom:4px;line-height:1.6;color:var(--text-primary);list-style-type:decimal;margin-left:1.5em;">$1</li>')
    // Horizontal rule (---)
    .replace(/^---$/gim, '<hr style="border:none;border-top:1px solid var(--border-color);margin:12px 0;">')
    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p style="margin:0 0 8px 0;line-height:1.7;color:var(--text-primary);">${html}</p>`;
  }

  return html;
};

// ✅ Bot Markdown Component (Zero Dependencies)
function BotMarkdown({ content }) {
  const html = parseMarkdownToHTML(content);
  
  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        maxWidth: '100%',
        overflowWrap: 'break-word',
        lineHeight: '1.6'
      }}
    />
  );
}

export default function KuroWorkspacePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { uploadPdf } = useApiClient();
  const { openUserProfile } = useClerk();

  const [searchParams, setSearchParams] = useSearchParams();
  const getInitialTab = () => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl === "chat" ||
      tabFromUrl === "analysis" ||
      tabFromUrl === "ocr" ||
      tabFromUrl === "create" ||
      tabFromUrl === "pdftools" ||
      tabFromUrl === "upload" ||
      tabFromUrl === "studymode"
    ) {
      return tabFromUrl;
    }
    return "chat";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [activeChatSubTab, setActiveChatSubTab] = useState("current");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [message, setMessage] = useState("");
  const [answerStyle, setAnswerStyle] = useState("default");
  const [conversation, setConversation] = useState([
    {
      id: "welcome-bot",
      role: "bot",
      content:
        "Hi! I'm Rovex, your PDF chat assistant. Upload a PDF first to start asking questions about its content.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [chatScope, setChatScope] = useState({
    type: "all",
    page: "",
    from: "",
    to: "",
  });
  const [exportStatus, setExportStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const selectedFile = uploadedFiles.find((f) => f.backendId === selectedPdfId) || null;

  const [sessionId, setSessionId] = useState(null);

  const showStatus = (message, type = "success") => {
    setExportStatus({ message, type });
    setTimeout(() => setExportStatus(null), 3000);
  };

  const mapAnswerStyleToMode = (style) => {
    switch (style) {
      case "summary":
        return "concise";
      case "exam":
      case "bullet":
        return "bullet";
      default:
        return "detailed";
    }
  };

  const HISTORY_KEY = "kuroChatHistory";
  const loadHistoryFromStorage = () => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  };

  const saveHistoryToStorage = (nextHistory) => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const stored = loadHistoryFromStorage();
    if (stored.length) {
      setHistory(stored);
    }
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["chat", "analysis", "ocr", "create", "pdftools", "study"].includes(tabFromUrl) &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl);
      if (tabFromUrl === "chat") setActiveChatSubTab("current");
    }
  }, [searchParams, activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "chat") setActiveChatSubTab("current");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  const handleChatSubTabClick = (sub) => {
    setActiveChatSubTab(sub);
  };

  useEffect(() => {
    async function startSession() {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/session/start`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          console.error("Failed to start session:", res.status);
          return;
        }

        const data = await res.json();
        setSessionId(data.session_id);
      } catch (err) {
        console.error("Error starting session:", err);
      }
    }

    if (user && isLoaded) {
      startSession();
    }
  }, [user, isLoaded, getToken]);

  useEffect(() => {
    return () => {
      if (sessionId) {
        navigator.sendBeacon(
          `${API_BASE}/api/session/end`,
          JSON.stringify({ session_id: sessionId })
        );
      }
    };
  }, [sessionId]);

  const handleClearConversation = () => {
    setConversation([
      {
        id: "welcome-bot",
        role: "bot",
        content:
          "New conversation started. Select / upload a PDF and ask your first question!",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setMessage("");
  };

  const handleSend = async () => {
    const text = message.trim();
    if (!text || isSending) return;
    const time = new Date().toLocaleTimeString();
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: time,
    };
    setConversation((prev) => [...prev, userMsg]);
    setMessage("");
    setIsSending(true);

    try {
      const token = await getToken();
      const mode = mapAnswerStyleToMode(answerStyle);
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: text,
          mode,
          pdfId: selectedFile?.backendId || null,
          sessionId: sessionId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        const botErr = {
          id: `b-err-${Date.now()}`,
          role: "bot",
          content: `⚠️ I couldn't reach the AI backend.\nBackend error (${res.status}):\n${errorText}`,
          timestamp: new Date().toLocaleTimeString(),
        };
        setConversation((prev) => [...prev, botErr]);
        return;
      }

      const data = await res.json();
      const answer =
        data.answer && typeof data.answer === "string"
          ? data.answer
          : "(empty answer from backend)";
      const botMsg = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: answer,
        timestamp: new Date().toLocaleTimeString(),
      };
      setConversation((prev) => [...prev, botMsg]);
    } catch (err) {
      const botErr = {
        id: `b-err-${Date.now()}`,
        role: "bot",
        content: `⚠️ Network error while calling AI backend:\n${String(
          err.message || err
        )}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setConversation((prev) => [...prev, botErr]);
    } finally {
      setIsSending(false);
    }
  };

  const conversationAsPlainText = () => {
    if (!conversation.length) return "No active conversation.";
    let txt = "RovexAI - CHAT CONVERSATION EXPORT\n";
    txt += `Exported: ${new Date().toLocaleString()}\n`;
    txt += "==================================================\n\n";
    conversation.forEach((m) => {
      txt += `[${m.role.toUpperCase()}] ${m.timestamp}\n${m.content}\n\n`;
    });
    return txt;
  };

  const conversationAsCSV = () => {
    if (!conversation.length) return "role,timestamp,message\n";
    let csv = "role,timestamp,message\n";
    conversation.forEach((m) => {
      const safe = m.content.replace(/"/g, '""');
      csv += `"${m.role}","${m.timestamp}","${safe}"\n`;
    });
    return csv;
  };

  const conversationAsHTML = () => {
    if (!conversation.length) return "<html><body>No active conversation.</body></html>";
    let html = '<html><head><title>RovexAI Chat Export</title></head><body>';
    html += '<h1>RovexAI - Chat Conversation Export</h1>';
    html += `<p>Exported: ${new Date().toLocaleString()}</p>`;
    html += '<hr>';
    conversation.forEach((m) => {
      html += `<h3>${m.role.toUpperCase()} (${m.timestamp})</h3><p>${m.content.replace(/\n/g, '<br>')}</p>`;
    });
    html += '</body></html>';
    return html;
  };

  const conversationAsMarkdown = () => {
    if (!conversation.length) return "# No active conversation.";
    let md = "# RovexAI - Chat Conversation Export\n\n";
    md += `Exported: ${new Date().toLocaleString()}\n\n`;
    md += "---\n\n";
    conversation.forEach((m) => {
      md += `### ${m.role.toUpperCase()} (${m.timestamp})\n${m.content}\n\n`;
    });
    return md;
  };

  const downloadBlob = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!conversation.length) {
      showStatus("No conversation to export.", "error");
      return;
    }
    try {
      const doc = new jsPDF();
      const marginLeft = 10;
      const maxWidth = 180;
      let cursorY = 15;
      const text = conversationAsPlainText();
      const lines = text.split("\n");
      doc.setFont("Courier");
      doc.setFontSize(11);
      lines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, maxWidth);
        wrapped.forEach((wLine) => {
          if (cursorY > 280) {
            doc.addPage();
            cursorY = 15;
          }
          doc.text(wLine, marginLeft, cursorY);
          cursorY += 7;
        });
      });
      doc.save(`kuro-chat-${Date.now()}.pdf`);
      showStatus("Exported PDF.");
    } catch (err) {
      console.error("PDF export failed", err);
      showStatus("Failed to export PDF.", "error");
    }
  };

  const handleExportDOCX = () => {
    const txt = conversationAsPlainText();
    downloadBlob(
      txt,
      `kuro-chat-${Date.now()}.docx`,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    showStatus("Exported DOCX (simple text version).");
  };

  const handleExportCSV = () => {
    const csv = conversationAsCSV();
    downloadBlob(csv, `kuro-chat-${Date.now()}.csv`, "text/csv");
    showStatus("Exported CSV.");
  };

  const handleExportTXT = () => {
    const txt = conversationAsPlainText();
    downloadBlob(txt, `kuro-chat-${Date.now()}.txt`, "text/plain");
    showStatus("Exported TXT.");
  };

  const handleExportHTML = () => {
    const html = conversationAsHTML();
    downloadBlob(html, `kuro-chat-${Date.now()}.html`, "text/html");
    showStatus("Exported HTML.");
  };

  const handleExportMarkdown = () => {
    const md = conversationAsMarkdown();
    downloadBlob(md, `kuro-chat-${Date.now()}.md`, "text/markdown");
    showStatus("Exported Markdown.");
  };

  const handleCopyText = async () => {
    try {
      const txt = conversationAsPlainText();
      await navigator.clipboard.writeText(txt);
      showStatus("Conversation copied to clipboard.");
    } catch {
      showStatus("Clipboard permission denied.", "error");
    }
  };

  const handleGenerateShareableLink = async () => {
    try {
      const txt = conversationAsPlainText();
      const encoded = btoa(unescape(encodeURIComponent(txt)));
      const dataUrl = `data:text/plain;charset=utf-8;base64,${encoded}`;
      await navigator.clipboard.writeText(dataUrl);
      showStatus("Shareable link copied to clipboard.");
    } catch {
      showStatus("Failed to generate shareable link.", "error");
    }
  };

  const handleSaveConversation = () => {
    const realMessages = conversation.filter(
      (m) => m.role === "user" || m.role === "bot"
    );
    if (realMessages.length <= 1) {
      showStatus("Not enough messages to save.", "error");
      return;
    }
    const firstUser = realMessages.find((m) => m.role === "user");
    const titleBase =
      firstUser?.content?.slice(0, 40).trim() || "Untitled conversation";
    const newEntry = {
      id: `hist-${Date.now()}`,
      title: titleBase,
      meta: `Saved on ${new Date().toLocaleString()}`,
      pdfName: selectedFile?.name || "General Chat",
      pdfId: selectedPdfId || null,
      messages: conversation,
    };
    const nextHistory = [newEntry, ...history];
    setHistory(nextHistory);
    saveHistoryToStorage(nextHistory);
    showStatus("Conversation saved to history.");
  };

  const handleLoadHistoryItem = (id) => {
    const item = history.find((h) => h.id === id);
    if (!item) {
      showStatus("History item not found.", "error");
      return;
    }
    setConversation(item.messages || []);
    if (item.pdfId) setSelectedPdfId(item.pdfId);
    setActiveTab("chat");
    setActiveChatSubTab("current");
    showStatus(`Loaded conversation "${item.title}".`);
  };

  const handleDeleteHistoryItem = (id) => {
    const nextHistory = history.filter((h) => h.id !== id);
    setHistory(nextHistory);
    saveHistoryToStorage(nextHistory);
    showStatus("Conversation deleted from history.");
  };

  const handleClearHistory = () => {
    if (!window.confirm("Clear all saved conversations?")) return;
    setHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
    showStatus("All history cleared.");
  };

  const chatMessagesRef = useRef(null);
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatMessagesRef.current) {
        const element = chatMessagesRef.current;
        element.scrollTop = element.scrollHeight;
      }
    };
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [conversation]);

  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredHistory = history.filter((h) =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const updatePadding = () => {
      const input = document.getElementById("fixed-input-area");
      const chat = chatMessagesRef.current;
      if (input && chat) {
        const height = input.offsetHeight;
        chat.style.paddingBottom = height + 20 + "px";
      }
    };
    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  return (
    <RovexProvider>
      <div className="workspace-root">
        <div style={{ display: isFullScreen ? "none" : "block" }}>
          <KuroHeader />
        </div>

        <motion.aside
          className="sidebar"
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 80 }}
          style={{ display: isFullScreen ? "none" : "flex", "--sidebar-width": isSidebarOpen ? "260px" : "80px" }}
        >
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>

          <nav className="sidebar-nav">
            {[
              { id: "upload", label: "Upload PDF!", icon: <FileUp size={20} /> },
              { id: "chat", label: "Chat", icon: <MessageSquare size={20} /> },
              { id: "analysis", label: "Analysis", icon: <BarChart2 size={20} /> },
              { id: "ocr", label: "OCR", icon: <ScanSearch size={20} /> },
              { id: "create", label: "PDF Creator", icon: <PenTool size={20} /> },
              { id: "pdftools", label: "PDF Tools", icon: <Wrench size={20} /> },
              { id: "study", label: "Study Mode", icon: <GraduationCap size={20} /> },
            ].map((item) => (
              <button
                key={item.id}
                className={`sidebar-item sidebar-item-${item.id} ${activeTab === item.id ? "active" : ""}`}
                onClick={() => handleTabClick(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className="sidebar-label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </nav>
        </motion.aside>

        <main
          className="main-container"
          style={{
            display: isFullScreen ? "none" : "flex",
            "--sidebar-width": isSidebarOpen ? "260px" : "80px"
          }}
        >
          <div className="content-wrapper">
            <section
              id="uploadTab"
              className={`tab-content ${activeTab === "upload" ? "active" : ""}`}
            >
              <UploadPanel
                sessionId={sessionId}
                pdfs={uploadedFiles}
                onPdfsChange={setUploadedFiles}
                onSelectPdf={setSelectedPdfId}
                getToken={getToken}
              />
            </section>

            <section
              id="chatTab"
              className={`tab-content chat-tab-container ${activeTab === "chat" ? "active" : ""}`}
              style={{ display: activeTab === "chat" ? "flex" : "none", flexDirection: "column", height: "100%", background: "var(--bg-primary)" }}
            >
              <div className="chat-header-modern" style={{ padding: "10px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
                <div className="chat-subtab-selector" style={{ display: "flex", gap: "24px" }}>
                  {[
                    { id: "current", label: "Current Chat", icon: <MessageCircle size={16} /> },
                    { id: "history", label: "History", icon: <History size={16} /> },
                    { id: "export", label: "Export", icon: <Download size={16} /> }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      className={`subtab-btn ${activeChatSubTab === sub.id ? "active" : ""}`}
                      onClick={() => setActiveChatSubTab(sub.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: activeChatSubTab === sub.id ? "var(--accent)" : "var(--text-secondary)",
                        fontSize: "14px",
                        fontWeight: activeChatSubTab === sub.id ? "600" : "400",
                        cursor: "pointer",
                        padding: "12px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        position: "relative",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {sub.icon}
                      {sub.label}
                      {activeChatSubTab === sub.id && (
                        <motion.div
                          layoutId="activeSubTab"
                          style={{ position: "absolute", bottom: "-1px", left: 0, right: 0, height: "2px", backgroundColor: "var(--accent)" }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="chat-action-btns" style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleSaveConversation}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--accent-glow)",
                      color: "var(--accent)",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={handleClearConversation}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-secondary)",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
              </div>

              {/* CURRENT CHAT */}
              <div
                className="chat-subtab-content"
                style={{
                  display: activeChatSubTab === "current" ? "flex" : "none",
                  flexDirection: "column",
                  flex: 1,
                  transition: "opacity 300ms ease",
                  opacity: activeChatSubTab === "current" ? 1 : 0
                }}
              >
                <button
                  className="mobile-controls-toggle"
                  onClick={() => setShowMobileControls(!showMobileControls)}
                >
                  <SlidersHorizontal size={14} />
                  {showMobileControls ? "Hide Settings" : "Settings"}
                  {showMobileControls ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <div className={`chat-controls-premium ${showMobileControls ? 'mobile-visible' : 'mobile-hidden'}`} style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "16px 24px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
                  <div className="control-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>PDF:</span>
                    <select
                      className="premium-select"
                      value={selectedPdfId}
                      onChange={(e) => setSelectedPdfId(e.target.value)}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-primary)",
                        padding: "5px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        outline: "none",
                        maxWidth: "180px"
                      }}
                    >
                      {uploadedFiles.length === 0 ? (
                        <option value="">No PDFs yet</option>
                      ) : (
                        <>
                          <option value="">Select PDF…</option>
                          {uploadedFiles.map((f) => (
                            <option key={f.backendId || f.name} value={f.backendId}>
                              {f.name || f.filename}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  <div className="control-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Scope:</span>
                    <div className="scope-pills" style={{ display: "flex", padding: "3px", background: "var(--bg-input)", borderRadius: "100px", border: "1px solid var(--border-color)" }}>
                      {["all", "page", "range"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setChatScope({ ...chatScope, type: s })}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "100px",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: chatScope.type === s ? "600" : "500",
                            background: chatScope.type === s ? "var(--accent)" : "transparent",
                            color: chatScope.type === s ? "white" : "var(--text-secondary)",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {s === "all" ? "Entire PDF" : s === "page" ? "Page" : "Range"}
                        </button>
                      ))}
                    </div>

                    {chatScope.type === "page" && (
                      <input
                        type="number"
                        placeholder="#"
                        value={chatScope.page}
                        onChange={(e) => setChatScope({ ...chatScope, page: e.target.value })}
                        style={{ width: "45px", background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}
                      />
                    )}
                    {chatScope.type === "range" && (
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <input
                          type="number"
                          placeholder="F"
                          value={chatScope.from}
                          onChange={(e) => setChatScope({ ...chatScope, from: e.target.value })}
                          style={{ width: "40px", background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}
                        />
                        <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>-</span>
                        <input
                          type="number"
                          placeholder="T"
                          value={chatScope.to}
                          onChange={(e) => setChatScope({ ...chatScope, to: e.target.value })}
                          style={{ width: "40px", background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="control-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Style:</span>
                    <select
                      className="premium-select"
                      value={answerStyle}
                      onChange={(e) => setAnswerStyle(e.target.value)}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-primary)",
                        padding: "5px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    >
                      <option value="default" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>Default</option>
                      <option value="summary" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>Concise</option>
                      <option value="exam" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>Exam Mode</option>
                      <option value="bullet" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>Bullet Points</option>
                    </select>
                  </div>
                </div>

                <div className="chat-layout" style={{ backgroundColor: "transparent", display: "flex", flexDirection: "column", flex: 1, width: "100%", gap: "24px" }}>
                  <div className="chat-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <div className="chat-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                      <div
                        ref={chatMessagesRef}
                        className="chat-messages no-scrollbar"
                        style={{
                          msOverflowStyle: 'none',
                          scrollbarWidth: 'none',
                          overflowY: "auto",
                          flex: 1,
                          backgroundColor: "transparent",
                          scrollBehavior: "smooth"
                        }}
                      >
                        <div className="messages-centered-container">
                          <AnimatePresence initial={false}>
                            {conversation.map((m, index) => (
                              <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, delay: index === conversation.length - 1 ? 0.1 : 0 }}
                                className={`message-row ${m.role === "user" ? "user-row" : "bot-row"}`}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                                  marginBottom: "20px",
                                  width: "100%"
                                }}
                              >
                                <div style={{
                                  display: "flex",
                                  alignItems: "flex-end",
                                  gap: "10px",
                                  maxWidth: "95%",
                                  flexDirection: m.role === "user" ? "row-reverse" : "row"
                                }}>
                                  {/* Avatar */}
                                  <div className="avatar-wrapper" style={{ flexShrink: 0, marginBottom: "4px" }}>
                                    {m.role === "bot" ? (
                                      <div style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "10px",
                                        background: "var(--bg-tertiary)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "var(--shadow-sm)",
                                        border: "1px solid var(--border-color)",
                                        overflow: "hidden"
                                      }}>
                                        <img src={logoIcon} alt="Rovex" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                                      </div>
                                    ) : (
                                      <img
                                        src={user?.imageUrl}
                                        alt="User"
                                        className="user-avatar"
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          borderRadius: "10px",
                                          border: "1px solid var(--border-color)",
                                          objectFit: "cover"
                                        }}
                                      />
                                    )}
                                  </div>

                                  {/* ✅ FIXED: Bubble with custom Markdown renderer */}
                                  <div
                                    className={`message-bubble ${m.role === "user" ? "user-bubble" : "bot-bubble"}`}
                                    style={{
                                      padding: m.role === "bot" ? "0" : "12px 18px",
                                      borderRadius: m.role === "bot" ? "0" : (m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px"),
                                      boxShadow: m.role === "bot" ? "none" : "var(--shadow-md)",
                                      border: m.role === "bot" ? "none" : "1px solid var(--border-color)",
                                      background: m.role === "user"
                                        ? "linear-gradient(135deg, var(--accent), var(--accent-dark))"
                                        : "transparent",
                                      color: m.role === "user" ? "white" : "var(--text-primary)",
                                      fontSize: "1rem",
                                      lineHeight: "1.6",
                                      position: "relative",
                                      wordBreak: "break-word",
                                      margin: "0"
                                    }}
                                  >
                                    {m.role === "bot" ? (
                                      <BotMarkdown content={m.content} />
                                    ) : (
                                      m.content
                                    )}

                                    <div style={{
                                      fontSize: "0.7rem",
                                      opacity: 0.6,
                                      marginTop: "6px",
                                      textAlign: m.role === "user" ? "right" : "left",
                                      color: m.role === "user" ? "rgba(255,255,255,0.8)" : "var(--text-secondary)"
                                    }}>
                                      {m.timestamp}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}

                            {isSending && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="message-row bot-row"
                                style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "20px" }}
                              >
                                <div className="avatar-wrapper" style={{ flexShrink: 0, marginBottom: "4px" }}>
                                  <div style={{
                                    width: "32px", height: "32px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.05)",
                                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                                  }}>
                                    <img src={logoIcon} alt="Rovex" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                                  </div>
                                </div>
                                <div className="bot-bubble" style={{ padding: "0", borderRadius: "0", background: "transparent", border: "none", display: "flex", gap: "4px", width: "fit-content", boxShadow: "none", margin: "0" }}>
                                  {[0, 1, 2].map((i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                      style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }}
                                    />
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHAT HISTORY */}
              <div
                className="chat-subtab-content"
                style={{
                  display: activeChatSubTab === "history" ? "flex" : "none",
                  flexDirection: "column",
                  flex: 1,
                  padding: "24px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                <ChatHistory
                  paginatedHistory={paginatedHistory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onLoad={handleLoadHistoryItem}
                  onDelete={handleDeleteHistoryItem}
                  onClear={handleClearHistory}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                />
              </div>

              {/* EXPORT CONVERSATION */}
              <div
                className="chat-subtab-content"
                style={{
                  display: activeChatSubTab === "export" ? "flex" : "none",
                  flexDirection: "column",
                  flex: 1,
                  padding: "24px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                <ChatExport
                  exports={{
                    handleExportPDF,
                    handleExportDOCX,
                    handleExportCSV,
                    handleExportTXT,
                    handleCopyText,
                    handleExportHTML,
                    handleExportMarkdown,
                    handleGenerateShareableLink
                  }}
                  status={exportStatus}
                />
              </div>
            </section>

            <section
              id="analysisTab"
              className={`tab-content ${activeTab === "analysis" ? "active" : ""}`}
            >
              <AnalysisPanel
                sessionId={sessionId}
                pdfs={uploadedFiles}
                selectedPdfId={selectedPdfId}
                onPdfChange={setSelectedPdfId}
              />
            </section>

            <section
              id="ocrTab"
              className={`tab-content ${activeTab === "ocr" ? "active" : ""}`}
            >
              <OcrPanel sessionId={sessionId} />
            </section>

            <section
              id="createTab"
              className={`tab-content ${activeTab === "create" ? "active" : ""}`}
            >
              <CreatePdfPanel />
            </section>

            <section
              id="pdftoolsTab"
              className={`tab-content ${activeTab === "pdftools" ? "active" : ""}`}
            >
              <PDFWorkspace />
            </section>

            <section
              id="studyTab"
              className={`tab-content ${activeTab === "study" ? "active" : ""}`}
            >
              <StudyWorkspace uploadedFiles={uploadedFiles} />
            </section>
          </div>
        </main>

        {activeTab === "chat" && activeChatSubTab === "current" && (
          <FixedChatInput
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
          />
        )}
      </div>
    </RovexProvider>
  );
}
