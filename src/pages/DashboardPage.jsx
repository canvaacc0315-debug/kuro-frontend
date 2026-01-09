// src/pages/DashboardPage.jsx
import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../styles/kuro-dashboard.css";
import { useClerk } from "@clerk/clerk-react";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import { useRef } from "react";
import logoIcon from "../assets/logo.svg"; // Add your logo image

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
      <header className="header">
        <div className="header-brand">
          <KuroLogo size={46} />
          <div className="logo-container" onClick={() => navigate("/")}>
          <span className="logo-text">
            <span className="logo-red">Rovex</span>
            <span className="logo-ai">AI</span>
          </span>
          </div>
        </div>
        <nav className="header-links">
          <a href="/homepage" className="nav-link">Home</a>
          <a href="/app?tab=upload" className="nav-link">Workspace</a>
          <a href="https://rovexai.com/contact" className="nav-link">Help</a>
          <button onClick={openUserProfile} className="nav-link settings-link">
            Settings
          </button>
        </nav>
        {/* RIGHT: user info */}
        <UserButton showName afterSignOutUrl="/login" />
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-container">
        {/* HERO */}
        <section className="hero-banner">
          <h1 className="hero-title">
            Welcome to <span className="hero-title-accent">RovexAI</span>
          </h1>
          <p className="hero-subtitle">
            Transform your PDF workflows with intelligent document processing
            and creation
          </p>
          <button className="hero-cta" onClick={() => navigate("/app?tab=upload")}>
            Get Started
          </button>
          <div className="floating-cards">
            <div className="floating-card card1">AI-Powered Analysis</div>
            <div className="floating-card card2">Seamless Editing</div>
            <div className="floating-card card3">Smart OCR</div>
          </div>
        </section>

        {/* WORKSPACE SECTION */}
        <section className="section-header">
          <h2 className="section-title">
            Choose Your <span className="section-title-accent">Workspace</span>
          </h2>
          <p className="section-subtitle">
            Select a workspace to get started with your PDF tasks
          </p>
        </section>

        <section className="workspace-grid">
          {/* PDF Chat */}
          <div className="workspace-card">
            <div className="workspace-icon">💬</div>
            <h3 className="workspace-name">PDF Chat</h3>
            <p className="workspace-description">
              Interact with your PDFs using natural language. Ask questions,
              extract information, and get instant answers.
            </p>
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
          </div>

          {/* Analysis */}
          <div className="workspace-card">
            <div className="workspace-icon">📊</div>
            <h3 className="workspace-name">Analysis</h3>
            <p className="workspace-description">
              Deep dive into your PDF content. Extract data, generate insights,
              and visualize information beautifully.
            </p>
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
          </div>

          {/* Upload & Organize */}
          <div className="workspace-card">
            <div className="workspace-icon">⬆️</div>
            <h3 className="workspace-name">Upload &amp; Organize</h3>
            <p className="workspace-description">
              Manage all your PDF documents in one place. Upload, organize, and
              maintain your document library efficiently.
            </p>
            <ul className="workspace-features">
              <li>Bulk Upload</li>
              <li>Smart Organization</li>
              <li>Version Control</li>
            </ul>
            <button
              className="workspace-btn"
              onClick={() => navigate("/app?tab=upload")}
            >
              Go to Workspace
            </button>
          </div>

          {/* Create & Edit */}
          <div className="workspace-card">
            <div className="workspace-icon">✏️</div>
            <h3 className="workspace-name">Create &amp; Edit</h3>
            <p className="workspace-description">
              Design and edit PDFs with Canva-like simplicity. Professional
              templates and easy tools.
            </p>
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
          </div>

          {/* OCR */}
          <div className="workspace-card">
            <div className="workspace-icon">🔍</div>
            <h3 className="workspace-name">OCR &amp; Recognition</h3>
            <p className="workspace-description">
              Convert scanned documents to editable text and extract data from complex layouts.
            </p>
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
          </div>

          {/* Settings (optional placeholder) */}
          <div className="workspace-card">
            <div className="workspace-icon">⚙️</div>
            <h3 className="workspace-name">Settings</h3>
            <p className="workspace-description">
              Manage your account, preferences, and integrations for a
              personalized experience.
            </p>
            <ul className="workspace-features">
              <li>Account Management</li>
              <li>Security Settings</li>
              <li>Update Profile</li>
            </ul>
            {/* Button removed as per requirements */}
          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">
              Why Choose <span className="section-title-accent">RovexAI</span>?
            </h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">🛡️ Military-Grade Security</h3>
              <p className="feature-desc">
                Your documents are encrypted and protected with industry‑leading
                security standards.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">⚡ Lightning Fast</h3>
              <p className="feature-desc">
                Process and analyze documents in milliseconds with our optimized
                infrastructure.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">🤖 AI Powered</h3>
              <p className="feature-desc">
                Advanced machine learning algorithms understand context and
                provide intelligent solutions.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">📱 Fully Responsive</h3>
              <p className="feature-desc">
                Access RovexAI from any device. Work seamlessly on desktop,
                tablet, or mobile.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">🔗 API Integration</h3>
              <p className="feature-desc">
                Integrate RovexAI into your workflows with our REST API and
                webhooks.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">🎯 Precision Accuracy</h3>
              <p className="feature-desc">
                Industry‑leading accuracy for text recognition, data extraction,
                and analysis.
              </p>
            </div>
          </div>
        </section>
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