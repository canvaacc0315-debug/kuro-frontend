import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../styles/homepage.css";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="home-root">
      {/* HEADER */}
      <header className="home-header">
        <div className="logo-container" onClick={() => navigate("/")}>
          <span className="logo-icon">Ⓡ</span>
          <span className="logo-text">RovexAI</span>
        </div>
        <nav className="nav">
          <span>Home</span>
          <span>About</span>
          <span>Contact</span>
          <SignedOut>
            <button onClick={() => navigate("/login")} className="btn-outline">
              Login
            </button>
            <button onClick={() => navigate("/sign-up")} className="btn-primary">
              Sign Up
            </button>
          </SignedOut>
          <SignedIn>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </SignedIn>
        </nav>
      </header>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>RovexAI</h1>
          <h2>Chat, Analyze & Create PDFs with AI</h2>
          <p>
            Your all‑in‑one AI‑powered PDF workspace. Upload, analyze, extract, and
            generate PDFs in seconds.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/sign-up")}
            >
              Get Started Free
            </button>
            <button className="btn-outline">Learn More</button>
          </div>
        </div>
        {/* Space for importing image without frame */}
        <div className="hero-image-container">
          {/* Import your image here, e.g., <img src={yourImage} alt="Hero Illustration" /> */}
          {/* Placeholder for image */}
          <img
            src="https://via.placeholder.com/800x400?text=Your+Hero+Image+Here"
            alt="Hero Illustration"
            className="hero-image"
          />
        </div>
      </section>
      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2>How RovexAI Works</h2>
        <p className="subtitle">
          RovexAI combines advanced AI with intuitive design to make document processing effortless.
        </p>
        <div className="steps-grid">
          <Step number="1" title="Upload Documents" text="Upload PDFs of any size or type." />
          <Step number="2" title="AI-Powered Analysis" text="Process text, tables, and visuals." />
          <Step number="3" title="Interact & Query" text="Chat with documents using natural language." />
          <Step number="4" title="Generate Outputs" text="Get summaries, data, and insights." />
        </div>
      </section>
      {/* FEATURES */}
      <section className="features">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          <Feature icon="📄" title="PDF Upload" text="Upload PDFs instantly for seamless processing." />
          <Feature icon="🤖" title="AI Chat" text="Ask questions from PDFs using natural language." />
          <Feature icon="🔍" title="Deep Analysis" text="Extract insights, summaries, and key data." />
          <Feature icon="📷" title="OCR Technology" text="Convert scanned PDFs to editable text." />
          <Feature icon="✏️" title="PDF Creation" text="Create professional PDFs from scratch or data." />
          <Feature icon="⚡" title="Lightning Fast" text="Process documents in seconds with AI speed." />
        </div>
      </section>
      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <ul>
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li>About</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4>Connect</h4>
              <ul>
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>GitHub</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="footer-copyright">© 2026 RovexAI. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}