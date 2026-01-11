import { Link, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react"; // Assuming Clerk is used; adjust import if different
import { useState, useEffect } from "react";

export default function PublicPageLayout({ children }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#000", // Adjusted for light theme
      }}
    >
      {/* HEADER */}
      <header className={`home-header ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-container" onClick={() => navigate("/")}>
          <img src="/kuro.png" alt="RovexAI Logo" className="logo-icon" /> {/* Adjusted src to match existing */}
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

      {/* CONTENT */}
      <main
        style={{
          maxWidth: "900px",
          margin: "60px auto",
          padding: "32px",
          flex: 1,
          background: "rgba(255,255,255,0.35)", // Adjusted for light theme glass effect
          borderRadius: "14px",
        }}
      >
        {children}
      </main>
    </div>
  );
}