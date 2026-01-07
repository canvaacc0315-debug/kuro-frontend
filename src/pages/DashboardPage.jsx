import { motion } from "framer-motion";
import "../styles/grid-fix.css";

export default function DashboardPanel({ pdfs }) {
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
            PDF Genie is your all-in-one solution for effortless document management powered by advanced AI. Upload, organize, and interact with your PDFs in a smart way. Say goodbye to manual searching and hello to instant insights and seamless document experiences.
          </p>
          <div className="hero-illustration">
            {/* Replace with your own image asset */}
            <img
              src="https://www.shutterstock.com/image-illustration/3d-graphics-ai-robot-character-260nw-2595088299.jpg"
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
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">📊</div>
            <h3 className="workspace-name">Analysis</h3>
            <p className="workspace-description">Gain insights and evaluate critical information from your PDFs.</p>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">📁</div>
            <h3 className="workspace-name">Upload & Organize</h3>
            <p className="workspace-description">Manage all your PDFs in one place. Organize into easy, fast, efficient way.</p>
            <p className="workspace-stats">Total PDFs: {totalPdfs}</p>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">✏️</div>
            <h3 className="workspace-name">Create & Edit</h3>
            <p className="workspace-description">From summaries, notes and content. Quick, easy, edit, aid notes.</p>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">🔍</div>
            <h3 className="workspace-name">OCR & Extraction</h3>
            <p className="workspace-description">Extract text and info data from scanned PDF documents.</p>
          </div>
          <div className="workspace-card">
            <div className="workspace-icon">🤖</div>
            <h3 className="workspace-name">AI Tools</h3>
            <p className="workspace-description">AI Writer • NF Settox • AI Detector • AI to Humanizer</p>
          </div>
        </div>

        {/* Retained and integrated your original recent PDFs and next upgrades as panels below workspaces */}
        <div className="grid gap-4 md:grid-cols-2 mt-8">
          <PanelBlock title="Most recent PDFs">
            {pdfs.length === 0 ? (
              <p className="text-[11px] text-inkSoft/75">Upload a PDF to see it appear here.</p>
            ) : (
              <ul className="space-y-1">
                {pdfs
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((pdf) => (
                    <li key={pdf.pdf_id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{pdf.filename}</span>
                      <span className="text-[9px] text-inkSoft/70 uppercase tracking-[0.16em]">
                        {pdf.pdf_id.slice(0, 6)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </PanelBlock>

          <PanelBlock title="Next upgrades">
            <ul className="list-disc list-inside space-y-1 text-[11px] text-inkSoft">
              <li>Persist queries & notes in a real database.</li>
              <li>Add plan limits (Free vs Pro) based on usage.</li>
              <li>Visual charts of daily activity (Recharts).</li>
              <li>Team workspaces & shared PDFs.</li>
            </ul>
          </PanelBlock>
        </div>

        <div className="section-header mt-12">
          <h2 className="section-title">Why Choose PDF Genie?</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3 className="feature-title">Military-Grade Security</h3>
            <p className="feature-desc">Your data is safe with our top-tier privacy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-desc">AI engine that delivers accurate results at valuable time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">AI Powered</h3>
            <p className="feature-desc">Experience the most robust AI technology powering all your document needs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Fully Responsive</h3>
            <p className="feature-desc">All flow that net the, wipechange to your seamless productivity any seeds.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔌</div>
            <h3 className="feature-title">API Integration</h3>
            <p className="feature-desc">Teethnaey integrate free into your workflows with our powerful API suppe sence.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Precise Accuracy</h3>
            <p className="feature-desc">Un eesAI's attem ping gather, emprecising precision and accuracy in extracting insights from your documents meeds.</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-logo">PDF Genie</div>
        <nav className="footer-nav">
          <a href="#">Product</a>
          <a href="#">Pricing</a>
          <a href="#">Company</a>
          <a href="#">Legal</a>
        </nav>
        <p>© 2025 PDF Genie. All rights reserved.</p>
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