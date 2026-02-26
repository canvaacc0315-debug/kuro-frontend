import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  BarChart,
  UploadCloud,
  LayoutTemplate,
  Scan,
  Wrench,
  ArrowRight
} from "lucide-react";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";
import "../styles/theme-red.css";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openUserProfile } = useClerk();

  const displayName = user?.firstName || user?.username || "Explorer";

  return (
    <div className="premium-dash-root">

      {/* Sleek Minimal Header */}
      <header className="premium-dash-header">
        <div className="dash-brand" onClick={() => navigate("/")}>
          <KuroLogo size={24} />
          <span className="dash-logo-text">RovexAI</span>
        </div>

        <nav className="dash-nav desktop-only">
          <button onClick={() => navigate("/")} className="dash-nav-link">Home</button>
          <button onClick={() => navigate("/app?tab=upload")} className="dash-nav-link active">Workspace</button>
          <button onClick={() => navigate("/contact")} className="dash-nav-link">Help</button>
          <button onClick={openUserProfile} className="dash-nav-link">Settings</button>
        </nav>

        <div className="dash-user">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="premium-dash-main">
        {/* Quick Start / Welcome Hero */}
        <section className="dash-welcome-section">
          <motion.div
            className="dash-welcome-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="dash-title">
              Welcome back, <span style={{ color: "var(--text-primary)" }}>{displayName}</span>.
            </h1>
            <p className="dash-subtitle">
              Select a workspace below to start processing your intelligence.
            </p>
          </motion.div>

          <motion.div
            className="quick-start-stepper"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="stepper-track">
              <div className="step active">
                <div className="step-circle">1</div>
                <span>Upload</span>
              </div>
              <div className="step-line" />
              <div className="step">
                <div className="step-circle">2</div>
                <span>Select Tool</span>
              </div>
              <div className="step-line" />
              <div className="step">
                <div className="step-circle">3</div>
                <span>Extract</span>
              </div>
            </div>

            <button className="btn-primary-sleek" onClick={() => navigate("/app?tab=upload")}>
              Open Workspace &rarr;
            </button>
          </motion.div>
        </section>

        {/* Workspaces Bento Grid */}
        <section className="dash-workspaces-section">
          <div className="premium-bento-layout">
            <AnimatedCard
              icon={<MessageSquare size={24} />}
              title="PDF Chat"
              description="Interact with documents using natural language. Ask questions and get cited answers instantly."
              onClick={() => navigate("/app?tab=chat")}
              delay={0.1}
            />
            <AnimatedCard
              icon={<BarChart size={24} />}
              title="Data Analysis"
              description="Extract tables, financial data, and visualize nested arrays from complex PDFs."
              onClick={() => navigate("/app?tab=analysis")}
              delay={0.15}
            />
            <AnimatedCard
              icon={<UploadCloud size={24} />}
              title="Upload Vault"
              description="Manage all your securely vaulted documents right here in the central Library."
              onClick={() => navigate("/app?tab=upload")}
              delay={0.2}
            />
            <AnimatedCard
              icon={<LayoutTemplate size={24} />}
              title="Create & Edit"
              description="Design and edit PDFs with professional, layer-based layout simplicity."
              onClick={() => navigate("/app?tab=create")}
              delay={0.25}
            />
            <AnimatedCard
              icon={<Scan size={24} />}
              title="OCR Vision"
              description="Convert scanned images to editable and perfectly structured Markdown using Vision."
              onClick={() => navigate("/app?tab=ocr")}
              delay={0.3}
            />
            <AnimatedCard
              icon={<Wrench size={24} />}
              title="PDF Utilities"
              description="Merge, split, watermark, compress and secure your PDFs entirely on the cloud."
              onClick={() => navigate("/app?tab=pdftools")}
              delay={0.35}
            />
          </div>
        </section>
      </main>

      {/* Sleek Dashboard Footer */}
      <footer className="premium-dash-footer">
        <div className="footer-links">
          <button onClick={() => navigate("/about")}>About</button>
          <button onClick={() => navigate("/contact")}>Support</button>
          <button onClick={() => navigate("/privacy-policy")}>Privacy</button>
        </div>
      </footer>
    </div>
  );
}