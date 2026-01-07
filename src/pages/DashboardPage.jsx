import { motion } from "framer-motion";
import "../styles/grid-fix.css";
import "../styles/kuro-dashboard.css";

export default function DashboardPanel({ pdfs = [] }) {
  const totalPdfs = pdfs.length;

  // For now these are placeholders; you can wire them to real values later
  const totalQueries = 0;
  const totalNotes = 0;

  return (
    <div className="kuro-dashboard-page">
      <div className="main-container">
        <div className="hero-banner">
          <h1 className="hero-title">Welcome to <span className="hero-title-accent">PDF Genie</span></h1>
          <p className="hero-subtitle">
            PDF Genie is your all-in-one solution for effortless document management powered by advanced AI. Upload, organize, and interact with your PDFs like never before. Say goodbye to manual searching and hello to instant answers, smart analysis, and seamless document experiences.
          </p>
          <button className="workspace-btn">Upload PDF</button>
          <div className="hero-illustration">
            {/* Replace with your own image asset */}
            <img
              src="https://media.discordapp.net/attachments/1399772839296630907/1458462138048712774/content.png?ex=695fba36&is=695e68b6&hm=ad9808bea83ee49df2ac71c103e50de4a70c70b557f8058c5b4f3d9be155bbcf&=&format=webp&quality=lossless&width=670&height=1006"
              alt="AI Robot Assistant"
              className="illustration-image"
            />
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">Choose Your Workspace</h2>
          <p className="section-subtitle">Select a workspace to jump-start your tasks.</p>
        </div>

        <div className="workspace-grid">
          <div className="workspace-card">
            <div className="workspace-icon">📄</div>
            <h3 className="workspace-name">PDF Chat</h3>
            <p className="workspace-description">Chat directly with your PDFs. Ask questions and get instant answers.</p>
            <button className="workspace-btn">Open Workspace</button>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">📊</div>
            <h3 className="workspace-name">Analysis</h3>
            <p className="workspace-description">Gain insights and evaluate critical information from your PDFs.</p>
            <button className="workspace-btn">Open Workspace</button>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">📁</div>
            <h3 className="workspace-name">Upload & Organize</h3>
            <p className="workspace-description">Manage all your PDFs in one place. Organize and search effortlessly.</p>
            <p className="workspace-stats">Total PDFs: {totalPdfs}</p>
            <button className="workspace-btn">Open Workspace</button>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">✏️</div>
            <h3 className="workspace-name">Create & Edit</h3>
            <p className="workspace-description">Create new documents or edit existing PDFs. Modify text, add notes and more.</p>
            <button className="workspace-btn">Open Workspace</button>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">🔍</div>
            <h3 className="workspace-name">OCR & Extraction</h3>
            <p className="workspace-description">Extract text and information from scanned PDF documents.</p>
            <button className="workspace-btn">Open Workspace</button>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">⚙️</div>
            <h3 className="workspace-name">Settings</h3>
            <p className="workspace-description">Configure your account settings to customize our platform to your needs.</p>
            <button className="workspace-btn">Open Workspace</button>
          </div>
        </div>

        <div className="section-header mt-12">
          <h2 className="section-title">Why Choose PDF Genie?</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3 className="feature-title">Military-Grade Security</h3>
            <p className="feature-desc">Your data is safe with enterprise-grade security because privacy is our top concern.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-desc">Our lightning-fast AI engine delivers accurate results in record time, saving you valuable time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">AI Powered</h3>
            <p className="feature-desc">Powered by the latest AI technology, empowering all your document needs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Fully Responsive</h3>
            <p className="feature-desc">Fully responsive design that works on any device to ensure seamless productivity anywhere.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔌</div>
            <h3 className="feature-title">API Integration</h3>
            <p className="feature-desc">Easily integrate our AI into your workflows with our powerful API support.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Precise Accuracy</h3>
            <p className="feature-desc">Our AI is designed to deliver precise accuracy, ensuring reliable insights from your documents.</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-logo">PDF Genie</div>
        <nav className="footer-nav">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Help Center</a>
          <a href="#">Documents</a>
          <a href="#">Contact</a>
        </nav>
        <p>© 2026 PDF Genie. All rights reserved.</p>
      </footer>
    </div>
  );
}

function PanelBlock({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl2 border border-stroke bg-panelSoft/80 px-4 py-3 shadow-subtle/40 h-full"
    >
      <div className="text-[11px] text-inkSoft uppercase tracking-[0.18em] mb-3">{title}</div>
      <div className="text-[11px]">{children}</div>
    </motion.div>
  );
}