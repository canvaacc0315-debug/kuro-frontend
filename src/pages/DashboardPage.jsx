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
    <div className="dashboard-root">

      {/* Sleek Dark Header */}
      <header className="dash-header">
        <div className="dash-brand" onClick={() => navigate("/")}>
          <KuroLogo size={32} />
          <span className="dash-logo-text">
            <span>Rovex</span><span className="text-white">AI</span>
          </span>
        </div>

        <nav className="dash-nav">
          <button onClick={() => navigate("/")} className="dash-nav-link">Home</button>
          <button onClick={() => navigate("/app?tab=upload")} className="dash-nav-link active">Workspace</button>
          <a href="https://rovexai.com/contact" className="dash-nav-link">Help</a>
          <button onClick={openUserProfile} className="dash-nav-link">Settings</button>
        </nav>

        <div className="dash-user">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="dash-main">
        {/* Quick Start / Welcome Hero */}
        <motion.section
          className="dash-welcome-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="dash-welcome-content">
            <h1 className="dash-title">
              Welcome back, <span className="text-gradient-red">{displayName}</span>
            </h1>
            <p className="dash-subtitle">
              Ready to transform your workflow? Follow our Quick Start guide below.
            </p>

            {/* Quick Start Instructions Box */}
            <div className="quick-start-box">
              <div className="qs-step">
                <div className="qs-number">1</div>
                <div>
                  <h4>Upload a PDF</h4>
                  <p>Head to the Workspace and drop your file securely.</p>
                </div>
              </div>
              <ArrowRight className="qs-arrow" />
              <div className="qs-step">
                <div className="qs-number">2</div>
                <div>
                  <h4>Select a Tool</h4>
                  <p>Choose Chat, Analysis, OCR, or PDF Modding.</p>
                </div>
              </div>
              <ArrowRight className="qs-arrow" />
              <div className="qs-step">
                <div className="qs-number">3</div>
                <div>
                  <h4>Extract Intelligence</h4>
                  <p>Let RovexAI do the heavy lifting instantly.</p>
                </div>
              </div>
            </div>

            <button className="dash-cta-btn" onClick={() => navigate("/app?tab=upload")}>
              Launch Workspace <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </motion.section>

        {/* Workspaces Grid */}
        <section className="dash-workspaces-section">
          <div className="dash-section-header">
            <h2>Select Your <span className="text-gradient-red">Workspace</span></h2>
          </div>

          <div className="dash-grid">
            <AnimatedCard
              icon={<MessageSquare size={28} color="var(--brand-red)" />}
              title="PDF Chat"
              description="Interact with your PDFs using natural language. Ask questions and get real-time answers."
              onClick={() => navigate("/app?tab=chat")}
              delay={0.1}
            />
            <AnimatedCard
              icon={<BarChart size={28} color="var(--brand-red)" />}
              title="Data Analysis"
              description="Deep dive into your content to extract tables, insights, and visualize nested information."
              onClick={() => navigate("/app?tab=analysis")}
              delay={0.2}
            />
            <AnimatedCard
              icon={<UploadCloud size={28} color="var(--brand-red)" />}
              title="Upload & Organize"
              description="Manage all your securely vaulted documents right here in the central Rovex library."
              onClick={() => navigate("/app?tab=upload")}
              delay={0.3}
            />
            <AnimatedCard
              icon={<LayoutTemplate size={28} color="var(--brand-red)" />}
              title="Create & Edit"
              description="Design and edit PDFs with professional, canva-like simplicity."
              onClick={() => navigate("/app?tab=create")}
              delay={0.4}
            />
            <AnimatedCard
              icon={<Scan size={28} color="var(--brand-red)" />}
              title="OCR Vision"
              description="Convert scanned images to editable text using our advanced computer vision model."
              onClick={() => navigate("/app?tab=ocr")}
              delay={0.5}
            />
            <AnimatedCard
              icon={<Wrench size={28} color="var(--brand-red)" />}
              title="PDF Utilities"
              description="Merge, Split, Watermark, and compress your PDFs entirely on the cloud."
              onClick={() => navigate("/app?tab=pdftools")}
              delay={0.6}
            />
          </div>
        </section>
      </main>

      {/* Sleek Footer */}
      <footer className="dash-footer">
        <div className="footer-links">
          <button onClick={() => navigate("/about")}>About Us</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
          <button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button>
        </div>
        <p className="footer-copyright">© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
      </footer>
    </div>
  );
}