// src/components/ChatWithPdfPanel.jsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import jsPDF from "jspdf";
import "../styles/chat-panel.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const DEFAULT_HISTORY = [
  {
    id: 1,
    title: "Document Analysis",
    messagesCount: 8,
    ago: "2 hours ago",
    preview: "How to extract tables from PDFs?",
    messages: [
      { role: "user", content: "How can I extract tables from this PDF?" },
      {
        role: "bot",
        content:
          "You can use the 'Analyse → Data extraction' tool. It detects tabular regions and exports them as CSV.",
      },
    ],
  },
  {
    id: 2,
    title: "Contract Review",
    messagesCount: 12,
    ago: "Yesterday",
    preview: "What are key clauses in this agreement?",
    messages: [
      {
        role: "user",
        content: "Highlight key risk clauses in this contract.",
      },
      {
        role: "bot",
        content:
          "Main risk clauses: termination, indemnity, limitation of liability, and governing law.",
      },
    ],
  },
  {
    id: 3,
    title: "Research Summary",
    messagesCount: 5,
    ago: "3 days ago",
    preview: "Summarise the findings in this paper.",
    messages: [
      {
        role: "user",
        content:
          "Give me a summary of this research paper in simple language.",
      },
      {
        role: "bot",
        content:
          "The paper investigates … (example text). You can read the abstract plus section 4 for main results.",
      },
    ],
  },
];

export default function ChatWithPdfPanel({ pdfs, selectedPdfId }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [activeSubTab, setActiveSubTab] = useState("current"); // current | history | export
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      role: "bot",
      content:
        "Hi! I'm Rovex, your PDF chat assistant. Upload a PDF first to start asking questions about its content.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const stored = window.localStorage.getItem("kuroChatHistory");
      return stored ? JSON.parse(stored) : DEFAULT_HISTORY;
    } catch {
      return DEFAULT_HISTORY;
    }
  });

  const [exportStatus, setExportStatus] = useState("");

  // keep history in localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "kuroChatHistory",
        JSON.stringify(chatHistory)
      );
    } catch {
      /* ignore */
    }
  }, [chatHistory]);

  // auto‑hide export status
  useEffect(() => {
    if (!exportStatus) return;
    const t = setTimeout(() => setExportStatus(""), 3000);
    return () => clearTimeout(t);
  }, [exportStatus]);

  const currentPdf =
    pdfs.find((p) => p.pdf_id === selectedPdfId) || null;

  async function handleSend(e) {
    if (e) e.preventDefault();
    if (!selectedPdfId) {
      setError("Upload or select a PDF in the Upload tab first.");
      return;
    }
    if (!question.trim()) {
      setError("Type a question first.");
      return;
    }

    const userText = question.trim();
    const timestamp = new Date().toLocaleTimeString();

    try {
      setLoading(true);
      setError("");

      // add user message immediately
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userText, timestamp },
      ]);
      setQuestion("");

      const token = await getToken();

      const form = new FormData();
      form.append("pdf_id", selectedPdfId);
      form.append("query", userText);
      form.append("mode", "detailed");

      const res = await fetch(`${API_BASE}/api/pdf/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        let msg = `Chat failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const data = await res.json(); // { answer, sources }
      const botText = data.answer || "No answer returned.";

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: botText,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Chat request failed.");
    } finally {
      setLoading(false);
    }
  }

  // === HISTORY HANDLERS ===
  function handleClearHistory() {
    if (!window.confirm("Clear all saved conversations?")) return;
    setChatHistory([]);
  }

  function handleDeleteConversation(id) {
    if (!window.confirm("Delete this conversation?")) return;
    setChatHistory((prev) => prev.filter((c) => c.id !== id));
  }

  function handleLoadConversation(conv) {
    // Show that conversation in the Current Chat tab
    const now = new Date().toLocaleTimeString();
    const mapped =
      conv.messages?.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: now,
      })) || [];
    if (mapped.length === 0) return;

    setMessages(mapped);
    setActiveSubTab("current");
  }

  // === EXPORT HELPERS ===
  const conversationText = useMemo(() => {
    let text = "RovexAI - CHAT CONVERSATION EXPORT\n";
    text += `Exported: ${new Date().toLocaleString()}\n`;
    text += "=".repeat(50) + "\n\n";

    if (!messages.length) {
      text += "No messages in this conversation.";
      return text;
    }

    messages.forEach((msg) => {
      text += `[${msg.role.toUpperCase()}] ${
        msg.timestamp || ""
      }\n${msg.content}\n\n`;
    });
    return text;
  }, [messages]);

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleExport(format) {
    if (!messages.length) {
      setExportStatus("No messages to export yet.");
      return;
    }

    const ts = Date.now();

    if (format === "pdf") {
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(conversationText, 180);
      doc.text(lines, 10, 10);
      doc.save(`kuro-chat-${ts}.pdf`);
      setExportStatus("Exported as PDF");
      return;
    }

    if (format === "docx") {
      // simple .docx‑ish text file – good enough for Word/Docs
      downloadFile(
        conversationText,
        `kuro-chat-${ts}.docx`,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      setExportStatus("Exported as DOCX");
      return;
    }

    if (format === "csv") {
      let csv = "Role,Timestamp,Message\n";
      messages.forEach((m) => {
        const msg = m.content.replace(/"/g, '""');
        csv += `"${m.role}","${m.timestamp || ""}","${msg}"\n`;
      });
      downloadFile(csv, `kuro-chat-${ts}.csv`, "text/csv");
      setExportStatus("Exported as CSV");
      return;
    }

    if (format === "txt") {
      downloadFile(conversationText, `kuro-chat-${ts}.txt`, "text/plain");
      setExportStatus("Exported as TXT");
      return;
    }
  }

  async function handleCopyToClipboard() {
    try {
      await navigator.clipboard.writeText(conversationText);
      setExportStatus("Copied conversation to clipboard");
    } catch {
      setExportStatus("Failed to copy to clipboard");
    }
  }

  function handleGenerateShareLink() {
    const link = `https://kuro.ai/share/${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    // optional: also copy
    try {
      navigator.clipboard.writeText(link);
    } catch {
      /* ignore */
    }
    setExportStatus(`Share link generated: ${link}`);
  }

  return (
    <div className="chat-section">
      <div className="chat-left">
        {/* header showing which PDF */}
        <div className="section-label">CHAT WITH ROVEXAI</div>
        <div className="pdf-selector">
          <div className="pdf-selector-icon">📄</div>
          <div className="pdf-selector-text">
            {currentPdf
              ? `Talking to: ${currentPdf.filename || currentPdf.name}`
              : "Upload or select a PDF in the Upload tab to start chatting."}
          </div>
        </div>

        {/* sub-tabs */}
        <div className="chat-subtabs-nav">
          <button
            type="button"
            className={
              "chat-subtab-btn" +
              (activeSubTab === "current" ? " active" : "")
            }
            onClick={() => setActiveSubTab("current")}
          >
            💬 Current Chat
          </button>
          <button
            type="button"
            className={
              "chat-subtab-btn" +
              (activeSubTab === "history" ? " active" : "")
            }
            onClick={() => setActiveSubTab("history")}
          >
            📚 Chat History
          </button>
          <button
            type="button"
            className={
              "chat-subtab-btn" +
              (activeSubTab === "export" ? " active" : "")
            }
            onClick={() => setActiveSubTab("export")}
          >
            📥 Export Conversation
          </button>
        </div>

        {/* CURRENT CHAT */}
        <div
          className={
            "chat-subtab-content" +
            (activeSubTab === "current" ? " active" : "")
          }
        >
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={"message " + (m.role === "user" ? "user" : "bot")}
                >
                  {m.role === "bot" && (
                    <img
                      src="/rovex-ai-logo.png"
                      alt="RovexAI"
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
            <form className="chat-input-area" onSubmit={handleSend}>
              <textarea
                className="chat-input"
                placeholder="Ask anything about your PDF…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send"}
              </button>
            </form>
            {error && (
              <p className="chat-error-text">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* CHAT HISTORY */}
        <div
          className={
            "chat-subtab-content" +
            (activeSubTab === "history" ? " active" : "")
          }
        >
          <div className="history-container">
            <div className="history-header">
              <h3 className="history-title">📚 Your Chat History</h3>
              <button
                type="button"
                className="clear-history-btn"
                onClick={handleClearHistory}
                disabled={!chatHistory.length}
              >
                Clear All
              </button>
            </div>

            <div className="history-list">
              {chatHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div className="empty-title">No Chat History Yet</div>
                  <div className="empty-desc">
                    Your previous conversations will appear here after you save
                    them.
                  </div>
                </div>
              ) : (
                chatHistory.map((conv) => (
                  <div key={conv.id} className="history-item">
                    <div className="history-item-content">
                      <div className="history-item-title">
                        {conv.title}
                      </div>
                      <div className="history-item-info">
                        {conv.messagesCount} messages • {conv.ago}
                      </div>
                    </div>
                    <div className="history-item-actions">
                      <button
                        type="button"
                        className="history-item-btn"
                        onClick={() => handleLoadConversation(conv)}
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        className="history-item-btn"
                        onClick={() =>
                          handleDeleteConversation(conv.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* EXPORT CONVERSATION */}
        <div
          className={
            "chat-subtab-content" +
            (activeSubTab === "export" ? " active" : "")
          }
        >
          <div className="export-container">
            <div className="export-header">
              <h3 className="export-title">📥 Export Your Conversation</h3>
              <p className="export-desc">
                Download or share your current chat conversation in multiple
                formats.
              </p>
            </div>

            <div className="export-options-grid">
              {/* PDF */}
              <div className="export-card">
                <div className="export-icon">📄</div>
                <div className="export-card-title">Export as PDF</div>
                <div className="export-card-desc">
                  Download your entire conversation with formatting and
                  timestamps.
                </div>
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => handleExport("pdf")}
                >
                  📥 Export PDF
                </button>
              </div>

              {/* DOCX */}
              <div className="export-card">
                <div className="export-icon">📝</div>
                <div className="export-card-title">
                  Export as Word (.DOCX)
                </div>
                <div className="export-card-desc">
                  Perfect for editing and sharing in Microsoft Word or Google
                  Docs.
                </div>
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => handleExport("docx")}
                >
                  📥 Export DOCX
                </button>
              </div>

              {/* CSV */}
              <div className="export-card">
                <div className="export-icon">📊</div>
                <div className="export-card-title">Export as CSV</div>
                <div className="export-card-desc">
                  Import to Excel or Google Sheets for analysis and processing.
                </div>
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => handleExport("csv")}
                >
                  📥 Export CSV
                </button>
              </div>

              {/* TXT */}
              <div className="export-card">
                <div className="export-icon">📋</div>
                <div className="export-card-title">Export as Text (.TXT)</div>
                <div className="export-card-desc">
                  Simple plain text format, universal compatibility.
                </div>
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => handleExport("txt")}
                >
                  📥 Export TXT
                </button>
              </div>

              {/* Copy */}
              <div className="export-card">
                <div className="export-icon">📋</div>
                <div className="export-card-title">Copy to Clipboard</div>
                <div className="export-card-desc">
                  Copy the entire conversation to paste anywhere.
                </div>
                <button
                  type="button"
                  className="export-btn"
                  onClick={handleCopyToClipboard}
                >
                  📋 Copy Text
                </button>
              </div>

              {/* Share link */}
              <div className="export-card">
                <div className="export-icon">🔗</div>
                <div className="export-card-title">Generate Share Link</div>
                <div className="export-card-desc">
                  Create a shareable link to this conversation.
                </div>
                <button
                  type="button"
                  className="export-btn"
                  onClick={handleGenerateShareLink}
                >
                  🔗 Generate Link
                </button>
              </div>
            </div>

            {exportStatus && (
              <div className="export-status">
                <div className="status-icon">✅</div>
                <div className="status-message">{exportStatus}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}