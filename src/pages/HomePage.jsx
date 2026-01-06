import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import CycleDiagram from "../components/CycleDiagram";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      {/* HEADER */}
      <header className="home-header">
        <div className="logo" onClick={() => navigate("/")}>
          Ⓡ RovexAI
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
        <h1>Chat, Analyze & Create PDFs with AI</h1>
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
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Powerful Features</h2>

        <div className="features-grid">
          <Feature title="PDF Upload" text="Upload PDFs instantly" />
          <Feature title="AI Chat" text="Ask questions from PDFs" />
          <Feature title="Deep Analysis" text="Extract insights & summaries" />
          <Feature title="OCR Technology" text="Convert scanned PDFs to text" />
          <Feature title="PDF Creation" text="Create professional PDFs" />
          <Feature title="Lightning Fast" text="Process documents in seconds" />
        </div>
      </section>

      {/* HOW IT WORKS (CYCLE) */}
      <section className="how-it-works">
        <h2>How RovexAI Works</h2>
        <CycleDiagram />
      </section>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
