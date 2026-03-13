import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield, Cpu, BarChart3, Database, Wifi, FileText,
  Upload, MessageSquare, Sparkles, Zap, Sun, Moon, Menu, X,
  ArrowRight, Check, ChevronDown, Star, Lock, Eye, Users
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import AnimatedSection from "../components/animated/AnimatedSection";
import TextRotator from "../components/animated/TextRotator";
import GradientButton from "../components/animated/GradientButton";
import ReviewModal from "../components/animated/ReviewModal";
import logoIcon from "../assets/logo.svg";
import "../styles/homepage.css";

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveUsers, setLiveUsers] = useState(3);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Simulate real-time active users fluctuation */
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(1, Math.min(8, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Cpu size={24} />, title: "AI & Machine Learning", desc: "Advanced AI models understand your PDFs contextually, not just by keywords.", accent: true },
    { icon: <Wifi size={24} />, title: "Real‑Time Intelligence", desc: "Analyze documents instantly as you upload them with live processing." },
    { icon: <MessageSquare size={24} />, title: "Collaborative Workspace", desc: "Work with your documents like a live interactive workspace." },
    { icon: <Database size={24} />, title: "Multi‑Document Support", desc: "Handle multiple PDFs at once — reports, contracts, research, and more." },
    { icon: <Shield size={24} />, title: "End-to-End Security", desc: "Encrypted processing ensures data never leaks or trains public models.", accent: true },
    { icon: <Sparkles size={24} />, title: "Deep PDF Insights", desc: "Hyper-personalized assessments, summaries, and actionable data extraction." },
  ];

  const steps = [
    { icon: <Upload size={28} />, title: "Upload", desc: "Drag & drop PDFs of any size" },
    { icon: <Cpu size={28} />, title: "Analyze", desc: "AI processes text, tables & visuals" },
    { icon: <MessageSquare size={28} />, title: "Query", desc: "Chat with your documents naturally" },
    { icon: <Zap size={28} />, title: "Generate", desc: "Get summaries & insights instantly" },
  ];

  return (
    <div className="hp">
      {/* ═══════════════════ HEADER ═══════════════════ */}
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
            <a href="#features" className="hp-nav-link" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how" className="hp-nav-link" onClick={() => setMobileOpen(false)}>How it Works</a>
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

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hp-hero" ref={heroRef}>
        {/* Animated grid background */}
        <div className="hp-hero-grid" />
        <div className="hp-hero-glow hp-hero-glow-1" />
        <div className="hp-hero-glow hp-hero-glow-2" />

        <motion.div className="hp-hero-inner" style={{ opacity: heroOpacity, scale: heroScale }}>
          <AnimatedSection delay={0}>
            <div className="hp-hero-badge">
              <Sparkles size={14} />
              <span>AI-POWERED PDF INTELLIGENCE</span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.08}>
            <h1 className="hp-hero-title">
              Transform Your PDFs into<br />
              <span className="hp-hero-highlight">Interactive Intelligence</span>
              <br />
              for{" "}
              <TextRotator words={["Students", "Researchers", "Professionals", "Businesses", "Everyone"]} />
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.16}>
            <p className="hp-hero-sub">
              Chat with any document, extract critical data instantly, and build
              beautiful PDFs 10x faster. Your all-in-one smart document workspace.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.22}>
            <div className="hp-hero-cta">
              <button className="hp-btn-primary hp-btn-lg" onClick={() => navigate("/sign-up")}>
                Start Free <ArrowRight size={17} />
              </button>
              <button className="hp-btn-outline hp-btn-lg" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="hp-hero-trust">
              <div className="hp-trust-avatars">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="hp-trust-avatar" style={{ zIndex: 4 - i, marginLeft: i ? -10 : 0 }}>
                    <Star size={14} />
                  </div>
                ))}
              </div>
              <div className="hp-trust-text">
                <span className="hp-trust-stars">★★★★★</span>
                <span>Trusted by 50+ users worldwide</span>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="hp-hero-formats">
              <p>Supported Document Formats</p>
              <div className="hp-format-icons">
                <span className="hp-format-badge">.PDF</span>
                <span className="hp-format-badge">.DOCX</span>
                <span className="hp-format-badge">.TXT</span>
                <span className="hp-format-badge">.CSV</span>
                <span className="hp-format-badge">IMAGE</span>
              </div>
            </div>
          </AnimatedSection>
        </motion.div>

        <div className="hp-hero-scroll-hint">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <section className="hp-stats">
        <div className="hp-stats-inner">
          {/* Live users indicator */}
          <div className="hp-stat hp-stat-live">
            <span className="hp-stat-num hp-stat-live-num">
              <span className="hp-live-dot" />
              {liveUsers}
            </span>
            <span className="hp-stat-label">
              <Users size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Online Now
            </span>
          </div>
          <div className="hp-stat-divider" />
          <div className="hp-stat">
            <span className="hp-stat-num">50+</span>
            <span className="hp-stat-label">Total Users</span>
          </div>
          <div className="hp-stat-divider" />
          <div className="hp-stat">
            <span className="hp-stat-num"><AnimatedCounter target={99} suffix=".9%" /></span>
            <span className="hp-stat-label">Uptime</span>
          </div>
          <div className="hp-stat-divider" />
          <div className="hp-stat">
            <span className="hp-stat-num"><AnimatedCounter target={1} suffix="K+" /></span>
            <span className="hp-stat-label">PDFs Processed</span>
          </div>
          <div className="hp-stat-divider" />
          <div className="hp-stat">
            <span className="hp-stat-num"><AnimatedCounter target={5} suffix="s" /></span>
            <span className="hp-stat-label">Avg. Analysis Time</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="hp-how" id="how">
        <AnimatedSection>
          <div className="hp-section-head">
            <span className="hp-section-badge">HOW IT WORKS</span>
            <h2>Four steps to smarter documents</h2>
            <p>From upload to insight in seconds — no complexity, just results.</p>
          </div>
        </AnimatedSection>

        <div className="hp-how-grid">
          {steps.map((s, i) => (
            <AnimatedSection key={i} delay={i * 0.1} style={{ height: "100%" }}>
              <motion.div
                className="hp-how-card"
                style={{ height: "100%" }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
              >
                <div className="hp-how-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="hp-how-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="hp-how-connector" />}
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FEATURES BENTO ═══════════════════ */}
      <section className="hp-features" id="features">
        <AnimatedSection>
          <div className="hp-section-head">
            <span className="hp-section-badge">FEATURES</span>
            <h2>Everything you need, nothing you don't</h2>
            <p>Powerful AI tools designed for real document workflows</p>
          </div>
        </AnimatedSection>

        <div className="hp-bento">
          {features.map((f, i) => (
            <AnimatedSection key={i} delay={i * 0.08} style={{ height: "100%" }}>
              <motion.div
                className={`hp-bento-card ${f.accent ? "hp-bento-accent" : ""}`}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <div className="hp-bento-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="hp-bento-shine" />
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════ SHOWCASE STRIP ═══════════════════ */}
      <section className="hp-showcase">
        <AnimatedSection>
          <div className="hp-showcase-inner">
            <div className="hp-showcase-left">
              <span className="hp-section-badge">WHY ROVEXAI</span>
              <h2>Built for speed.<br />Designed for clarity.</h2>
              <p>
                RovexAI isn't just another PDF tool. It's a complete document intelligence
                platform that understands context, extracts meaning, and delivers answers
                in seconds.
              </p>
              <div className="hp-showcase-checks">
                {["Contextual AI understanding", "Multi-format support", "Real-time collaboration", "Enterprise-grade security"].map((t) => (
                  <div key={t} className="hp-showcase-check">
                    <Check size={16} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hp-showcase-right">
              <div className="hp-showcase-card">
                <div className="hp-showcase-card-header">
                  <Eye size={18} />
                  <span>Live Analysis</span>
                </div>
                <div className="hp-showcase-metric">
                  <span className="hp-showcase-metric-num">98.7%</span>
                  <span className="hp-showcase-metric-label">Accuracy Rate</span>
                </div>
                <div className="hp-showcase-bar">
                  <motion.div
                    className="hp-showcase-bar-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: "98.7%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
              <div className="hp-showcase-card">
                <div className="hp-showcase-card-header">
                  <Lock size={18} />
                  <span>Security Score</span>
                </div>
                <div className="hp-showcase-metric">
                  <span className="hp-showcase-metric-num">A+</span>
                  <span className="hp-showcase-metric-label">Enterprise Grade</span>
                </div>
                <div className="hp-showcase-badges">
                  <span className="hp-showcase-badge-item">🔒 E2E Encrypted</span>
                  <span className="hp-showcase-badge-item">✓ SOC2 Ready</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════════ REVIEWS (MARQUEE) ═══════════════════ */}
      <section className="hp-reviews">
        <AnimatedSection>
          <div className="hp-reviews-head">
            <span className="hp-section-badge">TESTIMONIALS</span>
            <h2>Loved by professionals and students</h2>
            <p>See how RovexAI is changing the way people work with documents every day.</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="hp-marquee-container">
            {/* Two identical blocks of cards for seamless infinite scrolling */}
            {[1, 2].map((groupIndex) => (
              <div key={groupIndex} className="hp-marquee-content" aria-hidden={groupIndex === 2}>
                {[
                  {
                    name: "Dr. Sarah Jenkins",
                    role: "Medical Researcher",
                    initial: "S",
                    text: "RovexAI cut down my literature review time by hours. The ability to instantly query clinical trial PDFs is completely game-changing for my workflow."
                  },
                  {
                    name: "Michael Chen",
                    role: "Law Student",
                    initial: "M",
                    text: "Summarizing 100-page case files used to take my whole weekend. Now I get exactly what I need in 10 minutes. This is the ultimate study companion."
                  },
                  {
                    name: "Elena Rodriguez",
                    role: "Financial Analyst",
                    initial: "E",
                    text: "The data extraction features are top-notch. Pulling out exact figures from quarterly reports without reading the whole document is a massive time saver."
                  },
                  {
                    name: "David Kim",
                    role: "Software Architect",
                    initial: "D",
                    text: "I load entire technical specification PDFs into RovexAI and generate API implementation plans directly. It never misses the fine print."
                  },
                  {
                    name: "Jessica Albright",
                    role: "HR Manager",
                    initial: "J",
                    text: "Screening resumes and internal policy documents is effortless now. The contextual AI answers my exact questions beautifully."
                  }
                ].map((review, i) => (
                  <div key={i} className="hp-review-card">
                    <div className="hp-review-header">
                      <div className="hp-review-avatar">{review.initial}</div>
                      <div className="hp-review-meta">
                        <span className="hp-review-author">{review.name}</span>
                        <span className="hp-review-role">{review.role}</span>
                      </div>
                    </div>
                    <div className="hp-review-stars">
                      {[...Array(5)].map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                    </div>
                    <p className="hp-review-text">"{review.text}"</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <GradientButton variant="outline" onClick={() => setIsReviewModalOpen(true)}>
              <MessageSquare size={16} style={{ marginRight: 6 }} />
              Leave a Review
            </GradientButton>
          </div>
        </AnimatedSection>
      </section>


      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="hp-cta">
        <AnimatedSection>
          <div className="hp-cta-box">
            <div className="hp-cta-glow-1" />
            <div className="hp-cta-glow-2" />
            <div className="hp-cta-content">
              <h2>Ready to transform your PDF workflow?</h2>
              <p>Join and save hours every week with AI-powered document intelligence.</p>
              <div className="hp-cta-btns">
                <button className="hp-btn-white" onClick={() => navigate("/sign-up")}>
                  Get Started Free <ArrowRight size={16} />
                </button>
                <button className="hp-btn-glass" onClick={() => navigate("/login")}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <div className="hp-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <img src={logoIcon} alt="RovexAI Logo" className="hp-logo-img" width="24" height="24" />
              <span className="hp-logo-text">Rovex<span className="hp-logo-red">AI</span></span>
            </div>
            <p className="hp-footer-tagline">Transforming how you work with documents through AI.</p>
          </div>

          <div className="hp-footer-cols">
            <div className="hp-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how">How it Works</a>
            </div>
            <div className="hp-footer-col">
              <h4>Company</h4>
              <button onClick={() => navigate("/about")}>About</button>
              <button onClick={() => navigate("/contact")}>Contact</button>
            </div>
            <div className="hp-footer-col">
              <h4>Legal</h4>
              <button onClick={() => navigate("/privacy")}>Privacy Policy</button>
              <button onClick={() => navigate("/terms")}>Terms of Service</button>
            </div>
          </div>
        </div>

        <div className="hp-footer-bottom">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
