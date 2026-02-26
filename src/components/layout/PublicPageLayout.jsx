import { Link, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import KuroLogo from "./KuroLogo.jsx";
import "../../styles/theme-red.css";
import "./PublicPageLayout.css";

export default function PublicPageLayout({ children }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="public-layout-root">

      {/* Animated Sleek Header */}
      <header className={`public-header ${scrolled ? "scrolled" : ""}`}>
        <div className="public-nav-container">

          <div className="logo-container" onClick={() => navigate("/")}>
            <KuroLogo size={32} />
            <span className="logo-text" style={{ fontSize: '1.4rem' }}>
              <span style={{ color: "var(--brand-red)" }}>Rovex</span>
              <span style={{ color: "var(--text-inverse)" }}>AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="public-nav-desktop">
            <Link to="/about" className="public-nav-link">About</Link>
            <Link to="/contact" className="public-nav-link">Contact</Link>
            <Link to="/privacy-policy" className="public-nav-link">Privacy</Link>

            <div className="public-auth-buttons">
              <SignedOut>
                <button onClick={() => navigate("/login")} className="btn-ghost">Login</button>
                <button onClick={() => navigate("/sign-up")} className="btn-primary-small">Sign Up</button>
              </SignedOut>
              <SignedIn>
                <button onClick={() => navigate("/dashboard")} className="btn-primary-small">Dashboard</button>
              </SignedIn>
            </div>
          </nav>

          {/* Mobile Hamburger Hamburger Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <motion.nav
            className="public-nav-mobile"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/about" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link to="/privacy-policy" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Privacy</Link>

            <div className="mobile-auth">
              <SignedOut>
                <button onClick={() => navigate("/login")} className="btn-ghost" style={{ width: '100%' }}>Login</button>
                <button onClick={() => navigate("/sign-up")} className="btn-primary-small" style={{ width: '100%', marginTop: '10px' }}>Sign Up</button>
              </SignedOut>
              <SignedIn>
                <button onClick={() => navigate("/dashboard")} className="btn-primary-small" style={{ width: '100%' }}>Dashboard</button>
              </SignedIn>
            </div>
          </motion.nav>
        )}
      </header>

      {/* Main Content Area */}
      <main className="public-main-content">
        <motion.div
          className="public-content-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
      </footer>
    </div>
  );
}