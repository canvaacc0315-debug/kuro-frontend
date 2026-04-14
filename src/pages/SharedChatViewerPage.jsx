import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LZString from "lz-string";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import KuroHeader from "../components/layout/KuroHeader";
import "../styles/workspace.css";

export default function SharedChatViewerPage() {
  const [conversation, setConversation] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Read hash from window.location
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (!hash) {
      setError("No chat data found in the URL.");
      return;
    }

    try {
      // Decompress
      const decompressedData = LZString.decompressFromEncodedURIComponent(hash);
      if (!decompressedData) {
        throw new Error("Failed to decompress chat data. Link might be truncated or invalid.");
      }

      // Parse JSON
      const parsedConversation = JSON.parse(decompressedData);
      
      if (!Array.isArray(parsedConversation)) {
        throw new Error("Chat data is incorrectly formatted.");
      }

      setConversation(parsedConversation);
    } catch (err) {
      console.error("Shared chat decode error:", err);
      setError(err.message || "Could not parse the shared chat.");
    }
  }, []);

  return (
    <div className="workspace-root bg-primary" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <KuroHeader />
      
      <main className="main-container" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="content-wrapper" style={{ maxWidth: "800px", width: "100%", height: "90vh", display: "flex", flexDirection: "column", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
          
          <div className="chat-header-modern" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", background: "var(--bg-tertiary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "var(--accent-subtle)", padding: "8px", borderRadius: "8px", color: "var(--accent)" }}>
                <MessageSquare size={20} />
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>Shared Conversation</h2>
            </div>
            <button 
              onClick={() => navigate("/")}
              style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500", color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", transition: "color 0.2s ease" }}
            >
              <ArrowLeft size={16} /> Back to RovexAI
            </button>
          </div>

          <div className="chat-wrapper" style={{ flex: 1, overflowY: "auto", position: "relative", padding: "24px" }}>
            {error && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", color: "var(--text-secondary)", gap: "16px" }}>
                <AlertTriangle size={48} color="var(--error)" />
                <h3 style={{ margin: 0, color: "var(--text-primary)" }}>Oops! Something went wrong</h3>
                <p style={{ maxWidth: "400px" }}>{error}</p>
                <button 
                  onClick={() => navigate("/")}
                  style={{ marginTop: "16px", padding: "10px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                >
                  Go to Homepage
                </button>
              </div>
            )}

            {!error && !conversation && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <p style={{ color: "var(--text-muted)" }}>Loading Shared Chat...</p>
              </div>
            )}

            {!error && conversation && (
              <div className="messages-centered-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", pb: "40px" }}>
                {conversation.map((m, index) => (
                  <motion.div
                    key={m.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
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
                            <img src="/kuro.png" alt="Rovex" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                          </div>
                        ) : (
                          <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "10px", 
                            background: "var(--bg-card)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "var(--shadow-sm)",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-secondary)",
                            fontWeight: "bold"
                          }}>
                            U
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div 
                        className={`message-bubble ${m.role === "user" ? "user-bubble" : "bot-bubble"}`}
                        style={{ 
                          padding: m.role === "bot" ? "0" : "12px 18px", 
                          borderRadius: m.role === "bot" ? "0" : (m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px"), 
                          boxShadow: m.role === "bot" ? "none" : "var(--shadow-md)", 
                          border: m.role === "bot" ? "none" : "1px solid var(--border-color)",
                          background: m.role === "user" 
                            ? "linear-gradient(135deg, var(--accent), var(--accent-dark))" 
                            : (m.role === "bot" ? "transparent" : "var(--bg-card)"),
                          backdropFilter: m.role === "bot" ? "none" : (m.role === "bot" ? "blur(10px)" : "none"),
                          color: m.role === "user" ? "white" : "var(--text-primary)", 
                          fontSize: "1rem",
                          lineHeight: "1.6",
                          position: "relative",
                          wordBreak: "break-word",
                          margin: "0"
                        }}
                      >
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>
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
              </div>
            )}
          </div>
          
          {!error && conversation && (
            <div style={{ padding: "16px 24px", background: "var(--bg-tertiary)", borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
              <p style={{ margin: "0 0 12px 0", color: "var(--text-secondary)", fontSize: "14px" }}>
                This is a shared read-only snapshot. Create your own conversations for free on RovexAI!
              </p>
              <button 
                onClick={() => navigate("/dashboard")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  background: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "100px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-md)",
                  transition: "transform 0.2s ease"
                }}
                onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                Start Using RovexAI <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
