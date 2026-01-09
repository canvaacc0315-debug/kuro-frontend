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
import ChatWithPdfPanel from "../components/ChatWithPdfPanel.jsx";

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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");

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
  // ---------------- tabs ----------------
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["chat", "analysis", "ocr", "create"].includes(tabFromUrl) &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };
  // ---------------- render ----------------
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <ChatWithPdfPanel
              pdfs={uploadedFiles}
              selectedPdfId={selectedPdfId}
              onSelectPdf={setSelectedPdfId}
            />
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