import { Link, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import KuroLogo from "./KuroLogo.jsx";
import "../../styles/theme-red.css";
import "./PublicPageLayout.css";

export default function PublicPageLayout({ children }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="public-layout-root">

      {/* Floating Glass Header */}
      <header className={`public-header ${scrolled ? "scrolled" : ""}`}>
        <div className="public-nav-container">

          <div className="logo-container" onClick={() => navigate("/")}>
            <KuroLogo size={28} />
            <span className="logo-text" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              <span style={{ color: "var(--brand-red)" }}>Rovex</span>
              <span style={{ color: "var(--text-primary)" }}>AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="public-nav-desktop">
            <Link to="/about" className="public-nav-link">About</Link>
            <Link to="/contact" className="public-nav-link">Contact</Link>
            <Link to="/privacy-policy" className="public-nav-link">Privacy</Link>
          </nav>

          <div className="public-auth-buttons">
            <SignedOut>
              <button onClick={() => navigate("/login")} className="btn-ghost-sleek">Log in</button>
              <button onClick={() => navigate("/sign-up")} className="btn-primary-sleek">Sign up</button>
            </SignedOut>
            <SignedIn>
              <button onClick={() => navigate("/dashboard")} className="btn-primary-sleek">Dashboard &rarr;</button>
            </SignedIn>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Overlay (Full Screen Blur) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="public-nav-mobile-overlay"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mobile-menu-content">
                <Link to="/about" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link to="/contact" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <Link to="/privacy-policy" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Privacy Policy</Link>

                <div className="mobile-auth-stack">
                  <SignedOut>
                    <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="btn-ghost-sleek full-w">Log in</button>
                    <button onClick={() => { navigate("/sign-up"); setMobileMenuOpen(false); }} className="btn-primary-sleek full-w">Sign up</button>
                  </SignedOut>
                  <SignedIn>
                    <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="btn-primary-sleek full-w">Dashboard &rarr;</button>
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="public-main-content">
        <motion.div
          className="public-content-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Sleek Minimal Footer */}
      <footer className="public-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span style={{ color: "var(--brand-red)", fontWeight: 'bold' }}>Rovex</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 'bold' }}>AI</span>
          </div>
          <p>© {new Date().getFullYear()} RovexAI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}