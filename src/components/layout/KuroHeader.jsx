import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function KuroHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isDashboard = location.pathname.startsWith("/dashboard");
    const isApp = location.pathname.startsWith("/app");

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`hp-header ${scrolled ? "scrolled" : ""}`}>
            <div className="hp-header-inner">
                <div className="hp-logo" onClick={() => navigate("/")}>
                    <img src="/kuro.png" alt="RovexAI" className="hp-logo-img" />
                    <span className="hp-logo-text">
                        <span className="hp-logo-red">Rovex</span>
                        <span className="hp-logo-ai">AI</span>
                    </span>
                </div>

                <nav className={`hp-nav ${mobileOpen ? "open" : ""}`}>
                    <a href="/#features" className="hp-nav-link" onClick={(e) => {
                        e.preventDefault();
                        setMobileOpen(false);
                        if (location.pathname === "/") {
                            const el = document.getElementById("features");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        } else {
                            navigate("/#features");
                        }
                    }}>Features</a>
                    <a href="/#how" className="hp-nav-link" onClick={(e) => {
                        e.preventDefault();
                        setMobileOpen(false);
                        if (location.pathname === "/") {
                            const el = document.getElementById("how");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        } else {
                            navigate("/#how");
                        }
                    }}>How it Works</a>
                    <a href="/about" className="hp-nav-link" onClick={() => setMobileOpen(false)}>About</a>
                    <a href="/contact" className="hp-nav-link" onClick={() => setMobileOpen(false)}>Contact</a>
                </nav>

                <div className="hp-header-actions">
                    <button className="hp-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isDark ? "dark" : "light"}
                                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.25 }}
                                style={{ display: "flex", alignItems: "center" }}
                            >
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>

                    <SignedOut>
                        <button onClick={() => navigate("/login")} className="hp-btn-ghost">Log in</button>
                        <button onClick={() => navigate("/sign-up")} className="hp-btn-primary">
                            Get Started <ArrowRight size={15} />
                        </button>
                    </SignedOut>
                    <SignedIn>
                        {isDashboard ? (
                            <button onClick={() => navigate("/app?tab=chat")} className="hp-btn-primary">
                                Go to Workspace <ArrowRight size={15} />
                            </button>
                        ) : isApp ? (
                            <button onClick={() => navigate("/dashboard")} className="hp-btn-primary">
                                Back to Dashboard <ArrowRight size={15} />
                            </button>
                        ) : (
                            <button onClick={() => navigate("/dashboard")} className="hp-btn-primary">
                                Dashboard <ArrowRight size={15} />
                            </button>
                        )}
                    </SignedIn>
                </div>

                <button className="hp-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>
        </header>
    );
}
