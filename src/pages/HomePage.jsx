// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const staggerAnimate = (selector, delay = 100) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        el.style.animation = 'none';
        setTimeout(() => {
          el.style.animation = '';
        }, delay * index);
      });
    };

    setTimeout(() => {
      staggerAnimate('.feature-card', 80);
    }, 200);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <Link to="/" className="logo">
          <div className="logo-icon">Ⓡ</div>
          RovexAI
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/sign-up" className="btn btn-primary">Sign Up</Link>
        </nav>
      </header>

      {/* HOME PAGE */}
      <div className="hero">
        <div className="hero-content">
          <h1>Chat, Analyze & Create PDFs with AI</h1>
          <p>Your all-in-one AI-powered PDF workspace. Upload, analyze, extract, and generate PDFs in seconds.</p>
          <div className="hero-buttons">
            <Link to="/sign-up" className="btn btn-primary">Get Started Free</Link>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="how-it-works">
        <div className="how-it-works-content">
          <h2>How RovexAI Works</h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '3rem', maxWidth: '600px', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
            RovexAI combines advanced AI with intuitive design to make document processing effortless
          </p>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">📤</div>
              <h3>Upload Documents</h3>
              <p>Start by uploading PDFs of any size or type (research papers, legal documents, invoices, reports, study materials). The system handles the upload and begins analysis automatically.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">🤖</div>
              <h3>AI-Powered Analysis</h3>
              <p>The AI processes the document to recognize text, tables, structured data, and key points. Handles OCR for scanned PDFs and interprets visual elements like charts and images.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">💬</div>
              <h3>Interact & Query</h3>
              <p>Chat with your document using natural language questions. Ask about specific details and get accurate, context-aware answers drawn directly from the content.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-icon">📊</div>
              <h3>Generate Outputs</h3>
              <p>Receive smart summaries, extracted data tables, key facts, structured information, custom notes, and additional insights based on the analysis—all ready for use.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="features">
        <h2>Powerful Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>PDF Upload</h3>
            <p>Drag and drop your PDF files for instant processing with zero complexity.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>AI Chat</h3>
            <p>Ask questions about your PDFs and get instant, intelligent responses.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Deep Analysis</h3>
            <p>Extract key insights, summaries, and structured data from documents.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>OCR Technology</h3>
            <p>Convert scanned images to editable text with AI-powered accuracy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>PDF Creation</h3>
            <p>Build professional PDFs with drag-and-drop simplicity.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Lightning Fast</h3>
            <p>Process documents in seconds with enterprise-grade performance.</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>RovexAI</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>The AI-powered PDF platform for modern teams.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <a className="footer-link" href="#">Features</a>
            <a className="footer-link" href="#">Pricing</a>
            <a className="footer-link" href="#">Documentation</a>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about" className="footer-link">About</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <a className="footer-link" href="#">Twitter</a>
            <a className="footer-link" href="#">LinkedIn</a>
            <a className="footer-link" href="#">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 RovexAI. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default HomePage;