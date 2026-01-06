import React, { useState, useEffect } from 'react';
import '../styles/homepage.css';

const RovexAI = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  // Handle scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all feature cards and steps
    document.querySelectorAll('.feature-card, .step').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: '📄',
      title: 'PDF Upload',
      description: 'Drag and drop your PDF files for instant processing with zero complexity.'
    },
    {
      icon: '💬',
      title: 'AI Chat',
      description: 'Ask questions about your PDFs and get instant, intelligent responses.'
    },
    {
      icon: '📊',
      title: 'Deep Analysis',
      description: 'Extract key insights, summaries, and structured data from documents.'
    },
    {
      icon: '🔍',
      title: 'OCR Technology',
      description: 'Convert scanned images to editable text with AI-powered accuracy.'
    },
    {
      icon: '✨',
      title: 'PDF Creation',
      description: 'Build professional PDFs with drag-and-drop simplicity.'
    },
    {
      icon: '🚀',
      title: 'Lightning Fast',
      description: 'Process documents in seconds with enterprise-grade performance.'
    }
  ];

  const steps = [
    {
      number: 1,
      icon: '📤',
      title: 'Upload Documents',
      description: 'Start by uploading PDFs of any size or type (research papers, legal documents, invoices, reports, study materials). The system handles the upload and begins analysis automatically.'
    },
    {
      number: 2,
      icon: '🤖',
      title: 'AI-Powered Analysis',
      description: 'The AI processes the document to recognize text, tables, structured data, and key points. Handles OCR for scanned PDFs and interprets visual elements like charts and images.'
    },
    {
      number: 3,
      icon: '💬',
      title: 'Interact & Query',
      description: 'Chat with your document using natural language questions. Ask about specific details and get accurate, context-aware answers drawn directly from the content.'
    },
    {
      number: 4,
      icon: '📊',
      title: 'Generate Outputs',
      description: 'Receive smart summaries, extracted data tables, key facts, structured information, custom notes, and additional insights based on the analysis—all ready for use.'
    }
  ];

  const footerLinks = {
    product: ['Features', 'Pricing', 'Documentation'],
    company: ['About', 'Contact', 'Privacy Policy'],
    connect: ['Twitter', 'LinkedIn', 'GitHub']
  };

  return (
    <div className="rovex-ai">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">Ⓡ</div>
          RovexAI
        </div>
        <nav className="nav">
          <span className="nav-link">Home</span>
          <span className="nav-link">About</span>
          <span className="nav-link">Contact</span>
          <button 
            className="theme-toggle" 
            id="theme-toggle" 
            onClick={toggleTheme}
            title="Toggle dark mode"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn btn-secondary">Login</button>
          <button className="btn btn-primary">Sign Up</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Chat, Analyze & Create PDFs with AI</h1>
          <p>Your all-in-one AI-powered PDF workspace. Upload, analyze, extract, and generate PDFs in seconds.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Get Started Free</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="how-it-works-content">
          <h2>How RovexAI Works</h2>
          <p className="section-subtitle">
            RovexAI combines advanced AI with intuitive design to make document processing effortless
          </p>
          
          <div className="steps-container">
            {steps.map((step, index) => (
              <div className="step" key={step.number}>
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Powerful Features</h2>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>RovexAI</h4>
            <p className="footer-description">
              The AI-powered PDF platform for modern teams.
            </p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            {footerLinks.product.map((link, index) => (
              <a key={index} className="footer-link">{link}</a>
            ))}
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            {footerLinks.company.map((link, index) => (
              <a key={index} className="footer-link">{link}</a>
            ))}
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            {footerLinks.connect.map((link, index) => (
              <a key={index} className="footer-link">{link}</a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default RovexAI;