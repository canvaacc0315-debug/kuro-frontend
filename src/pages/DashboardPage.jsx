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
  Link2, Target, ArrowRight
} from "lucide-react";

const workspaces = [
  {
    icon: <MessageSquare size={20} />,
    name: "PDF Chat",
    desc: "Interact with your PDFs using natural language. Ask questions, extract information, and get instant answers.",
    features: ["Smart Q&A Engine", "Context Understanding", "Real-time Responses"],
    tab: "chat",
    color: "#FF6B5A",
    bg: "rgba(255,107,90,0.09)",
  },
  {
    icon: <BarChart2 size={20} />,
    name: "Analysis",
    desc: "Deep dive into your PDF content. Extract data, generate insights, and visualize information beautifully.",
    features: ["Data Extraction", "Advanced Insights", "Report Generation"],
    tab: "analysis",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.09)",
  },
  {
    icon: <GraduationCap size={20} />,
    name: "Study Mode",
    desc: "Turn your PDFs into interactive learning materials. Generate flashcards and quizzes to master any subject.",
    features: ["AI Flashcards", "Smart Quizzes", "Knowledge Testing"],
    tab: "study",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.09)",
  },
  {
    icon: <PenTool size={20} />,
    name: "Create & Edit",
    desc: "Design and edit PDFs with Canva-like simplicity. Professional templates and easy tools.",
    features: ["Simple Editor", "Add Text & Images", "Custom PDFs"],
    tab: "create",
    color: "#10B981",
    bg: "rgba(16,185,129,0.09)",
  },
  {
    icon: <ScanSearch size={20} />,
    name: "OCR & Recognition",
    desc: "Convert scanned documents to editable text and extract data from complex layouts.",
    features: ["Text Recognition", "Layout Detection", "Batch Processing"],
    tab: "ocr",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.09)",
  },
  {
    icon: <Wrench size={20} />,
    name: "PDF Tools",
    desc: "Manage and transform your PDF documents with ease. Merge, split, convert, and extract text from PDFs.",
    features: ["Merge PDFs", "Split PDFs", "Convert to PDF"],
    tab: "pdftools",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.09)",
  },
];

const featureItems = [
  { icon: <Shield size={18} />, title: "Military-Grade Security", desc: "Your documents are encrypted and protected with industry-leading security standards." },
  { icon: <Zap size={18} />, title: "Lightning Fast", desc: "Process and analyze documents in milliseconds with our optimized infrastructure." },
  { icon: <Bot size={18} />, title: "AI Powered", desc: "Advanced machine learning algorithms understand context and provide intelligent solutions." },
  { icon: <Smartphone size={18} />, title: "Fully Responsive", desc: "Access RovexAI from any device. Work seamlessly on desktop, tablet, or mobile." },
  { icon: <Link2 size={18} />, title: "API Integration", desc: "Integrate RovexAI into your workflows with our REST API and webhooks." },
  { icon: <Target size={18} />, title: "Precision Accuracy", desc: "Industry-leading accuracy for text recognition, data extraction, and analysis." },
];

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openUserProfile } = useClerk();
  const footerRef = useRef(null);

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="dash-root">

      {/* ── HEADER ── */}
      <header className="dash-header">
        <div className="dash-brand" onClick={() => navigate("/")}>
          <KuroLogo size={36} />
          <span className="dash-logo-text">
            <span className="logo-red">Rovex</span>
            <span className="logo-dark">AI</span>
          </span>
        </div>

        <nav className="dash-nav">
          <a href="/homepage" className="dash-nav-link">Home</a>
          <a href="/app?tab=upload" className="dash-nav-link">Workspace</a>
          <a href="https://rovexai.com/contact" className="dash-nav-link">Help</a>
          <button onClick={openUserProfile} className="dash-nav-link">Settings</button>
        </nav>

        <UserButton showName afterSignOutUrl="/login" />
      </header>

      {/* ── MAIN ── */}
      <main className="dash-main">

        {/* ── HERO ── */}
        <section className="dash-hero">
          {/* bg effects */}
          <div className="dash-hero-blob dash-hero-blob-1" />
          <div className="dash-hero-blob dash-hero-blob-2" />
          <div className="dash-hero-dots" />

          {/* left: text */}
          <div className="dash-hero-left">
            <div className="dash-hero-pill">
              <span className="dash-hero-online" />
              Good to see you, {firstName}
            </div>
            <h1 className="dash-hero-title">
              Welcome to{" "}
              <span className="dash-hero-grad">RovexAI</span>
            </h1>
            <p className="dash-hero-sub">
              Transform your PDF workflows with intelligent document processing and creation
            </p>
            <button className="dash-hero-btn" onClick={() => navigate("/app?tab=upload")}>
              Get Started <ArrowRight size={15} />
            </button>
          </div>

          {/* right: floating tags */}
          <div className="dash-hero-right">
            <div className="dash-ftag dash-ftag-1"><Zap size={13} /> AI-Powered Analysis</div>
            <div className="dash-ftag dash-ftag-2"><PenTool size={13} /> Seamless Editing</div>
            <div className="dash-ftag dash-ftag-3"><ScanSearch size={13} /> Smart OCR</div>
          </div>
        </section>

        {/* ── WORKSPACES ── */}
        <section className="dash-section">
          <div className="dash-sec-hdr">
            <span className="dash-eyebrow">Workspaces</span>
            <h2>Choose Your <span className="dash-grad">Workspace</span></h2>
            <p>Select a workspace to get started with your PDF tasks</p>
          </div>

          <div className="dash-ws-grid">
            {workspaces.map((ws, i) => (
              <div className="dash-ws-card" key={i}>
                {/* accent line top */}
                <div className="dash-ws-line" style={{ background: ws.color }} />
                {/* icon */}
                <div className="dash-ws-icon" style={{ background: ws.bg, color: ws.color }}>
                  {ws.icon}
                </div>
                <h3 className="dash-ws-name">{ws.name}</h3>
                <p className="dash-ws-desc">{ws.desc}</p>
                <ul className="dash-ws-feats">
                  {ws.features.map((f, fi) => (
                    <li key={fi}>
                      <span className="dash-ws-dot" style={{ background: ws.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="dash-ws-btn"
                  style={{ "--c": ws.color }}
                  onClick={() => navigate(`/app?tab=${ws.tab}`)}
                >
                  Go to Workspace <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY ROVEXAI ── */}
        <section className="dash-section">
          <div className="dash-sec-hdr">
            <span className="dash-eyebrow">Why Us</span>
            <h2>Why Choose <span className="dash-grad">RovexAI</span>?</h2>
          </div>

          <div className="dash-feat-grid">
            {featureItems.map((f, i) => (
              <div className="dash-feat-card" key={i}>
                <div className="dash-feat-icon">{f.icon}</div>
                <div>
                  <h3 className="dash-feat-title">{f.title}</h3>
                  <p className="dash-feat-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer ref={footerRef} className="dash-footer">
        <div className="dash-footer-inner">
          <div className="dash-footer-brand">
            <div className="dash-brand" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI" className="dash-footer-logo" />
              <span className="dash-logo-text">
                <span className="logo-red">Rovex</span>
                <span style={{ color: "#fff" }}>AI</span>
              </span>
            </div>
            <p className="dash-footer-tag">Transforming how you work with documents through AI</p>
          </div>

          <div className="dash-footer-col">
            <h4>Company</h4>
            <button onClick={() => navigate("/about")} className="dash-footer-link">About</button>
            <button onClick={() => navigate("/contact")} className="dash-footer-link">Contact</button>
          </div>

          <div className="dash-footer-col">
            <h4>Legal</h4>
            <button onClick={() => navigate("/privacy-policy")} className="dash-footer-link">Privacy Policy</button>
          </div>
        </div>

        <div className="dash-footer-bottom">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}