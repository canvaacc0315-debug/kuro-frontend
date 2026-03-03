// src/pages/DashboardPage.jsx
import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../styles/kuro-dashboard.css";
import { useClerk } from "@clerk/clerk-react";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import { useRef } from "react";
import logoIcon from "../assets/logo.svg";
import {
  MessageSquare, BarChart2, GraduationCap, PenTool,
  ScanSearch, Wrench, Shield, Zap, Bot, Smartphone,
  Link2, Target, ArrowRight, Home, LayoutDashboard, HelpCircle, Settings
} from "lucide-react";

const workspaces = [
  {
    icon: <MessageSquare size={22} />,
    emoji: "💬",
    name: "PDF Chat",
    desc: "Interact with your PDFs using natural language. Ask questions, extract information, and get instant answers.",
    features: ["Smart Q&A Engine", "Context Understanding", "Real-time Responses"],
    tab: "chat",
    color: "#FF6B5A",
    bg: "rgba(255,107,90,0.07)",
  },
  {
    icon: <BarChart2 size={22} />,
    emoji: "📊",
    name: "Analysis",
    desc: "Deep dive into your PDF content. Extract data, generate insights, and visualize information beautifully.",
    features: ["Data Extraction", "Advanced Insights", "Report Generation"],
    tab: "analysis",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.07)",
  },
  {
    icon: <GraduationCap size={22} />,
    emoji: "🎓",
    name: "Study Mode",
    desc: "Turn your PDFs into interactive learning materials. Generate flashcards and quizzes to master any subject.",
    features: ["AI Flashcards", "Smart Quizzes", "Knowledge Testing"],
    tab: "study",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.07)",
  },
  {
    icon: <PenTool size={22} />,
    emoji: "✏️",
    name: "Create & Edit",
    desc: "Design and edit PDFs with Canva-like simplicity. Professional templates and easy tools.",
    features: ["Simple Editor", "Add Text & Images", "Custom PDFs"],
    tab: "create",
    color: "#10B981",
    bg: "rgba(16,185,129,0.07)",
  },
  {
    icon: <ScanSearch size={22} />,
    emoji: "🔍",
    name: "OCR & Recognition",
    desc: "Convert scanned documents to editable text and extract data from complex layouts.",
    features: ["Text Recognition", "Layout Detection", "Batch Processing"],
    tab: "ocr",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.07)",
  },
  {
    icon: <Wrench size={22} />,
    emoji: "🛠️",
    name: "PDF Tools",
    desc: "Manage and transform your PDF documents with ease. Merge, split, convert, and extract text from PDFs.",
    features: ["Merge PDFs", "Split PDFs", "Convert to PDF"],
    tab: "pdftools",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.07)",
  },
];

const featureItems = [
  { icon: <Shield size={20} />, title: "Military-Grade Security", desc: "Your documents are encrypted and protected with industry-leading security standards." },
  { icon: <Zap size={20} />, title: "Lightning Fast", desc: "Process and analyze documents in milliseconds with our optimized infrastructure." },
  { icon: <Bot size={20} />, title: "AI Powered", desc: "Advanced machine learning algorithms understand context and provide intelligent solutions." },
  { icon: <Smartphone size={20} />, title: "Fully Responsive", desc: "Access RovexAI from any device. Work seamlessly on desktop, tablet, or mobile." },
  { icon: <Link2 size={20} />, title: "API Integration", desc: "Integrate RovexAI into your workflows with our REST API and webhooks." },
  { icon: <Target size={20} />, title: "Precision Accuracy", desc: "Industry-leading accuracy for text recognition, data extraction, and analysis." },
];

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openUserProfile } = useClerk();
  const footerRef = useRef(null);

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  const firstName = user?.firstName || displayName.split(" ")[0];

  return (
    <div className="kuro-dashboard-page">

      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-brand">
          <KuroLogo size={40} />
          <div className="logo-container" onClick={() => navigate("/")}>
            <span className="logo-text">
              <span className="logo-red">Rovex</span>
              <span className="logo-ai">AI</span>
            </span>
          </div>
        </div>

        <nav className="header-links">
          <a href="/homepage" className="nav-link">
            <Home size={14} /> Home
          </a>
          <a href="/app?tab=upload" className="nav-link">
            <LayoutDashboard size={14} /> Workspace
          </a>
          <a href="https://rovexai.com/contact" className="nav-link">
            <HelpCircle size={14} /> Help
          </a>
          <button onClick={openUserProfile} className="nav-link settings-link">
            <Settings size={14} /> Settings
          </button>
        </nav>

        <UserButton showName afterSignOutUrl="/login" />
      </header>

      {/* ===== MAIN ===== */}
      <main className="main-container">

        {/* ── HERO BANNER ── */}
        <section className="hero-banner">
          <div className="hero-banner-bg">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-grid" />
          </div>

          <div className="hero-banner-content">
            <div className="hero-greeting">
              <span className="hero-greeting-dot" />
              Good to see you, {firstName}
            </div>
            <h1 className="hero-title">
              Welcome to <span className="hero-title-accent">RovexAI</span>
            </h1>
            <p className="hero-subtitle">
              Transform your PDF workflows with intelligent document processing and creation
            </p>
            <button className="hero-cta" onClick={() => navigate("/app?tab=upload")}>
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          <div className="floating-cards">
            <div className="floating-card card1">
              <Zap size={14} /> AI-Powered Analysis
            </div>
            <div className="floating-card card2">
              <PenTool size={14} /> Seamless Editing
            </div>
            <div className="floating-card card3">
              <ScanSearch size={14} /> Smart OCR
            </div>
          </div>
        </section>

        {/* ── WORKSPACE SECTION ── */}
        <section className="workspace-section">
          <div className="dash-section-header">
            <div className="dash-eyebrow">Workspaces</div>
            <h2 className="dash-section-title">
              Choose Your <span className="dash-accent">Workspace</span>
            </h2>
            <p className="dash-section-sub">
              Select a workspace to get started with your PDF tasks
            </p>
          </div>

          <div className="workspace-grid">
            {workspaces.map((ws, i) => (
              <div className="workspace-card" key={i} style={{ "--ws-color": ws.color, "--ws-bg": ws.bg }}>
                <div className="workspace-card-top">
                  <div className="workspace-icon" style={{ background: ws.bg, color: ws.color }}>
                    {ws.icon}
                  </div>
                  <span className="workspace-badge">{ws.emoji}</span>
                </div>
                <h3 className="workspace-name">{ws.name}</h3>
                <p className="workspace-description">{ws.desc}</p>
                <ul className="workspace-features">
                  {ws.features.map((f, fi) => (
                    <li key={fi}>
                      <span className="feature-dot" style={{ background: ws.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="workspace-btn"
                  onClick={() => navigate(`/app?tab=${ws.tab}`)}
                >
                  Go to Workspace <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY ROVEXAI ── */}
        <section className="features-section">
          <div className="dash-section-header">
            <div className="dash-eyebrow">Why Us</div>
            <h2 className="dash-section-title">
              Why Choose <span className="dash-accent">RovexAI</span>?
            </h2>
          </div>

          <div className="features-grid">
            {featureItems.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ===== FOOTER ===== */}
      <footer ref={footerRef} className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo-container" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI Logo" className="logo-icon" />
              <span className="logo-text">
                <span className="logo-red">Rovex</span>
                <span className="footer-ai">AI</span>
              </span>
            </div>
            <p className="footer-tagline">
              Transforming how you work with documents through AI
            </p>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <button onClick={() => navigate("/about")} className="footer-link">About</button>
            <button onClick={() => navigate("/contact")} className="footer-link">Contact</button>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <button onClick={() => navigate("/privacy-policy")} className="footer-link">Privacy Policy</button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}