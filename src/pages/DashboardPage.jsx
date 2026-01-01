// src/pages/DashboardPage.jsx
import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../styles/kuro-dashboard.css";
import { useClerk } from "@clerk/clerk-react";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import Footer from "../components/layout/Footer";

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openUserProfile } = useClerk();

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  return (
    <div className="kuro-dashboard-page">
      {/* ===== NAVBAR / HEADER ===== */}
      <header className="navbar">
        {/* LEFT: logo + brand text (same pattern as workspace page) */}
        <div className="navbar-brand">
          <KuroLogo size={36} />
          <div className="navbar-brand-text">RovexAI</div>
        </div>

        {/* RIGHT: user info (unchanged) */}
        <div className="navbar-right">
          <div className="user-info">
            <div className="user-avatar">
              {displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="user-name">{displayName}</div>
          </div>
          <UserButton afterSignOutUrl="/login" />
        </div>
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
              Enter Workspace
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
              Enter Workspace
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
              Enter Workspace
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
              Enter Workspace
            </button>
          </div>

          {/* OCR */}
          <div className="workspace-card">
            <div className="workspace-icon">🔍</div>
            <h3 className="workspace-name">OCR &amp; Recognition</h3>
            <p className="workspace-description">
              Convert scanned documents to editable text. 
              Extract data from complex layouts.
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
              Enter Workspace
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
            <button
              type="button"
              className="workspace-btn"
              onClick={() => openUserProfile()}
            >
              OPEN SETTINGS
            </button>
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
      <Footer />
    </div>
  );
}