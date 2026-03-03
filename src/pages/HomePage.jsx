import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import "../styles/homepage.css";
import logoIcon from "../assets/logo.svg";
import {
  FileText, BarChart3, Wand2, Upload, Cpu, Download,
  Star, ArrowRight, Github, Twitter, Zap, Shield, Layers
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const headerRef = useRef(null);

  // Scroll handler for header
  useEffect(() => {
    const handleScroll = () => {
      headerRef.current?.classList.toggle("scrolled", window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "50px 0px -20px 0px" }
    );
    // Small delay to ensure DOM is painted before observing
    requestAnimationFrame(() => {
      document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    });
    return () => observer.disconnect();
  }, []);

  const capabilities = [
    {
      icon: <FileText size={24} />,
      title: "Chat with PDFs",
      desc: "Ask questions, get answers, and interact with your documents using natural language powered by advanced AI.",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Analyze Data",
      desc: "Extract tables, charts, and key insights automatically from any PDF with precision and speed.",
    },
    {
      icon: <Wand2 size={24} />,
      title: "Create with AI",
      desc: "Generate summaries, flashcards, reports, and entirely new PDFs from your existing documents.",
    },
  ];

  const steps = [
    { icon: <Upload size={26} />, title: "Upload", desc: "Drag & drop any PDF to get started instantly." },
    { icon: <Cpu size={26} />, title: "AI Processes", desc: "Our AI analyzes text, tables, and visuals in seconds." },
    { icon: <Download size={26} />, title: "Get Results", desc: "Download summaries, insights, and generated content." },
  ];

  const testimonials = [
    {
      text: "RovexAI completely transformed how I handle research papers. The AI chat feature saves me hours every single day.",
      name: "Sarah Parker",
      role: "PhD Researcher",
      initials: "SP",
    },
    {
      text: "I use RovexAI to analyze contracts and legal PDFs. The accuracy is remarkable — it catches details I might miss.",
      name: "Tom Miller",
      role: "Legal Analyst",
      initials: "TM",
    },
    {
      text: "The PDF creation tools are incredible. I generate professional reports in minutes instead of spending hours formatting.",
      name: "Priya Kapoor",
      role: "Business Consultant",
      initials: "PK",
    },
  ];



  return (
    <div className="home-root">
      {/* ── HEADER ── */}
      <header ref={headerRef} className="home-header">
        <div className="logo-container" onClick={() => navigate("/")}>
          <img src={logoIcon} alt="RovexAI" className="logo-icon" />
          <span className="logo-text">
            <span className="logo-red">Rovex</span>
            <span className="logo-ai">AI</span>
          </span>
        </div>

        <nav className="nav">
          <a href="#capabilities" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="https://rovexai.com/contact" className="nav-link">Contact</a>

          <SignedOut>
            <button onClick={() => navigate("/login")} className="btn-outline">Login</button>
            <button onClick={() => navigate("/sign-up")} className="btn-primary">Get Started</button>
          </SignedOut>
          <SignedIn>
            <button onClick={() => navigate("/dashboard")} className="btn-primary">
              Go to Dashboard
            </button>
          </SignedIn>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        {/* Mesh gradient blobs */}
        <div className="hero-mesh">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        {/* Floating icons */}
        <div className="hero-floating-icons">
          <div className="floating-icon floating-icon-1"><Zap size={18} /></div>
          <div className="floating-icon floating-icon-2"><Shield size={18} /></div>
          <div className="floating-icon floating-icon-3"><Layers size={18} /></div>
          <div className="floating-icon floating-icon-4"><FileText size={18} /></div>
        </div>

        <div className="hero-content">
          <div className="hero-text scroll-reveal">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              AI-Powered PDF Platform
            </div>

            <h1 className="hero-title">
              Master Your{" "}
              <span className="hero-gradient">Documents</span>
              <br />with RovexAI
            </h1>

            <p className="hero-subtitle">
              Upload, analyze, and generate PDFs in seconds — your all-in-one
              AI-powered document workspace built for speed and clarity.
            </p>

            <div className="hero-actions">
              <button className="btn-primary btn-scale" onClick={() => navigate("/sign-up")}>
                Get Started Free
              </button>
            </div>
          </div>

          <div className="hero-image-container scroll-reveal" data-delay="2">
            <img
              src="https://user-gen-media-assets.s3.amazonaws.com/seedream_images/52610479-8cff-42ba-a59b-41559658dfb7.png"
              alt="RovexAI Dashboard"
              className="hero-image"
            />
            <div className="hero-image-glow" />
          </div>
        </div>
      </section>



      {/* ── CORE CAPABILITIES ── */}
      <section className="capabilities" id="capabilities">
        <div className="section-header scroll-reveal">
          <h2>Powerful Core Capabilities</h2>
          <p>Our platform is built from the ground up to deliver intelligent, reliable, and instant results for every document.</p>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((cap, i) => (
            <div className="capability-card scroll-reveal" data-delay={i + 1} key={i}>
              <div className="capability-icon">{cap.icon}</div>
              <h3>{cap.title}</h3>
              <p>{cap.desc}</p>
              <a href="#" className="capability-link">
                Learn More <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header scroll-reveal">
          <h2>Simple 3-Step Process</h2>
          <p>Get started in minutes — no learning curve required.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <div className="step-card scroll-reveal" data-delay={i + 1} key={i}>
              <div className="step-icon-wrap">{step.icon}</div>
              <h3>{`${i + 1}. ${step.title}`}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="how-it-works-cta scroll-reveal" data-delay="3">
          <a href="#capabilities">
            Ready to dive in? <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="stats-bar">
        <div className="stats-bar-inner scroll-reveal">
          <div className="stat-item">
            <span className="stat-number">10+</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">Uptime Guaranteed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1K+</span>
            <span className="stat-label">Documents Processed</span>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials" id="testimonials">
        <div className="section-header scroll-reveal">
          <h2>Loved by researchers & analysts</h2>
          <p>See what our users have to say about RovexAI.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card scroll-reveal" data-delay={i + 1} key={i}>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.initials}</div>
                <div className="author-info">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-card scroll-reveal">
          <div className="cta-content">
            <h2>Ready to work smarter?</h2>
            <p>Transform how you handle documents with the power of AI. Start for free today.</p>
            <div className="cta-buttons">
              <button className="cta-btn-white" onClick={() => navigate("/sign-up")}>
                Start for Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo-container" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI" className="logo-icon" />
              <span className="logo-text">
                <span className="logo-red">Rovex</span>
                <span className="footer-ai">AI</span>
              </span>
            </div>
            <p className="footer-tagline">
              Transforming how you work with documents through the power of artificial intelligence.
            </p>
            <div className="footer-social">
              <a href="#" className="footer-social-link" aria-label="GitHub"><Github size={16} /></a>
              <a href="#" className="footer-social-link" aria-label="Twitter"><Twitter size={16} /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Product</h4>
            <a href="#capabilities" className="footer-link">Features</a>
            <a href="#how-it-works" className="footer-link">How it Works</a>
            <a href="#testimonials" className="footer-link">Reviews</a>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <button onClick={() => navigate("/about")} className="footer-link">About</button>
            <button onClick={() => navigate("/contact")} className="footer-link">Contact</button>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <button onClick={() => navigate("/privacy-policy")} className="footer-link">Privacy Policy</button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
