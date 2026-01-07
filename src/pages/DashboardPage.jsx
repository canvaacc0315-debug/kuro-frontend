import { useNavigate } from "react-router-dom";
import "../styles/kuro-dashboard.css";
import "../styles/kuro-dashboard.css";

export default function DashboardPanel({ pdfs = [] }) {
  const totalPdfs = pdfs.length;

  // For now these are placeholders; you can wire them to real values later
  const totalQueries = 0;
  const totalNotes = 0;

  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-root">
      {/* HEADER */}
      <header className={`home-header ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-container" onClick={() => navigate("/")}>
          <img src={logoIcon} alt="RovexAI Logo" className="logo-icon" />
          <span className="logo-text">
            <span className="logo-red">Rovex</span>
            <span className="logo-ai">AI</span>
          </span>
        </div>

        <nav className="nav">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="https://rovexai.com/contact" className="nav-link">Contact</a>

          <SignedOut>
            <button onClick={() => navigate("/login")} className="btn-outline">
              Login
            </button>
            <button onClick={() => navigate("/sign-up")} className="btn-primary btn-glow">
              Sign Up
            </button>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary btn-glow"
            >
              Go to Dashboard
            </button>
          </SignedIn>
        </nav>
      </header>

      <div className="kuro-dashboard-page">
        <div className="main-container">
          <div className="hero-banner">
            <div className="hero-text">
              <h1 className="hero-title">Welcome to <span className="hero-title-accent">RovexAI</span></h1>
              <p className="hero-subtitle">
                RovexAI is your all-in-one solution for effortless document management powered by advanced AI. Upload, organize, and interact with your PDFs like never before. Say goodbye to manual searching and hello to instant answers, smart analysis, and seamless document experiences.
              </p>
            </div>
            <div className="hero-illustration">
              {/* Updated image source for better match */}
              <img
                src="https://static.vecteezy.com/system/resources/previews/072/313/447/non_2x/modern-ai-robot-assistant-with-cheerful-face-and-headset-points-upwards-symbolizing-innovative-solutions-customer-support-and-future-technology-png.png"
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
            <h2 className="section-title">Why Choose RovexAI?</h2>
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
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo-container" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI Logo" className="logo-icon" />
              <span className="logo-text">
                <span className="logo-red">Rovex</span>
                <span className="logo-ai">AI</span>
              </span>
            </div>
            <p className="footer-tagline">
              Transforming how you work with documents through AI
            </p>
          </div>

          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features" className="footer-link">Features</a>
            <a href="#how-it-works" className="nav-link">Working</a>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about" className="footer-link">About</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
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