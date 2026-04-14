import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LZString from "lz-string";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, AlertTriangle, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
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
    <>
      <style>{`
        .shared-chat-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--bg-primary, #0A0A0A);
          color: var(--text-primary, #ffffff);
          font-family: 'Inter', system-ui, sans-serif;
        }

        .shared-chat-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(10px, 3vw, 32px);
          background: radial-gradient(circle at top right, rgba(var(--accent-rgb, 99, 102, 241), 0.1), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(var(--accent-rgb, 99, 102, 241), 0.05), transparent 40%);
        }

        .shared-chat-card {
          width: 100%;
          max-width: 900px;
          height: calc(100vh - 100px);
          max-height: 900px;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary, #111111);
          border-radius: 24px;
          border: 1px solid var(--border-color, #2a2a2a);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.02);
          overflow: hidden;
          position: relative;
        }

        .shared-chat-header {
          padding: 20px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color, #2a2a2a);
          background: rgba(15, 15, 15, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 10;
        }

        .shared-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          scroll-behavior: smooth;
        }

        .shared-chat-footer {
          padding: 24px;
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-color, #2a2a2a);
          text-align: center;
          z-index: 10;
        }

        .message-bubble-wrapper {
          max-width: 85%;
          display: flex;
          align-items: flex-end;
          gap: 12px;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .shared-chat-main {
            padding: 0;
            background: none;
          }
          .shared-chat-card {
            height: calc(100vh - 60px); /* Adjust based on KuroHeader height */
            max-height: none;
            border-radius: 0;
            border: none;
            box-shadow: none;
            border-top: 1px solid var(--border-color, #2a2a2a);
          }
          .shared-chat-header {
            padding: 16px 20px;
          }
          .shared-chat-messages {
            padding: 20px 16px;
          }
          .message-bubble-wrapper {
            max-width: 95%;
          }
          .shared-chat-footer {
            padding: 20px 16px;
          }
        }
      `}</style>

      <div className="shared-chat-root">
        <KuroHeader />
        
        <main className="shared-chat-main">
          <motion.div 
            className="shared-chat-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            
            <div className="shared-chat-header">
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ 
                  background: "linear-gradient(135deg, var(--accent, #6366f1) 0%, var(--accent-hover, #4f46e5) 100%)", 
                  padding: "10px", 
                  borderRadius: "12px", 
                  color: "white",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                }}>
                  <MessageSquare size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>Shared Chat</h2>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px" }}>Read-only snapshot</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/")}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  color: "var(--text-secondary)", 
                  background: "var(--bg-tertiary)", 
                  border: "1px solid var(--border-color)", 
                  padding: "8px 14px",
                  borderRadius: "100px",
                  cursor: "pointer", 
                  transition: "all 0.2s ease" 
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}
                onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-color)"; }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>

            <div className="shared-chat-messages no-scrollbar">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: "16px" }}
                >
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "20px", borderRadius: "50%" }}>
                    <AlertTriangle size={40} color="#ef4444" />
                  </div>
                  <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.2rem" }}>Link Invalid</h3>
                  <p style={{ maxWidth: "350px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{error}</p>
                  <button 
                    onClick={() => navigate("/")}
                    style={{ marginTop: "8px", padding: "10px 24px", background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "100px", cursor: "pointer", fontWeight: "600", transition: "background 0.2s" }}
                  >
                    Go to Homepage
                  </button>
                </motion.div>
              )}

              {!error && !conversation && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px" }}>
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: "24px", height: "24px", border: "2px solid var(--text-muted)", borderTopColor: "var(--accent)", borderRadius: "50%" }} 
                  />
                  <p style={{ color: "var(--text-muted)", fontWeight: "500", fontSize: "14px" }}>Decrypting Shared Chat...</p>
                </div>
              )}

              {!error && conversation && (
                <div className="messages-centered-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                  {conversation.map((m, index) => (
                    <motion.div
                      key={m.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                      className={`message-row ${m.role === "user" ? "user-row" : "bot-row"}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: m.role === "user" ? "flex-end" : "flex-start",
                        marginBottom: "24px",
                        width: "100%"
                      }}
                    >
                      <div className="message-bubble-wrapper" style={{ flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                        
                        {/* Avatar */}
                        <div className="avatar-wrapper" style={{ flexShrink: 0, marginBottom: m.role === "bot" ? "6px" : "2px" }}>
                          {m.role === "bot" ? (
                            <div style={{ 
                              width: "36px", height: "36px", borderRadius: "12px", background: "var(--bg-tertiary, #1f1f1f)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              border: "1px solid var(--border-color, #2a2a2a)", overflow: "hidden",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                            }}>
                              <img src="/kuro.png" alt="Rovex" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                            </div>
                          ) : (
                            <div style={{ 
                              width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-tertiary)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              border: "1px solid var(--border-color)", color: "var(--text-secondary)",
                              fontWeight: "600", fontSize: "14px"
                            }}>
                              U
                            </div>
                          )}
                        </div>

                        {/* Bubble */}
                        <div 
                          className={`message-bubble ${m.role === "user" ? "user-bubble" : "bot-bubble"}`}
                          style={{ 
                            padding: m.role === "bot" ? "0 4px" : "14px 20px", 
                            borderRadius: m.role === "bot" ? "0" : (m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px"), 
                            boxShadow: m.role === "bot" ? "none" : "0 4px 15px rgba(0,0,0,0.05)", 
                            border: m.role === "bot" ? "none" : "1px solid rgba(255,255,255,0.05)",
                            background: m.role === "user" 
                              ? "linear-gradient(135deg, var(--accent, #6366f1), var(--accent-hover, #4f46e5))" 
                              : "transparent",
                            color: m.role === "user" ? "#ffffff" : "var(--text-primary)", 
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
                            opacity: m.role === "user" ? 0.8 : 0.5, 
                            marginTop: m.role === "user" ? "6px" : "8px", 
                            textAlign: m.role === "user" ? "right" : "left",
                            color: m.role === "user" ? "rgba(255,255,255,0.9)" : "var(--text-muted)",
                            fontWeight: "500"
                          }}>
                            {m.timestamp}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div style={{ height: "40px" }} /> {/* Bottom padding */}
                </div>
              )}
            </div>
            
            {!error && conversation && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="shared-chat-footer"
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px", fontWeight: "500" }}>
                    Experience the smartest PDF Assistant. Join RovexAI for free!
                  </p>
                  <button 
                    onClick={() => navigate("/dashboard")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 28px",
                      background: "var(--text-primary)",
                      color: "var(--bg-primary)",
                      border: "none",
                      borderRadius: "100px",
                      fontWeight: "700",
                      fontSize: "15px",
                      cursor: "pointer",
                      boxShadow: "0 8px 20px rgba(255,255,255,0.1)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 12px 25px rgba(255,255,255,0.15)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,255,255,0.1)";
                    }}
                  >
                    <Sparkles size={16} color="var(--accent)" />
                    Try Real-Time Chat
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
}
