// src/pages/KuroWorkspacePage.jsx
import { useState, useEffect, useRef } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RovexProvider } from "../core/RovexProvider";
import PdfQuestionSuggestions from "../components/PdfQuestionSuggestions";
import "../styles/workspace.css";
import AnalysisPanel from "../components/AnalysisPanel.jsx";
import CreatePdfPanel from "../components/CreatePdfPanel.jsx";
import { useApiClient } from "../api/client";
import { jsPDF } from "jspdf";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import OcrPanel from "../components/OcrPanel";
import "../styles/chat-overrides.css";
import "../styles/no-scrollbar-override.css";
import InstructionModal from "../components/modals/InstructionModal";
import { useClerk } from "@clerk/clerk-react";
import UploadPanel from "../components/UploadPanel"; // ✅ Import the redesigned UploadPanel

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function KuroWorkspacePage() {
  const { user, isLoaded } = useUser();
  const { uploadPdf } = useApiClient(); // Kept but unused now; UploadPanel handles uploads
  // --- URL tab wiring ---
  const { openUserProfile } = useClerk();
  const [searchParams, setSearchParams] = useSearchParams();
  const getInitialTab = () => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl === "chat" ||
      tabFromUrl === "analysis" ||
      tabFromUrl === "ocr" ||
      tabFromUrl === "create"
    ) {
      return tabFromUrl;
    }
    return "chat";
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [activeChatSubTab, setActiveChatSubTab] = useState("current");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [chatInput, setChatInput] = useState("");
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
    type: "all", // all | page | range
    page: "",
    from: "",
    to: "",
  });
  const [exportStatus, setExportStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);
  // ✅ Real history state (replaces demoHistory)
  const [history, setHistory] = useState([]);
  const selectedFile =
    uploadedFiles.find((f) => f.id === selectedPdfId) || null;
  // ---------------- helpers ----------------
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
  // ----- history <-> localStorage helpers -----
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
  // load history on mount
  useEffect(() => {
    const stored = loadHistoryFromStorage();
    if (stored.length) {
      setHistory(stored);
    }
  }, []);
  // ---------------- tabs ----------------
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["chat", "analysis", "ocr", "create"].includes(tabFromUrl) &&
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
  // ---------------- chat ----------------
  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
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
    setChatInput("");
  };
  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;
    const time = new Date().toLocaleTimeString();
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: time,
    };
    setConversation((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSending(true);
    try {
      const mode = mapAnswerStyleToMode(answerStyle);
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: text,
          mode,
          pdfId: selectedPdfId || null,
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
  // ---------------- export helpers ----------------
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
      const maxWidth = 180; // page width (A4) minus margins
      let cursorY = 15;
      const text = conversationAsPlainText();
      const lines = text.split("\n");
      doc.setFont("Courier"); // minimal, safe
      doc.setFontSize(11);
      lines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, maxWidth);
        wrapped.forEach((wLine) => {
          // start a new page if we overflow
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
  // ✅ These handlers were missing – used only in Export tab
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
  // ---------------- history actions (save / load / delete / clear) ----------------
  const handleSaveConversation = () => {
    // ignore if only welcome message
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
  // ---------------- render ----------------
  const chatMessagesRef = useRef(null);
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [conversation]);

  // UI CHANGE: Added scrolled state and useEffect for scroll listener to match provided snippet.
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // NEW STATES FOR HISTORY TAB
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

  return (
    <RovexProvider>
    <InstructionModal />
    <div className="workspace-root">
      {/* UI CHANGE: Moved header to top fixed, full-width black with red accents, logo left, user right. Kept fade-in CSS animation. */}
      <header className={`home-header ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-container" onClick={() => navigate("https://www.rovexai.com/")}>
          <img src="/kuro-logo.png" alt="RovexAI Logo" className="logo-icon" />
          <span className="logo-text">
            <span className="logo-red">Rovex</span>
            <span className="logo-ai">AI</span>
          </span>
        </div>
        <div className="header-links">
          <a href="/homepage" className="nav-link">Home</a>
          <a href="https://rovexai.com/contact" className="nav-link">Help</a>
          <button onClick={openUserProfile} className="nav-link settings-link">
            Settings
          </button>
        </div>
        <div className="navbar-right">
          <div className="user-info">
            <div className="user-name">
              {isLoaded && user
                ? user.fullName ||
                  user.primaryEmailAddress?.emailAddress ||
                  "User"
                : "Loading..."}
            </div>
          </div>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "navbar-profile-photo",
              },
            }}
          />
        </div>
      </header>
      {/* UI CHANGE: Sidebar now without header, starts below top header height. */}
      <aside className="sidebar">
        {/* UI CHANGE: Replaced top tabs-nav with vertical sidebar items. Added icons, labels, hover/active animations (CSS transition). Exact order: Documents (upload), Chat, Analysis, OCR, PDF Creator. White bg, red active highlight. */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => handleTabClick("upload")}
          >
            <span className="sidebar-icon">📄</span>
            <span className="sidebar-label">Upload PDF!</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => handleTabClick("chat")}
          >
            <span className="sidebar-icon">💬</span>
            <span className="sidebar-label">Chat</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === "analysis" ? "active" : ""}`}
            onClick={() => handleTabClick("analysis")}
          >
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-label">Analysis</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === "ocr" ? "active" : ""}`}
            onClick={() => handleTabClick("ocr")}
          >
            <span className="sidebar-icon">🔍</span>
            <span className="sidebar-label">OCR</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === "create" ? "active" : ""}`}
            onClick={() => handleTabClick("create")}
          >
            <span className="sidebar-icon">✏️</span>
            <span className="sidebar-label">PDF Creator</span>
          </button>
        </nav>
      </aside>
      {/* UI CHANGE: Main now to right of sidebar, with clean spacing and card-based sections. Added transition for content fade-in when tab changes. Added margin-top for top header. */}
      <main className="main-container">
        <header className="workspace-header">
          <div>
            <h1 className="workspace-title">
              Welcome to{" "}
              <span className="workspace-title-accent">RovexAI</span>
            </h1>
          </div>
        </header>
        {/* UI CHANGE: Wrapped all tab contents in a container with fade transition. Removed old tabs-nav. Made sections card-like with shadows/spacing for clean SaaS look. */}
        <div className="content-wrapper">
          <section
            id="uploadTab"
            className={`tab-content card ${activeTab === "upload" ? "active" : ""}`}
          >
            <UploadPanel 
              pdfs={uploadedFiles} 
              onPdfsChange={setUploadedFiles} 
              onSelectPdf={setSelectedPdfId} 
            />
          </section>
          <section
            id="chatTab"
            className={`tab-content card ${activeTab === "chat" ? "active" : ""}`}
          >
            {/* REDESIGN: Styled subtabs as modern tabs with red accents, smooth animated switching (transition-all duration-300). */}
            <div className="chat-subtabs-nav" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e5e5" }}>
              <button
                className={`chat-subtab-btn ${activeChatSubTab === "current" ? "active" : ""}`}
                onClick={() => handleChatSubTabClick("current")}
                style={{
                  color: activeChatSubTab === "current" ? "#ef4444" : "#000000",
                  borderBottom: activeChatSubTab === "current" ? "2px solid #ef4444" : "none",
                  transition: "all 300ms ease",
                }}
              >
                Current Chat
              </button>
              <button
                className={`chat-subtab-btn ${activeChatSubTab === "history" ? "active" : ""}`}
                onClick={() => handleChatSubTabClick("history")}
                style={{
                  color: activeChatSubTab === "history" ? "#ef4444" : "#000000",
                  borderBottom: activeChatSubTab === "history" ? "2px solid #ef4444" : "none",
                  transition: "all 300ms ease",
                }}
              >
                Chat History
              </button>
              <button
                className={`chat-subtab-btn ${activeChatSubTab === "export" ? "active" : ""}`}
                onClick={() => handleChatSubTabClick("export")}
                style={{
                  color: activeChatSubTab === "export" ? "#ef4444" : "#000000",
                  borderBottom: activeChatSubTab === "export" ? "2px solid #ef4444" : "none",
                  transition: "all 300ms ease",
                }}
              >
                Export Conversation
              </button>
            </div>
            {/* CURRENT CHAT */}
            <div 
              className="chat-subtab-content" 
              style={{ 
                display: activeChatSubTab === "current" ? "block" : "none",
                transition: "opacity 300ms ease",
                opacity: activeChatSubTab === "current" ? 1 : 0,
              }}
            >
              <div className="chat-layout" style={{ backgroundColor: "#ffffff" }}>

                {/* LEFT — MAIN CHAT */}
                <div className="chat-main">

                  {/* banner with selected file */}
                  {selectedFile && (
                    <div className="chat-selected-file-banner" style={{ color: "#000000", backgroundColor: "#f9f9f9", border: "1px solid #e5e5e5" }}>
                      📄 Chatting with: <strong>{selectedFile.name}</strong>
                    </div>
                  )}
                  {/* TOP CONTROLS */}
                  <div className="chat-top-row" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <div className="chat-scope-bar">
                      <span className="scope-label" style={{ color: "#000000" }}>Scope:</span>

                      <div className="scope-options" style={{ display: "flex", gap: "8px" }}>
                        <button
                          className={`scope-pill ${chatScope.type === "all" ? "active" : ""}`}
                          onClick={() =>
                            setChatScope({ type: "all", page: "", from: "", to: "" })
                          }
                          style={{
                            backgroundColor: chatScope.type === "all" ? "#ef4444" : "#ffffff",
                            color: chatScope.type === "all" ? "#ffffff" : "#000000",
                            border: "1px solid #e5e5e5",
                            transition: "all 200ms ease",
                          }}
                        >
                          Entire PDF
                        </button>

                        <button
                          className={`scope-pill ${chatScope.type === "page" ? "active" : ""}`}
                          onClick={() =>
                            setChatScope({ type: "page", page: "", from: "", to: "" })
                          }
                          style={{
                            backgroundColor: chatScope.type === "page" ? "#ef4444" : "#ffffff",
                            color: chatScope.type === "page" ? "#ffffff" : "#000000",
                            border: "1px solid #e5e5e5",
                            transition: "all 200ms ease",
                          }}
                        >
                          Page
                        </button>

                        <button
                          className={`scope-pill ${chatScope.type === "range" ? "active" : ""}`}
                          onClick={() =>
                            setChatScope({ type: "range", page: "", from: "", to: "" })
                          }
                          style={{
                            backgroundColor: chatScope.type === "range" ? "#ef4444" : "#ffffff",
                            color: chatScope.type === "range" ? "#ffffff" : "#000000",
                            border: "1px solid #e5e5e5",
                            transition: "all 200ms ease",
                          }}
                        >
                          Range
                        </button>
                      </div>

                      {chatScope.type === "page" && (
                        <input
                          type="number"
                          className="scope-input"
                          placeholder="Page #"
                          value={chatScope.page}
                          onChange={(e) =>
                            setChatScope((prev) => ({ ...prev, page: e.target.value }))
                          }
                          min="1"
                          style={{ border: "1px solid #e5e5e5", color: "#000000" }}
                        />
                      )}

                      {chatScope.type === "range" && (
                        <div className="scope-range-inputs" style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="number"
                            className="scope-input"
                            placeholder="From"
                            value={chatScope.from}
                            onChange={(e) =>
                              setChatScope((prev) => ({ ...prev, from: e.target.value }))
                            }
                            min="1"
                            style={{ border: "1px solid #e5e5e5", color: "#000000" }}
                          />
                          <span className="scope-separator" style={{ color: "#000000" }}>–</span>
                          <input
                            type="number"
                            className="scope-input"
                            placeholder="To"
                            value={chatScope.to}
                            onChange={(e) =>
                              setChatScope((prev) => ({ ...prev, to: e.target.value }))
                            }
                            min="1"
                            style={{ border: "1px solid #e5e5e5", color: "#000000" }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="chat-pdf-select">
                      <label className="form-label" style={{ color: "#000000" }}>PDF to chat with:</label>
                      <select
                        className="form-select"
                        value={selectedPdfId}
                        onChange={(e) => setSelectedPdfId(e.target.value)}
                        disabled={uploadedFiles.length === 0}
                        style={{ border: "1px solid #e5e5e5", color: "#000000", backgroundColor: "#ffffff" }}
                      >
                        {uploadedFiles.length === 0 ? (
                          <option>No PDFs uploaded yet</option>
                        ) : (
                          <>
                            <option value="">All PDFs / general chat</option>
                            {uploadedFiles.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    <div className="chat-answer-style">
                      <label className="form-label" style={{ color: "#000000" }}>Answer style:</label>
                      <select
                        className="form-select"
                        value={answerStyle}
                        onChange={(e) => setAnswerStyle(e.target.value)}
                        style={{ border: "1px solid #e5e5e5", color: "#000000", backgroundColor: "#ffffff" }}
                      >
                        <option value="default">Helpful explanation</option>
                        <option value="summary">Concise summary</option>
                        <option value="exam">Exam / questions</option>
                        <option value="bullet">Bullet points</option>
                      </select>
                    </div>
                  </div>

                  {/* CHAT ACTIONS */}
                  <div 
                    className="chat-actions-row" 
                    style={{ 
                      display: "flex", 
                      justifyContent: "flex-start", 
                      padding: "8px 0", 
                      gap: "12px" 
                    }}
                  >
                    <button
                      type="button"
                      className="save-conversation-btn"
                      onClick={handleSaveConversation}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="clear-conversation-btn"
                      onClick={handleClearConversation}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Clear Conversation
                    </button>
                  </div>

                  {/* CHAT MESSAGES */}
                  <div className="chat-container" style={{ backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <div 
                      ref={chatMessagesRef}
                      className="chat-messages no-scrollbar" 
                      style={{ 
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                        padding: "16px",
                        overflowY: "auto",
                      }}
                    >
                      {conversation.map((m) => (
                        <div
                          key={m.id}
                          className={`message ${m.role === "user" ? "user" : "bot"}`}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            marginBottom: "16px",
                            animation: "fadeIn 300ms ease",
                          }}
                        >
                          {m.role === "bot" && (
                            <img
                              src="/kuro-logo.png"
                              alt="kuro-logo"
                              className="message-avatar"
                              style={{ width: "32px", height: "32px", borderRadius: "50%", marginRight: "8px" }}
                            />
                          )}

                          <div className="message-bubble" style={{ backgroundColor: m.role === "user" ? "#f3f4f6" : "#ffffff", padding: "8px 12px", borderRadius: "4px", border: "1px solid #e5e5e5", color: "#000000" }}>
                            {m.content}
                          </div>

                          {m.role === "user" && (
                            <img
                              src={user?.imageUrl}
                              alt="User"
                              className="message-avatar"
                              style={{ width: "32px", height: "32px", borderRadius: "50%", marginLeft: "8px" }}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* INPUT */}
                    <div className="chat-input-area" style={{ display: "flex", padding: "8px", borderTop: "1px solid #e5e5e5" }}>
                      <input
                        className="chat-input"
                        placeholder="Ask anything about your PDFs..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleChatKeyDown}
                        disabled={isSending}
                        style={{ flex: 1, border: "1px solid #e5e5e5", borderRadius: "4px", padding: "8px", color: "#000000", backgroundColor: "#ffffff" }}
                      />
                      <button
                        className="send-btn"
                        type="button"
                        onClick={handleSend}
                        disabled={isSending}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          marginLeft: "8px",
                          cursor: "pointer",
                          transition: "background-color 200ms ease",
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                      >
                        {isSending ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT — QUESTION ASSIST */}
                <div className="chat-assist" style={{ backgroundColor: "#ffffff", padding: "16px", borderLeft: "1px solid #e5e5e5" }}>
                  <PdfQuestionSuggestions
                    onSelect={(q) => {
                      setChatInput(q);
                      setTimeout(() => handleSend(), 100);
                    }}
                  />
                </div>
              </div>
            </div>
            {/* CHAT HISTORY */}
            <div 
              className="chat-subtab-content" 
              style={{ 
                display: activeChatSubTab === "history" ? "block" : "none",
                transition: "opacity 300ms ease",
                opacity: activeChatSubTab === "history" ? 1 : 0,
              }}
            >
              <div className="history-container" style={{ backgroundColor: "#ffffff", padding: "16px" }}>
                <div className="history-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 className="history-title" style={{ color: "#000000" }}>Chat History</h3>
                  <button
                    type="button"
                    className="clear-history-btn"
                    onClick={handleClearHistory}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 200ms ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                  >
                    Clear All
                  </button>
                </div>
                <div className="history-search" style={{ marginBottom: "16px" }}>
                  <input
                    type="text"
                    placeholder="Search chat history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", border: "1px solid #e5e5e5", padding: "8px", borderRadius: "4px", color: "#000000", backgroundColor: "#ffffff" }}
                  />
                </div>
                {paginatedHistory.length === 0 ? (
                  <div className="empty-state" style={{ textAlign: "center", color: "#000000" }}>
                    <div className="empty-icon">📭</div>
                    <div className="empty-title">No Chat History Yet</div>
                    <div className="empty-desc">
                      Your saved conversations will appear here. Save a
                      conversation from the Current Chat tab to get started.
                    </div>
                  </div>
                ) : (
                  <div className="history-list">
                    {paginatedHistory.map((h) => (
                      <div 
                        key={h.id} 
                        className="history-item" 
                        style={{ 
                          backgroundColor: "#ffffff", 
                          border: "1px solid #e5e5e5", 
                          borderRadius: "4px", 
                          padding: "16px", 
                          marginBottom: "12px", 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          transition: "all 200ms ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                          e.currentTarget.style.borderColor = "#ef4444";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                          e.currentTarget.style.borderColor = "#e5e5e5";
                        }}
                      >
                        <div style={{ color: "#000000" }}>
                          <div className="history-item-title" style={{ fontWeight: "bold" }}>{h.title}</div>
                          <div className="history-item-info" style={{ fontSize: "0.875rem", color: "#4b5563" }}>{h.meta}</div>
                          <div className="history-item-pdf" style={{ fontSize: "0.875rem", color: "#4b5563" }}>PDF: {h.pdfName}</div>
                        </div>
                        <div className="history-item-actions" style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="history-item-btn"
                            type="button"
                            onClick={() => handleLoadHistoryItem(h.id)}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "#ffffff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "background-color 200ms ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                          >
                            Load
                          </button>
                          <button
                            className="history-item-btn"
                            type="button"
                            onClick={() => handleDeleteHistoryItem(h.id)}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "#ffffff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "background-color 200ms ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      style={{
                        backgroundColor: currentPage === 1 ? "#e5e5e5" : "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={page === currentPage ? "active" : ""}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          backgroundColor: page === currentPage ? "#ef4444" : "#ffffff",
                          color: page === currentPage ? "#ffffff" : "#000000",
                          border: "1px solid #e5e5e5",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 200ms ease",
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      style={{
                        backgroundColor: currentPage === totalPages ? "#e5e5e5" : "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* EXPORT CONVERSATION */}
            <div 
              className="chat-subtab-content" 
              style={{ 
                display: activeChatSubTab === "export" ? "block" : "none",
                transition: "opacity 300ms ease",
                opacity: activeChatSubTab === "export" ? 1 : 0,
              }}
            >
              <div className="export-container" style={{ backgroundColor: "#ffffff", padding: "16px" }}>
                <div className="export-header" style={{ marginBottom: "24px" }}>
                  <h3 className="export-title" style={{ color: "#000000" }}>Export Conversation</h3>
                  <p className="export-desc" style={{ color: "#4b5563" }}>
                    Choose a format to export your current conversation.
                  </p>
                </div>
                <div className="export-options-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                  <div 
                    className="export-card" 
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e5e5", 
                      borderRadius: "4px", 
                      padding: "16px", 
                      textAlign: "center",
                      transition: "all 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <span className="export-icon" style={{ fontSize: "24px" }}>📄</span>
                    <h4 className="export-card-title" style={{ color: "#000000" }}>Export as PDF</h4>
                    <p className="export-card-desc" style={{ color: "#4b5563" }}>
                      Download as a formatted PDF document.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportPDF}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Export
                    </button>
                  </div>
                  <div 
                    className="export-card" 
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e5e5", 
                      borderRadius: "4px", 
                      padding: "16px", 
                      textAlign: "center",
                      transition: "all 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <span className="export-icon" style={{ fontSize: "24px" }}>📝</span>
                    <h4 className="export-card-title" style={{ color: "#000000" }}>Export as DOCX</h4>
                    <p className="export-card-desc" style={{ color: "#4b5563" }}>
                      Download as a Word document.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportDOCX}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Export
                    </button>
                  </div>
                  <div 
                    className="export-card" 
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e5e5", 
                      borderRadius: "4px", 
                      padding: "16px", 
                      textAlign: "center",
                      transition: "all 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <span className="export-icon" style={{ fontSize: "24px" }}>📊</span>
                    <h4 className="export-card-title" style={{ color: "#000000" }}>Export as CSV</h4>
                    <p className="export-card-desc" style={{ color: "#4b5563" }}>
                      Download as a spreadsheet-compatible CSV.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportCSV}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Export
                    </button>
                  </div>
                  <div 
                    className="export-card" 
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e5e5", 
                      borderRadius: "4px", 
                      padding: "16px", 
                      textAlign: "center",
                      transition: "all 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <span className="export-icon" style={{ fontSize: "24px" }}>📄</span>
                    <h4 className="export-card-title" style={{ color: "#000000" }}>Export as TXT</h4>
                    <p className="export-card-desc" style={{ color: "#4b5563" }}>
                      Download as plain text.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportTXT}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Export
                    </button>
                  </div>
                  <div 
                    className="export-card" 
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e5e5", 
                      borderRadius: "4px", 
                      padding: "16px", 
                      textAlign: "center",
                      transition: "all 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <span className="export-icon" style={{ fontSize: "24px" }}>📋</span>
                    <h4 className="export-card-title" style={{ color: "#000000" }}>Copy to Clipboard</h4>
                    <p className="export-card-desc" style={{ color: "#4b5563" }}>
                      Copy the conversation text.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleCopyText}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Copy
                    </button>
                  </div>
                  <div 
                    className="export-card" 
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e5e5", 
                      borderRadius: "4px", 
                      padding: "16px", 
                      textAlign: "center",
                      transition: "all 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <span className="export-icon" style={{ fontSize: "24px" }}>🌐</span>
                    <h4 className="export-card-title" style={{ color: "#000000" }}>Export as HTML</h4>
                    <p className="export-card-desc" style={{ color: "#4b5563" }}>
                      Download as an HTML file.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportHTML}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Export
                    </button>
                  </div>
                  <div 
                    className="export-card" 
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e5e5", 
                      borderRadius: "4px", 
                      padding: "16px", 
                      textAlign: "center",
                      transition: "all 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <span className="export-icon" style={{ fontSize: "24px" }}>📝</span>
                    <h4 className="export-card-title" style={{ color: "#000000" }}>Export as Markdown</h4>
                    <p className="export-card-desc" style={{ color: "#4b5563" }}>
                      Download as a Markdown file.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportMarkdown}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Export
                    </button>
                  </div>
                  <div 
                    className="export-card" 
                    style={{ 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5e5e5", 
                      borderRadius: "4px", 
                      padding: "16px", 
                      textAlign: "center",
                      transition: "all 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <span className="export-icon" style={{ fontSize: "24px" }}>🔗</span>
                    <h4 className="export-card-title" style={{ color: "#000000" }}>Generate Shareable Link</h4>
                    <p className="export-card-desc" style={{ color: "#4b5563" }}>
                      Copy a link to share the conversation.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleGenerateShareableLink}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 200ms ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      Generate
                    </button>
                  </div>
                </div>
                {exportStatus && (
                  <div className="export-status" style={{ marginTop: "16px", textAlign: "center", color: exportStatus.type === "error" ? "#ef4444" : "#000000" }}>
                    <div className="status-icon">
                      {exportStatus.type === "error" ? "⚠️" : "✅"}
                    </div>
                    <div className="status-message">
                      {exportStatus.message.split("\n").map((l, i) => (
                        <div key={i}>{l}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
          {/* OTHER TABS */}
          {/* ANALYSIS TAB → uses AnalysisPanel */}
          <section
            id="analysisTab"
            className={`tab-content card ${
              activeTab === "analysis" ? "active" : ""
            }`}
          >
            <AnalysisPanel
              pdfs={uploadedFiles}
              selectedPdfId={selectedPdfId}
              onPdfChange={setSelectedPdfId} // 👈 prop name so dropdown works
            />
          </section>
          {/* OCR TAB → NEW ADVANCED OCR PANEL */}
          <section
            id="ocrTab"
            className={`tab-content card ${activeTab === "ocr" ? "active" : ""}`}
          >
            <OcrPanel />
          </section>
          {/* CREATE & EDIT TAB → uses PdfDesignCanvas */}
          <section
            id="createTab"
            className={`tab-content card ${activeTab === "create" ? "active" : ""}`}
          >
            <CreatePdfPanel />
          </section>
        </div>
      </main>
      {/* UI CHANGE: Added full-width black footer with minimal branding/links. */}
    </div>
    </RovexProvider>
  );
}