// src/components/ChatWithPdfPanel.jsx
import { useState, useEffect, useMemo } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
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

export default function ChatWithPdfPanel({ pdfs, selectedPdfId, onSelectPdf }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState("current");
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

  const [searchHistory, setSearchHistory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [exportStatus, setExportStatus] = useState("");

  const [scope, setScope] = useState("Entire PDF");
  const [answerStyle, setAnswerStyle] = useState("Helpful explanation");

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
    setActiveTab("current");
  }

  // Filtered and paginated history
  const filteredHistory = chatHistory.filter((item) =>
    item.title.toLowerCase().includes(searchHistory.toLowerCase()) || item.preview.toLowerCase().includes(searchHistory.toLowerCase())
  );
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const conversationHTML = useMemo(() => {
    let html = `<html><head><title>RovexAI Chat Export</title></head><body><h1>RovexAI - CHAT CONVERSATION EXPORT</h1>`;
    html += `<p>Exported: ${new Date().toLocaleString()}</p><hr>`;

    if (!messages.length) {
      html += "<p>No messages in this conversation.</p>";
      return html + "</body></html>";
    }

    messages.forEach((msg) => {
      html += `<p><strong>[${msg.role.toUpperCase()}] ${msg.timestamp || ""}</strong><br>${msg.content}</p>`;
    });
    return html + "</body></html>";
  }, [messages]);

  const conversationMD = useMemo(() => {
    let md = "# RovexAI - CHAT CONVERSATION EXPORT\n";
    md += `Exported: ${new Date().toLocaleString()}\n\n---\n\n`;

    if (!messages.length) {
      md += "No messages in this conversation.";
      return md;
    }

    messages.forEach((msg) => {
      md += `### [${msg.role.toUpperCase()}] ${msg.timestamp || ""}\n${msg.content}\n\n`;
    });
    return md;
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
      doc.save(`rovex-chat-${ts}.pdf`);
      setExportStatus("Exported as PDF");
      return;
    }

    if (format === "docx") {
      // simple .docx‑ish text file – good enough for Word/Docs
      downloadFile(
        conversationText,
        `rovex-chat-${ts}.docx`,
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
      downloadFile(csv, `rovex-chat-${ts}.csv`, "text/csv");
      setExportStatus("Exported as CSV");
      return;
    }

    if (format === "txt") {
      downloadFile(conversationText, `rovex-chat-${ts}.txt`, "text/plain");
      setExportStatus("Exported as TXT");
      return;
    }

    if (format === "html") {
      downloadFile(conversationHTML, `rovex-chat-${ts}.html`, "text/html");
      setExportStatus("Exported as HTML");
      return;
    }

    if (format === "md") {
      downloadFile(conversationMD, `rovex-chat-${ts}.md`, "text/markdown");
      setExportStatus("Exported as MD");
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
    const link = `https://rovex.ai/share/${Math.random()
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
    <div className="chat-panel-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "current" ? "active" : ""}`}
          onClick={() => setActiveTab("current")}
        >
          Current Chat
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Chat History
        </button>
        <button
          className={`tab ${activeTab === "export" ? "active" : ""}`}
          onClick={() => setActiveTab("export")}
        >
          Export Conversation
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "current" && (
          <div className="current-chat">
            <div className="sidebar">
              <div className="scope-selector">
                <button className={`scope-btn ${scope === "Entire PDF" ? "active" : ""}`} onClick={() => setScope("Entire PDF")}>
                  Entire PDF
                </button>
                <button className={`scope-btn ${scope === "Page" ? "active" : ""}`} onClick={() => setScope("Page")}>
                  Page
                </button>
                <button className={`scope-btn ${scope === "Range" ? "active" : ""}`} onClick={() => setScope("Range")}>
                  Range
                </button>
              </div>
              <select className="pdf-dropdown" value={selectedPdfId || ""} onChange={(e) => onSelectPdf?.(e.target.value)}>
                <option value="">Select PDF</option>
                {pdfs.map((pdf) => (
                  <option key={pdf.pdf_id} value={pdf.pdf_id}>
                    {pdf.filename || pdf.name}
                  </option>
                ))}
              </select>
              <select className="answer-style" value={answerStyle} onChange={(e) => setAnswerStyle(e.target.value)}>
                <option>Helpful explanation</option>
                {/* Add more options if needed */}
              </select>
              <div className="action-buttons">
                <button className="save-btn" onClick={() => {
                  // Simulate save: add current messages to history
                  const newConv = {
                    id: Date.now(),
                    title: messages[1]?.content.slice(0, 50) || "New Chat",
                    messagesCount: messages.length,
                    ago: "Just now",
                    preview: messages[1]?.content.slice(0, 50) || "",
                    messages: messages.map(m => ({ role: m.role, content: m.content })),
                  };
                  setChatHistory(prev => [newConv, ...prev]);
                }}>Save</button>
                <button className="clear-btn" onClick={() => setMessages([])}>Clear Conversation</button>
              </div>
            </div>
            <div className="chat-main">
              <div className="messages">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`message ${m.role === "user" ? "user" : "bot"}`}
                  >
                    {m.role === "bot" && (
                      <img
                        src="/kuro.png"
                        alt="kuro"
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
              <form className="input-area" onSubmit={handleSend}>
                <textarea
                  className="chat-input"
                  placeholder="Ask anything about your PDFs…"
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
            <div className="suggestions">
              <h4>Try asking:</h4>
              <ul>
                <li>What is this PDF about?</li>
                <li>What is the main objective of this PDF?</li>
                <li>Who is the intended audience?</li>
                <li>What problem does this document address?</li>
                <li>Give a concise summary of this PDF</li>
                <li>What is the most important takeaways?</li>
                <li>Extract the key points from this PDF</li>
                <li>Summarize the document in bullet points</li>
                <li>Summarize the document in filler points</li>
                <li>Summarize the document in bullet points</li>
                <li>Genefes-revison notes from this PDF</li>
                <li>What are future sers tile mentioned?</li>
                <li>What future scope is suggested?</li>
                <li>Extract only the conclusions from this PDF</li>
                <li>What parts of the document should focus on first?</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="chat-history">
            <div className="history-header">
              <input
                type="text"
                className="search-bar"
                placeholder="Search chat history..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
              />
              <button className="clear-all-btn" onClick={handleClearHistory}>
                Clear All
              </button>
            </div>
            <ul className="history-list">
              {paginatedHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div className="empty-title">No Chat History Yet</div>
                  <div className="empty-desc">
                    Your previous conversations will appear here after you save
                    them.
                  </div>
                </div>
              ) : (
                paginatedHistory.map((conv) => (
                  <li key={conv.id} className="history-card">
                    <div className="history-info">
                      <h5>{conv.title}</h5>
                      <p>Saved on {conv.ago}</p>
                      <p>📄 {conv.preview}</p>
                    </div>
                    <div className="history-actions">
                      <button className="load-btn" onClick={() => handleLoadConversation(conv)}>
                        Load
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteConversation(conv.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                &lt;
              </button>
              <span>Page {currentPage} of {Math.ceil(filteredHistory.length / itemsPerPage)}</span>
              <button disabled={currentPage === Math.ceil(filteredHistory.length / itemsPerPage)} onClick={() => setCurrentPage(currentPage + 1)}>
                &gt;
              </button>
            </div>
          </div>
        )}

        {activeTab === "export" && (
          <div className="export-grid">
            {[
              { icon: "📄", title: "Export as PDF", desc: "Download your entire conversation with timestamps.", btn: "Export PDF", format: "pdf" },
              { icon: "📝", title: "Export as Word (DOCX)", desc: "Perfect for editing and sharing in Microsoft Word or Google Docs.", btn: "Export DOCX", format: "docx" },
              { icon: "📊", title: "Export as CSV", desc: "Import to Excel or Google Sheets for analysis and processing.", btn: "Export CSV", format: "csv" },
              { icon: "📄", title: "Export as Text (TXT)", desc: "Simple plain text format, universal compatibility.", btn: "Export TXT", format: "txt" },
              { icon: "📋", title: "Copy to Clipboard", desc: "Copy the entire conversation to paste anywhere.", btn: "Copy Text", func: handleCopyToClipboard },
              { icon: "🌐", title: "Export as HTML", desc: "Export as a web-ready HTML file with clickable links and formatting.", btn: "Export HTML", format: "html" },
              { icon: "📝", title: "Export as Markdown (MD)", desc: "Save your conversation in Markdown syntax for easy formatting.", btn: "Export MD", format: "md" },
              { icon: "🔗", title: "Shareable Link", desc: "Get a shareable link to your conversation for easy sharing.", btn: "Generate Link", func: handleGenerateShareLink },
            ].map((option, idx) => (
              <div key={idx} className="export-card">
                <div className="export-icon">{option.icon}</div>
                <h5>{option.title}</h5>
                <p>{option.desc}</p>
                <button className="export-btn" onClick={option.func || (() => handleExport(option.format))}>
                  {option.btn}
                </button>
              </div>
            ))}
            {exportStatus && (
              <div className="export-status">
                <div className="status-icon">✅</div>
                <div className="status-message">{exportStatus}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}