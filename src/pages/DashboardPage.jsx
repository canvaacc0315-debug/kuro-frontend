// src/pages/DashboardPage.jsx
import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../styles/kuro-dashboard.css";
import "../styles/homepage.css";
import { useClerk } from "@clerk/clerk-react";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import { useRef } from "react";
import GlassCard from "../components/animated/GlassCard.jsx";
import KuroHeader from "../components/layout/KuroHeader.jsx";
import KuroFooter from "../components/layout/KuroFooter.jsx";
import AnimatedSection from "../components/animated/AnimatedSection.jsx";
import TextRotator from "../components/animated/TextRotator.jsx";
import { Star, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import logoIcon from "../assets/logo.svg"; // Add your logo image
import {
  MessageSquare,
  BarChart2,
  GraduationCap,
  PenTool,
  ScanSearch,
  Wrench,
  ShieldCheck,
  Zap,
  Bot,
  Smartphone,
  Link,
  Target,
  FileText,
  Activity,
  HardDrive,
  Crown,
  Clock,
  MoreVertical,
  Upload,
  Search,
  Hexagon
} from "lucide-react";

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

  return (
    <div className="kuro-dashboard-page">
      {/* ===== header ===== */}
      <KuroHeader />

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-container">
        {/* HERO */}
        <section className="hp-hero" style={{ minHeight: "80vh", padding: "80px 20px", marginTop: "0", position: "relative", overflow: "hidden" }}>

          {/* Floating Background Icons */}
          <div className="hero-floating-elements" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
            <motion.div
              style={{ position: "absolute", top: "20%", left: "15%", color: "rgba(255, 50, 50, 0.15)" }}
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Hexagon size={64} />
            </motion.div>

            <motion.div
              style={{ position: "absolute", top: "60%", left: "10%", color: "rgba(255, 255, 255, 0.05)" }}
              animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Database size={48} />
            </motion.div>

            <motion.div
              style={{ position: "absolute", top: "30%", right: "15%", color: "rgba(255, 255, 255, 0.05)" }}
              animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Cpu size={56} />
            </motion.div>

            <motion.div
              style={{ position: "absolute", bottom: "25%", right: "20%", color: "rgba(255, 50, 50, 0.1)" }}
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <Sparkles size={40} />
            </motion.div>
          </div>

          <div className="hp-hero-glow hp-hero-glow-1" style={{ zIndex: 1 }} />
          <div className="hp-hero-glow hp-hero-glow-2" style={{ zIndex: 1 }} />

          <div className="hp-hero-inner" style={{ paddingTop: "60px", paddingBottom: "20px" }}>
            <AnimatedSection delay={0.08}>
              <h1 className="hp-hero-title" style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)" }}>
                Welcome to <span className="hp-hero-highlight">RovexAI</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.16}>
              <div className="hp-hero-sub" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.4rem', color: "var(--text-primary)" }}>
                The intelligent PDF platform for{" "}
                <TextRotator words={["Students", "Professionals", "Researchers", "Teams", "Everyone"]} />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="hp-hero-cta" style={{ justifyContent: 'center' }}>
                <button className="hp-btn-primary hp-btn-lg" onClick={() => navigate("/app?tab=upload")} style={{ gap: "8px" }}>
                  Get Started <ArrowRight size={17} />
                </button>
              </div>
            </AnimatedSection>
          </div>

        </section>

        {/* QUICK ACTIONS SECTION (NEW COMPONENT) */}
        <AnimatedSection className="section-header" style={{ marginBottom: "1rem" }}>
          <h2 className="section-title" style={{ fontSize: "1.8rem" }}>
            Quick <span className="section-title-accent">Actions</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2} style={{ padding: "0 20px", marginBottom: "3rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { icon: <Upload size={22} />, title: "Upload New PDF", desc: "Start a new analysis", tab: "upload", color: "var(--accent)" },
              { icon: <MessageSquare size={22} />, title: "Chat with PDF", desc: "Ask questions instantly", tab: "chat", color: "#3b82f6" },
              { icon: <ScanSearch size={22} />, title: "Extract Text", desc: "Run OCR on image/pdf", tab: "ocr", color: "#10b981" },
              { icon: <PenTool size={22} />, title: "Create Template", desc: "Design a new document", tab: "create", color: "#f59e0b" }
            ].map((action, i) => (
              <motion.div
                key={i}
                onClick={() => navigate(`/app?tab=${action.tab}`)}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  padding: "1.2rem",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
                }}
              >
                <div style={{ background: `${action.color}15`, color: action.color, padding: "12px", borderRadius: "10px", display: "flex" }}>
                  {action.icon}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{action.title}</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{action.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* WORKSPACE SECTION */}
        <AnimatedSection className="section-header">

          <h2 className="section-title">
            Choose Your <span className="section-title-accent">Workspace</span>
          </h2>
          <p className="section-subtitle">
            Select a workspace to get started with your PDF tasks
          </p>

        </AnimatedSection>

        <AnimatedSection delay={0.2} className="workspace-grid">

          {/* PDF Chat */}
          <GlassCard
            icon={<MessageSquare size={32} />}
            title="PDF Chat"
            description="Interact with your PDFs using natural language. Ask questions,
 extract information, and get instant answers."
            className="workspace-card"
            delay={0.1}
          >
            <ul className="workspace-features">
              <li>Smart Q&amp;A Engine</li>
              <li>Context Understanding</li>
              <li>Real-time Responses</li>
            </ul>
            <button
              className="workspace-btn"
              onClick={() => navigate("/app?tab=chat")}
            >
              Go to Workspace
            </button>
          </GlassCard>

          {/* Analysis */}
          <GlassCard
            icon={<BarChart2 size={32} />}
            title="Analysis"
            description="Deep dive into your PDF content. Extract data, generate insights,
 and visualize information beautifully."
            className="workspace-card"
            delay={0.1}
          >
            <ul className="workspace-features">
              <li>Data Extraction</li>
              <li>Advanced Insights</li>
              <li>Report Generation</li>
            </ul>
            <button
              className="workspace-btn"
              onClick={() => navigate("/app?tab=analysis")}
            >
              Go to Workspace
            </button>
          </GlassCard>

          {/* Study Mode */}
          <GlassCard
            icon={<GraduationCap size={32} />}
            title="Study Mode"
            description="Turn your PDFs into interactive learning materials. Generate flashcards and quizzes to master any subject."
            className="workspace-card"
            delay={0.1}
          >
            <ul className="workspace-features">
              <li>AI Flashcards</li>
              <li>Smart Quizzes</li>
              <li>Knowledge Testing</li>
            </ul>
            <button
              className="workspace-btn"
              onClick={() => navigate("/app?tab=study")}
            >
              Go to Workspace
            </button>
          </GlassCard>

          {/* Create & Edit */}
          <GlassCard
            icon={<PenTool size={32} />}
            title="Create &amp; Edit"
            description="Design and edit PDFs with Canva-like simplicity. Professional
 templates and easy tools."
            className="workspace-card"
            delay={0.1}
          >
            <ul className="workspace-features">
              <li>Simple Editor</li>
              <li>Add Text & Images</li>
              <li>Custom PDFs</li>
            </ul>
            <button
              className="workspace-btn"
              onClick={() => navigate("/app?tab=create")}
            >
              Go to Workspace
            </button>
          </GlassCard>

          {/* OCR */}
          <GlassCard
            icon={<ScanSearch size={32} />}
            title="OCR &amp; Recognition"
            description="Convert scanned documents to editable text and extract data from complex layouts."
            className="workspace-card"
            delay={0.1}
          >
            <ul className="workspace-features">
              <li>Text Recognition</li>
              <li>Layout Detection</li>
              <li>Batch Processing</li>
            </ul>
            <button
              className="workspace-btn"
              onClick={() => navigate("/app?tab=ocr")}
            >
              Go to Workspace
            </button>
          </GlassCard>

          {/* Settings (optional placeholder) */}
          <GlassCard
            icon={<Wrench size={32} />}
            title="PDF Tools"
            description="Manage and transform your PDF documents with ease. Merge, split, convert, and extract text from PDFs using our powerful tools."
            className="workspace-card"
            delay={0.1}
          >

            <ul className="workspace-features">
              <li>Merge PDFs</li>
              <li>Split PDFs</li>
              <li>Convert to PDF</li>
            </ul>
            <button
              className="workspace-btn"
              onClick={() => navigate("/app?tab=pdftools")}
            >
              Go to Workspace
            </button>
          </GlassCard>

        </AnimatedSection>

        {/* ===== FEATURES SECTION ===== */}
        <AnimatedSection delay={0.4} className="features-section">

          <div className="section-header">
            <h2 className="section-title">
              Why Choose <span className="section-title-accent">RovexAI</span>?
            </h2>
          </div>

          <div className="hp-bento">
            <AnimatedSection delay={0.3} style={{ height: "100%" }}>
              <motion.div className="hp-bento-card hp-bento-accent" whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                <div className="hp-bento-icon"><ShieldCheck size={24} /></div>
                <h3>Military-Grade Security</h3>
                <p>Your documents are encrypted and protected with industry‑leading security standards.</p>
                <div className="hp-bento-shine" />
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.4} style={{ height: "100%" }}>
              <motion.div className="hp-bento-card" whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                <div className="hp-bento-icon"><Zap size={24} /></div>
                <h3>Lightning Fast</h3>
                <p>Process and analyze documents in milliseconds with our optimized infrastructure.</p>
                <div className="hp-bento-shine" />
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.5} style={{ height: "100%" }}>
              <motion.div className="hp-bento-card hp-bento-accent" whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                <div className="hp-bento-icon"><Bot size={24} /></div>
                <h3>AI Powered</h3>
                <p>Advanced machine learning algorithms understand context and provide intelligent solutions.</p>
                <div className="hp-bento-shine" />
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.6} style={{ height: "100%" }}>
              <motion.div className="hp-bento-card" whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                <div className="hp-bento-icon"><Smartphone size={24} /></div>
                <h3>Fully Responsive</h3>
                <p>Access RovexAI from any device. Work seamlessly on desktop, tablet, or mobile.</p>
                <div className="hp-bento-shine" />
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.7} style={{ height: "100%" }}>
              <motion.div className="hp-bento-card" whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                <div className="hp-bento-icon"><Link size={24} /></div>
                <h3>API Integration</h3>
                <p>Integrate RovexAI into your workflows with our REST API and webhooks.</p>
                <div className="hp-bento-shine" />
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.8} style={{ height: "100%" }}>
              <motion.div className="hp-bento-card" whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                <div className="hp-bento-icon"><Target size={24} /></div>
                <h3>Precision Accuracy</h3>
                <p>Industry‑leading accuracy for text recognition, data extraction, and analysis.</p>
                <div className="hp-bento-shine" />
              </motion.div>
            </AnimatedSection>
          </div>

        </AnimatedSection>
      </main>
      {/* FOOTER */}
      <footer ref={footerRef} className="footer">
        <div className="footer-content">
          {/* LEFT: Brand */}
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
          {/* COMPANY */}
          <div className="footer-section">
            <h4>Company</h4>
            <button onClick={() => navigate("/about")} className="footer-link">
              About
            </button>
            <button onClick={() => navigate("/contact")} className="footer-link">
              Contact
            </button>
          </div>
          {/* LEGAL */}
          <div className="footer-section">
            <h4>Legal</h4>
            <button
              onClick={() => navigate("/privacy-policy")}
              className="footer-link"
            >
              Privacy Policy
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}