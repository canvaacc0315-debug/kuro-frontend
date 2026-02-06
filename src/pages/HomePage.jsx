import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../styles/homepage.css";
import logoIcon from "../assets/logo.svg";

import { 
  FaShieldAlt, FaDna, FaChartLine,
  FaDatabase, FaWifi, FaVideo
} from "react-icons/fa";

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const footerRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.innerText = isDecimal ? current.toFixed(1) : Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target;
        }
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateCounter();
            observer.unobserve(counter);
          }
        });
      });
      
      observer.observe(counter);
    });
  }, []);

  const features = [
    {
      icon: <FaChartLine />,
      title: "AI & Machine Learning",
      description: "Advanced AI models understand your PDFs contextually, not just by keywords."
    },
    {
      icon: <FaWifi />,
      title: "Real‑Time Document Intelligence",
      description: "Analyze documents instantly as you upload them."
    },
    {
      icon: <FaVideo />,
      title: "Collaborative AI Workspace",
      description: "Work with your documents like a live workspace."
    },
    {
      icon: <FaDatabase />,
      title: "Big Data Interoperability",
      description: "Handle multiple PDFs at once—reports, contracts, research, and more."
    },
    {
      icon: <FaShieldAlt />,
      title: "End-to-End Security",
      description: "Encrypted processing ensures data never leaks or trains public models."
    },
    {
      icon: <FaDna />,
      title: "Deep PDF Insights",
      description: "Integrating advanced data to provide hyper-personalized assessments and plans."
    }
  ];

  const howItWorks = [
    {
      number: "1",
      title: "Upload Documents",
      description: "Upload PDFs of any size or type with drag & drop."
    },
    {
      number: "2",
      title: "AI-Powered Analysis",
      description: "Process text, tables, and visuals with advanced AI."
    },
    {
      number: "3",
      title: "Interact & Query",
      description: "Chat with documents using natural language."
    },
    {
      number: "4",
      title: "Generate Outputs",
      description: "Get summaries, data, and insights instantly."
    }
  ];

  return (
    <div className="home-root">
      {/* Animated Background Grid */}
      <div className="bg-grid"></div>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

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
          <a href="#features" className="nav-link magnetic-text">Features</a>
          <a href="#how-it-works" className="nav-link magnetic-text">How it Works</a>
          <a href="https://rovexai.com/contact" className="nav-link magnetic-text">Contact</a>

          <SignedOut>
            <button onClick={() => navigate("/login")} className="btn-outline magnetic-btn">
              Login
            </button>
            <button onClick={() => navigate("/sign-up")} className="btn-primary btn-glow magnetic-btn">
              Sign Up
            </button>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary btn-glow magnetic-btn"
            >
              Go to Dashboard
            </button>
          </SignedIn>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text animate-fade-up">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              Now with Real-time Collaboration
            </div>
            
            <h1 className="hero-title">
              <span className="hero-gradient">RovexAI</span>
              <br />
              Chat, Analyze & Create PDFs with AI
            </h1>
            <p className="hero-subtitle">
              Your all‑in‑one AI‑powered PDF workspace. Upload, analyze, extract, and
              generate PDFs in seconds.
            </p>

            <div className="hero-actions">
              <button
                className="btn-primary btn-glow btn-scale magnetic-btn"
                onClick={() => navigate("/sign-up")}
              >
                Get Started 
                <svg className="btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            </div>

            <div className="hero-stats" ref={statsRef}>
              <div className="stat-item">
                <span className="stat-number counter" data-target="10">0</span>
                <span className="stat-label">K+ Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number counter" data-target="99.9">0</span>
                <span className="stat-label">% Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-number counter" data-target="1000">0</span>
                <span className="stat-label">K+ Documents</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-container animate-fade-in">
            <div className="hero-image-glow"></div>
            <img 
              src="https://user-gen-media-assets.s3.amazonaws.com/seedream_images/52610479-8cff-42ba-a59b-41559658dfb7.png"
              alt="AI PDF Analysis Interface" 
              className="hero-image"
            />
            <div className="floating-card card-1">
              <div className="floating-icon">✓</div>
              <div>
                <div className="floating-title">Analysis Complete</div>
                <div className="floating-subtitle">98% Accuracy</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="floating-icon">📄</div>
              <div>
                <div className="floating-title">Documents</div>
                <div className="floating-subtitle">1,240 Processed</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header animate-fade-up">
          <h2>How It <span className="text-red">Works</span></h2>
          <p className="subtitle">
            RovexAI combines advanced AI with intuitive design to make document processing effortless.
          </p>
        </div>
        
        <div className="steps-grid">
          {howItWorks.map((step, index) => (
            <Step key={index} {...step} delay={`${index * 0.1}s`} index={index} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-header animate-fade-up">
          <h2>Powerful <span className="text-red">Features</span></h2>
          <p>Everything you need to work with PDFs intelligently</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={`${index * 0.1}s`}
            />
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content animate-fade-up">
          <div className="cta-glow"></div>
          <h2>Ready to Transform Your PDF Workflow?</h2>
          <p>Join to save hours every week with RovexAI</p>
          <button
            className="btn-primary btn-glow btn-scale magnetic-btn pulse-ring"
            onClick={() => navigate("/sign-up")}
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer ref={footerRef} className="footer">
        <div className="footer-content">
          <div className="footer-section brand-section">
            <div className="logo-container" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI Logo" className="logo-icon" />
              <span className="logo-text">
                <span className="logo-red">Rovex</span>
                <span className="footer-ai">AI</span>
              </span>
            </div>
            <p className="footer-tagline">
              Transforming how you work with documents through AI
            </p>
          </div>

          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features" className="footer-link">Features</a>
            <a href="#how-it-works" className="footer-link">Working</a>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <button onClick={() => navigate("/about")} className="footer-link">
              About
            </button>
            <button onClick={() => navigate("/contact")} className="footer-link">
              Contact
            </button>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <button
              onClick={() => navigate("/privacy-policy")}
              className="footer-link"
            >
              Privacy Policy
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <div 
      className="feature-card tilt-card animate-fade-up"
      style={{ animationDelay: delay }}
    >
      <div className="tilt-content">
        <div className="feature-icon-red">
          {icon}
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Step({ number, title, description, delay, index }) {
  return (
    <div 
      className="step-card spotlight animate-fade-up"
      style={{ animationDelay: delay, marginTop: index % 2 === 1 ? '2rem' : '0' }}
    >
      <div className="step-number-red">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}