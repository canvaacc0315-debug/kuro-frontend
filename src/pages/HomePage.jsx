import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../styles/homepage.css";
import logoIcon from "../assets/logo.svg"; // Add your logo image

// Import icons for features - you can use react-icons or your own SVG
import { 
  FaShieldAlt, FaDna, FaChartLine,
  FaDatabase, FaWifi, FaVideo
} from "react-icons/fa";

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const footerRef = useRef(null);

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

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text animate-fade-up">
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
                className="btn-primary btn-glow btn-scale"
                onClick={() => navigate("/sign-up")}
              >
                Get Started 
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1k+</span>
                <span className="stat-label">Documents Uploaded</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-container animate-fade-in">
            <img 
              src="https://user-gen-media-assets.s3.amazonaws.com/seedream_images/52610479-8cff-42ba-a59b-41559658dfb7.png"
              alt="AI PDF Analysis Interface" 
              className="hero-image"
            />
            <div className="floating-element floating-1"></div>
            <div className="floating-element floating-2"></div>
            <div className="floating-element floating-3"></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header animate-fade-up">
          <h2>How RovexAI Works</h2>
          <p className="subtitle">
            RovexAI combines advanced AI with intuitive design to make document processing effortless.
          </p>
        </div>
        
        <div className="steps-grid">
          {howItWorks.map((step, index) => (
            <Step key={index} {...step} delay={`${index * 0.1}s`} />
          ))}
        </div>
      </section>

      {/* FEATURES - Red Cards from your screenshot */}
      <section className="features" id="features">
        <div className="section-header animate-fade-up">
          <h2>Powerful Features</h2>
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
          <h2>Ready to Transform Your PDF Workflow?</h2>
          <p>Join to save hours every week with RovexAI</p>
          <button
            className="btn-primary btn-glow btn-scale"
            onClick={() => navigate("/sign-up")}
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer ref={footerRef} className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="logo-container">
              <img src={logoIcon} alt="RovexAI Logo" className="logo-icon" />
              <span className="logo-text">
                <span className="logo-red">Rovex</span>
                <span className="logo-ai">AI</span>
              </span>
            </div>
            <p className="footer-tagline">
              Transforming how you work with documents through AI
            </p>
          </div>

          <div className="footer-menus">
            <div className="footer-column">
              <h4>Product</h4>
              <Link to="#features" className="footer-link">Features</Link>
              <Link to="#how-it-works" className="footer-link">How it Works</Link>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 RovexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component (Red cards from your screenshot)
function FeatureCard({ icon, title, description, delay }) {
  return (
    <div 
      className="feature-card animate-fade-up"
      style={{ animationDelay: delay }}
    >
      <div className="feature-icon-red">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Step({ number, title, description, delay }) {
  return (
    <div 
      className="step-card animate-fade-up"
      style={{ animationDelay: delay }}
    >
      <div className="step-number-red">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}