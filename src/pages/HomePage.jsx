import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/homepage.css";
import KuroLogo from "../components/layout/KuroLogo.jsx";

// Import icons for features - you can use react-icons or your own SVG
import { 
  FaUpload, FaComments, FaSearch, 
  FaFileAlt, FaFilePdf, FaBolt,
  FaShieldAlt, FaDna, FaChartLine,
  FaDatabase, FaWifi, FaVideo
} from "react-icons/fa";

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <FaChartLine />,
      title: "AI & Machine Learning",
      description: "Sophisticated AI analyzes massive datasets to uncover intricate patterns and predict outcomes."
    },
    {
      icon: <FaDatabase />,
      title: "Big Data Interoperability",
      description: "Seamlessly storing and securely sharing information across disparate systems."
    },
    {
      icon: <FaWifi />,
      title: "Wearables & IoT",
      description: "Continuous, real-time tracking of data outside traditional settings for better insights."
    },
    {
      icon: <FaShieldAlt />,
      title: "End-to-End Security",
      description: "State-of-the-art encryption ensures your data remains private and compliant."
    },
    {
      icon: <FaVideo />,
      title: "Telehealth Evolution",
      description: "Dismantling geographical barriers to access, enabling effective remote monitoring."
    },
    {
      icon: <FaDna />,
      title: "Genetic Insights",
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
          <KuroLogo />
          <span className="logo-text">
            <span className="logo-red">Rovex</span>AI
          </span>
        </div>

        <nav className="nav">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#contact" className="nav-link">Contact</a>

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
                Get Started Free
              </button>
              <button className="btn-outline btn-scale">Learn More</button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Documents</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-container animate-fade-in">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
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

      {/* ADDITIONAL FEATURES */}
      <section className="additional-features">
        <div className="section-header animate-fade-up">
          <h2>Advanced PDF Capabilities</h2>
          <p>More ways RovexAI enhances your document workflow</p>
        </div>
        
        <div className="features-grid">
          <Feature 
            icon={<FaUpload />}
            title="PDF Upload" 
            description="Upload PDFs instantly with drag & drop interface" 
          />
          <Feature 
            icon={<FaComments />}
            title="AI Chat" 
            description="Ask questions and get intelligent answers from your PDFs" 
          />
          <Feature 
            icon={<FaSearch />}
            title="Deep Analysis" 
            description="Extract insights, summaries, and key information automatically" 
          />
          <Feature 
            icon={<FaFileAlt />}
            title="OCR Technology" 
            description="Convert scanned PDFs to editable text with high accuracy" 
          />
          <Feature 
            icon={<FaFilePdf />}
            title="PDF Creation" 
            description="Create professional PDFs from scratch using AI assistance" 
          />
          <Feature 
            icon={<FaBolt />}
            title="Lightning Fast" 
            description="Process documents in seconds with our optimized AI engine" 
          />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content animate-fade-up">
          <h2>Ready to Transform Your PDF Workflow?</h2>
          <p>Join thousands of users who save hours every week with RovexAI</p>
          <button
            className="btn-primary btn-glow btn-scale"
            onClick={() => navigate("/sign-up")}
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo-container" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI Logo" className="logo-icon" />
              <span className="logo-text">
                <span className="logo-red">Rovex</span>AI
              </span>
            </div>
            <p className="footer-tagline">
              Transforming how you work with documents through AI
            </p>
            <div className="social-links">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">GitHub</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features" className="footer-link">Features</a>
            <a href="#" className="footer-link">Pricing</a>
            <a href="#" className="footer-link">API</a>
            <a href="#" className="footer-link">Documentation</a>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#contact" className="footer-link">Contact</a>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Cookie Policy</a>
            <a href="#" className="footer-link">GDPR</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#" className="footer-link">Status</a>
            <a href="#" className="footer-link">Security</a>
          </div>
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

// Original Feature Component
function Feature({ icon, title, description }) {
  return (
    <div className="feature-item">
      <div className="feature-icon">
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