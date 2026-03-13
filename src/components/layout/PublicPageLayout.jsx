import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import logoIcon from "../../assets/logo.svg";
import "../../styles/homepage.css";

export default function PublicPageLayout({ children }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="hp" style={{ paddingTop: 72 }}>
      {/* ── HEADER (same as HomePage) ── */}
      <header className={`hp-header ${scrolled ? "scrolled" : ""}`}>
        <div className="hp-header-inner">
          <div className="hp-logo" onClick={() => navigate("/")}>
            <img src={logoIcon} alt="RovexAI" className="hp-logo-img" />
            <span className="hp-logo-text">
              <span className="hp-logo-red">Rovex</span>
              <span className="hp-logo-ai">AI</span>
            </span>
          </div>

          <nav className={`hp-nav ${mobileOpen ? "open" : ""}`}>
            <a href="/#features" className="hp-nav-link" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="/#how" className="hp-nav-link" onClick={() => setMobileOpen(false)}>How it Works</a>
            <a href="/about" className="hp-nav-link" onClick={() => setMobileOpen(false)}>About</a>
            <a href="/contact" className="hp-nav-link" onClick={() => setMobileOpen(false)}>Contact</a>
          </nav>

          <div className="hp-header-actions">
            <button className="hp-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </motion.div>
              </AnimatePresence>
            </button>

            <SignedOut>
              <button onClick={() => navigate("/login")} className="hp-btn-ghost">Log in</button>
              <button onClick={() => navigate("/sign-up")} className="hp-btn-primary">
                Get Started <ArrowRight size={15} />
              </button>
            </SignedOut>
            <SignedIn>
              <button onClick={() => navigate("/dashboard")} className="hp-btn-primary">
                Dashboard <ArrowRight size={15} />
              </button>
            </SignedIn>
          </div>

          <button className="hp-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: 900, margin: "3rem auto", padding: "2rem", flex: 1 }}>
        {children}
      </main>

      {/* ── FOOTER (same as HomePage) ── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <div className="hp-logo" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI" className="hp-logo-img" />
              <span className="hp-logo-text">
                <span className="hp-logo-red">Rovex</span>
                <span style={{ color: "#fff" }}>AI</span>
              </span>
            </div>
            <p className="hp-footer-tagline">Transforming how you work with documents through AI</p>
          </div>

          <div className="hp-footer-cols">
            <div className="hp-footer-col">
              <h4>Company</h4>
              <button onClick={() => navigate("/about")}>About</button>
              <button onClick={() => navigate("/contact")}>Contact</button>
            </div>
            <div className="hp-footer-col">
              <h4>Legal</h4>
              <button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button>
            </div>
          </div>
        </div>

        <div className="hp-footer-bottom">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}