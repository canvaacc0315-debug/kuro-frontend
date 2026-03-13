// src/pages/DashboardPage.jsx
import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../styles/kuro-dashboard.css";
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
  Target
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
        <section className="hp-hero" style={{ minHeight: "80vh", padding: "80px 20px", marginTop: "0", position: "relative" }}>
          <div className="hp-hero-glow hp-hero-glow-1" />
          <div className="hp-hero-glow hp-hero-glow-2" />

          <div className="hp-hero-inner" style={{ paddingTop: "60px", paddingBottom: "20px" }}>
            <AnimatedSection delay={0.08}>
              <h1 className="hp-hero-title" style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)" }}>
                Welcome to <span className="hp-hero-highlight">RovexAI</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.16}>
              <p className="hp-hero-sub" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                Transform your PDF workflows with intelligent document processing and creation
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="hp-hero-cta" style={{ justifyContent: 'center' }}>
                <button className="hp-btn-primary hp-btn-lg" onClick={() => navigate("/app?tab=upload")} style={{ gap: "8px" }}>
                  Get Started <ArrowRight size={17} />
                </button>
              </div>
            </AnimatedSection>
          </div>

          <div className="hp-hero-scroll-hint">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <ChevronDown size={20} />
            </motion.div>
          </div>
        </section>

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

          <div className="features-grid">
            <GlassCard
              title={<> <ShieldCheck size={20} className="inline-icon" /> Military-Grade Security </>}
              description="Your documents are encrypted and protected with industry‑leading
 security standards."
              className="feature-card"
              delay={0.3}
            />

            <GlassCard
              title={<> <Zap size={20} className="inline-icon" /> Lightning Fast </>}
              description="Process and analyze documents in milliseconds with our optimized
 infrastructure."
              className="feature-card"
              delay={0.4}
            />

            <GlassCard
              title={<> <Bot size={20} className="inline-icon" /> AI Powered </>}
              description="Advanced machine learning algorithms understand context and
 provide intelligent solutions."
              className="feature-card"
              delay={0.5}
            />

            <GlassCard
              title={<> <Smartphone size={20} className="inline-icon" /> Fully Responsive </>}
              description="Access RovexAI from any device. Work seamlessly on desktop,
 tablet, or mobile."
              className="feature-card"
              delay={0.6}
            />

            <GlassCard
              title={<> <Link size={20} className="inline-icon" /> API Integration </>}
              description="Integrate RovexAI into your workflows with our REST API and
 webhooks."
              className="feature-card"
              delay={0.7}
            />

            <GlassCard
              title={<> <Target size={20} className="inline-icon" /> Precision Accuracy </>}
              description="Industry‑leading accuracy for text recognition, data extraction,
 and analysis."
              className="feature-card"
              delay={0.8}
            />
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