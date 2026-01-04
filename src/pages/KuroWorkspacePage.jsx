// src/pages/KuroWorkspacePage.jsx
import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import { RovexProvider } from "../core/RovexProvider";

import "../styles/workspace.css";
import AnalysisPanel from "../components/AnalysisPanel.jsx";
import PdfDesignCanvas from "../components/PdfDesignCanvas.jsx";
import CreatePdfPanel from "../components/CreatePdfPanel.jsx";
import { useClerk } from "@clerk/clerk-react";
import { useApiClient } from "../api/client";
import { jsPDF } from "jspdf";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import OcrPanel from "../components/OcrPanel";


const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function KuroWorkspacePage() {
  const { user, isLoaded } = useUser();
  const { uploadPdf } = useApiClient(); // 👈 NEW
  // --- URL tab wiring ---
  const [searchParams, setSearchParams] = useSearchParams();
  const getInitialTab = () => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl === "upload" ||
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
  // which file is currently being previewed in the Upload tab
  const [previewFile, setPreviewFile] = useState(null);
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
      ["upload", "chat", "analysis", "ocr", "create"].includes(tabFromUrl) &&
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
  // ---------------- upload ----------------
  const handleFiles = async (fileList) => {
    const pdfs = Array.from(fileList).filter(
      (f) => f.type === "application/pdf"
    );
    if (!pdfs.length) return;
    try {
      // ⬇️ real upload to backend so we get real pdf_id (UUID)
      const res = await uploadPdf(pdfs); // { pdfs: [{ pdf_id, filename }, ...] }
      const backendPdfs = res?.pdfs || [];
      setUploadedFiles((prev) => {
        const mapped = backendPdfs.map((info, idx) => {
          const file = pdfs[idx];
          return {
            id: info.pdf_id, // 👈 this now matches backend pdf_id
            name: info.filename,
            sizeMB: (file.size / 1024 / 1024).toFixed(2),
            url: URL.createObjectURL(file),
          };
        });
        // auto‑select first pdf if none selected yet
        if (!selectedPdfId && mapped.length > 0) {
          setSelectedPdfId(mapped[0].id);
        }
        return [...prev, ...mapped];
      });
    } catch (err) {
      console.error("PDF upload failed:", err);
      showStatus("PDF upload failed – check backend.", "error");
    }
  };
  const handleFileInputChange = (e) => handleFiles(e.target.files);
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      // clean up preview URL
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter((f) => f.id !== id);
    });
    if (id === selectedPdfId) {
      setSelectedPdfId("");
    }
    // if we were previewing this file, close preview
    if (previewFile && previewFile.id === id) {
      setPreviewFile(null);
    }
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
      // ---- CHANGED: avoid setFont that passes style param (old jspdf internals) ----
      // doc.setFont("Courier", "Normal"); // <-- older code triggered setFontType
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
  const handleCopyText = async () => {
    try {
      const txt = conversationAsPlainText();
      await navigator.clipboard.writeText(txt);
      showStatus("Conversation copied to clipboard.");
    } catch {
      showStatus("Clipboard permission denied.", "error");
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
  return (
    <RovexProvider>
    <div className="workspace-root">
      {/* TOP NAVBAR (same style as home) */}
      <header className="navbar">
        <div className="navbar-brand">
          <KuroLogo size={36} />   {/* ✅ uses same logo */}
          <div className="navbar-brand-text">RovexAI</div>
        </div>
        <div className="navbar-right">
          <div className="user-info">
            <div className="user-avatar">
              {isLoaded && user?.firstName
                ? user.firstName[0].toUpperCase()
                : "?"}
            </div>
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
      {/* MAIN */}
      <main className="main-container">
        <header className="workspace-header">
          <div>
            <h1 className="workspace-title">
              Welcome to{" "}
              <span className="workspace-title-accent">RovexAI</span>
            </h1>
          </div>
        </header>
        {/* top‑level tabs */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => handleTabClick("upload")}
          >
            📤 Upload PDFs
          </button>
          <button
            className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => handleTabClick("chat")}
          >
            💬 Chat Rovex
          </button>
          <button
            className={`tab-btn ${activeTab === "analysis" ? "active" : ""}`}
            onClick={() => handleTabClick("analysis")}
          >
            📊 Analysis
          </button>
          <button
            className={`tab-btn ${activeTab === "ocr" ? "active" : ""}`}
            onClick={() => handleTabClick("ocr")}
          >
            🔍 OCR(PDF)
          </button>
          <button
            className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => handleTabClick("create")}
          >
            ✏️ Create & Edit
          </button>
        </div>
        {/* UPLOAD TAB */}
        <section
          id="uploadTab"
          className={`tab-content ${activeTab === "upload" ? "active" : ""}`}
        >
          <div className="upload-container">
            {/* LEFT: either upload UI OR PDF preview */}
            {previewFile ? (
              <div className="pdf-preview-panel">
                <div className="pdf-preview-header">
                  <div className="pdf-preview-title">
                    📄 Preview: {previewFile.name}
                  </div>
                  <button
                    type="button"
                    className="pdf-preview-back-btn"
                    onClick={() => setPreviewFile(null)}
                  >
                    ← Back to uploads
                  </button>
                </div>
                <iframe
                  className="pdf-preview-frame"
                  src={previewFile.url}
                  title={previewFile.name}
                  style={{
                    width: "100%",
                    height: "75vh",
                    border: "none",
                    borderRadius: "10px",
                    background: "#111",
                  }}
                />
              </div>
            ) : (
              <div
                className="upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="upload-icon">📁</div>
                <div className="upload-title">Drag & Drop PDFs Here</div>
                <div className="upload-desc">
                  Or click to browse from your computer. Support for multiple
                  files.
                </div>
                <button
                  className="upload-btn"
                  type="button"
                  onClick={() =>
                    document.getElementById("fileInputHidden")?.click()
                  }
                >
                  Select PDFs
                </button>
                <input
                  id="fileInputHidden"
                  type="file"
                  multiple
                  accept=".pdf"
                  className="file-input"
                  onChange={handleFileInputChange}
                />
              </div>
            )}
            {/* RIGHT: uploaded files list */}
            <div className="uploaded-files">
              <div className="uploaded-files-title">📋 Uploaded Files</div>
              {uploadedFiles.length === 0 ? (
                <div className="empty-state" style={{ padding: 20, margin: 0 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    No files uploaded yet
                  </div>
                </div>
              ) : (
                uploadedFiles.map((f) => (
                  <div key={f.id} className="file-item">
                    <div className="file-info">
                      <div className="file-icon">📄</div>
                      <div className="file-details">
                        <div className="file-name">{f.name}</div>
                        <div className="file-size">{f.sizeMB} MB</div>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button
                        className="file-action-btn"
                        type="button"
                        onClick={() => setPreviewFile(f)}
                      >
                        View
                      </button>
                      <button
                        className="file-action-btn"
                        type="button"
                        onClick={() => handleRemoveFile(f.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        {/* CHAT TAB */}
        <section
          id="chatTab"
          className={`tab-content ${activeTab === "chat" ? "active" : ""}`}
        >
          {/* sub‑tabs */}
          <div className="chat-subtabs-nav">
            <button
              className={`chat-subtab-btn ${
                activeChatSubTab === "current" ? "active" : ""
              }`}
              onClick={() => handleChatSubTabClick("current")}
            >
              💬 Current Chat
            </button>
            <button
              className={`chat-subtab-btn ${
                activeChatSubTab === "history" ? "active" : ""
              }`}
              onClick={() => handleChatSubTabClick("history")}
            >
              📚 Chat History
            </button>
            <button
              className={`chat-subtab-btn ${
                activeChatSubTab === "export" ? "active" : ""
              }`}
              onClick={() => handleChatSubTabClick("export")}
            >
              📥 Export Conversation
            </button>
          </div>
          {/* CURRENT CHAT */}
          {activeChatSubTab === "current" && (
            <div className="chat-subtab-content active">
              {/* top row: PDF select (left), answer style (middle‑right), actions (right) */}
              <div className="chat-top-row">
                <div className="chat-pdf-select">
                  <label className="form-label">PDF to chat with</label>
                  <select
                    className="form-select"
                    value={selectedPdfId}
                    onChange={(e) => setSelectedPdfId(e.target.value)}
                    disabled={uploadedFiles.length === 0}
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
                  <label className="form-label">Answer style</label>
                  <select
                    className="form-select"
                    value={answerStyle}
                    onChange={(e) => setAnswerStyle(e.target.value)}
                  >
                    <option value="default">Helpful explanation</option>
                    <option value="summary">Concise summary</option>
                    <option value="exam">Exam / questions</option>
                    <option value="bullet">Bullet points</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="clear-conversation-btn"
                    onClick={handleSaveConversation}
                  >
                    💾 Save Conversation
                  </button>
                  <button
                    type="button"
                    className="clear-conversation-btn"
                    onClick={handleClearConversation}
                  >
                    🗑 Clear Conversation
                  </button>
                </div>
              </div>
              {/* banner with selected file */}
              {selectedFile && (
                <div className="chat-selected-file-banner">
                  Chatting with: <strong>{selectedFile.name}</strong>
                </div>
              )}
              <div className="chat-container">
                <div className="chat-messages">
                  {conversation.map((m) => (
                    <div
                      key={m.id}
                      className={`message ${
                        m.role === "user" ? "user" : "bot"
                      }`}
                    >
                      {m.role === "bot" && (
                        <img
                          src="\kuro-logo.png"
                          alt="kuro-logo"
                          className="message-avatar"
                        />
                      )}
                      <div className="message-bubble">{m.content}</div>

                      {m.role === "user" && (
                        <img
                          src={user?.imageUrl}
                          alt="User"
                          className="message-avatar"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="chat-input-area">
                  <input
                    className="chat-input"
                    placeholder="Ask anything about your PDFs..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    disabled={isSending}
                  />
                  <button
                    className="send-btn"
                    type="button"
                    onClick={handleSend}
                    disabled={isSending}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* CHAT HISTORY */}
          {activeChatSubTab === "history" && (
            <div className="chat-subtab-content active">
              <div className="history-container">
                <div className="history-header">
                  <h3 className="history-title">📚 Your Chat History</h3>
                  <button
                    type="button"
                    className="clear-history-btn"
                    onClick={handleClearHistory}
                  >
                    Clear All
                  </button>
                </div>
                {history.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <div className="empty-title">No Chat History Yet</div>
                    <div className="empty-desc">
                      Your saved conversations will appear here. Save a
                      conversation from the Current Chat tab to get started.
                    </div>
                  </div>
                ) : (
                  <div className="history-list">
                    {history.map((h) => (
                      <div key={h.id} className="history-item">
                        <div>
                          <div className="history-item-title">{h.title}</div>
                          <div className="history-item-info">{h.meta}</div>
                        </div>
                        <div className="history-item-actions">
                          <button
                            className="history-item-btn"
                            type="button"
                            onClick={() => handleLoadHistoryItem(h.id)}
                          >
                            Load
                          </button>
                          <button
                            className="history-item-btn"
                            type="button"
                            onClick={() => handleDeleteHistoryItem(h.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* EXPORT CONVERSATION */}
          {activeChatSubTab === "export" && (
            <div className="chat-subtab-content active">
              <div className="export-container">
                <div className="export-header">
                  <h3 className="export-title">📥 Export Your Conversation</h3>
                  <p className="export-desc">
                    Download or share your current chat conversation in multiple
                    formats.
                  </p>
                </div>
                <div className="export-options-grid export-grid-3">
                  <div className="export-card">
                    <span className="export-icon">📄</span>
                    <h4 className="export-card-title">Export as PDF</h4>
                    <p className="export-card-desc">
                      Download your entire conversation with formatting and
                      timestamps.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportPDF}
                    >
                      📥 Export PDF
                    </button>
                  </div>
                  <div className="export-card">
                    <span className="export-icon">📝</span>
                    <h4 className="export-card-title">
                      Export as Word (.DOCX)
                    </h4>
                    <p className="export-card-desc">
                      Perfect for editing and sharing in Microsoft Word or
                      Google Docs.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportDOCX}
                    >
                      📥 Export DOCX
                    </button>
                  </div>
                  <div className="export-card">
                    <span className="export-icon">📊</span>
                    <h4 className="export-card-title">Export as CSV</h4>
                    <p className="export-card-desc">
                      Import to Excel or Google Sheets for analysis and
                      processing.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportCSV}
                    >
                      📥 Export CSV
                    </button>
                  </div>
                  <div className="export-card">
                    <span className="export-icon">📋</span>
                    <h4 className="export-card-title">
                      Export as Text (.TXT)
                    </h4>
                    <p className="export-card-desc">
                      Simple plain text format, universal compatibility.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleExportTXT}
                    >
                      📥 Export TXT
                    </button>
                  </div>
                  <div className="export-card">
                    <span className="export-icon">📋</span>
                    <h4 className="export-card-title">Copy to Clipboard</h4>
                    <p className="export-card-desc">
                      Copy the entire conversation to paste anywhere.
                    </p>
                    <button
                      className="export-btn"
                      type="button"
                      onClick={handleCopyText}
                    >
                      📋 Copy Text
                    </button>
                  </div>
                </div>
                {exportStatus && (
                  <div className="export-status">
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
          )}
        </section>
        {/* OTHER TABS */}
        {/* ANALYSIS TAB → uses AnalysisPanel */}
        <section
          id="analysisTab"
          className={`tab-content ${
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
          className={`tab-content ${activeTab === "ocr" ? "active" : ""}`}
        >
          <OcrPanel />
        </section>
        {/* CREATE & EDIT TAB → uses PdfDesignCanvas */}
        <section
          id="createTab"
          className={`tab-content ${activeTab === "create" ? "active" : ""}`}
        >
          <CreatePdfPanel />
        </section>
      </main>
    </div>
    </RovexProvider>
  );
}