import PublicPageLayout from "../components/layout/PublicPageLayout";
import "../styles/public-pages.css";
import "../styles/no-scrollbar-override.css";


export default function About() {
  return (
    <PublicPageLayout>
      {/* HERO */}
      <section className="public-hero">
        <h1>About RovexAI</h1>
        <p className="public-hero-subtitle">
          Intelligent document understanding powered by AI
        </p>

        <div className="hero-cta">
          <a href="/sign-up" className="btn-primary">Get Started Free</a>
          <a href="/contact" className="btn-secondary">Contact Us</a>
        </div>
      </section>

      {/* INTRO */}
      <div className="public-card">
        <p>
          RovexAI is an advanced AI‑powered document intelligence platform designed
          to transform how users interact with PDFs. Instead of manually reading,
          searching, or extracting information, RovexAI allows users to chat with
          documents, generate summaries, and uncover insights instantly.
        </p>

        <p>
          Built for students, professionals, researchers, and businesses, RovexAI
          helps you analyze research papers, legal documents, invoices, reports,
          and study material — faster and smarter.
        </p>
      </div>

      {/* FEATURES */}
      <section className="features-grid">
        <div className="feature-card">
          <span>📄</span>
          <h3>Upload & Analyze</h3>
          <p>Upload PDFs of any size and extract insights instantly.</p>
        </div>

        <div className="feature-card">
          <span>💬</span>
          <h3>Ask Questions</h3>
          <p>Ask natural‑language questions and get accurate answers.</p>
        </div>

        <div className="feature-card">
          <span>📝</span>
          <h3>Smart Summaries</h3>
          <p>Generate concise summaries from long documents.</p>
        </div>

        <div className="feature-card">
          <span>📊</span>
          <h3>Data Extraction</h3>
          <p>Extract tables, structured data, and key points.</p>
        </div>

        <div className="feature-card">
          <span>🔍</span>
          <h3>OCR & Charts</h3>
          <p>Understand charts, images, and scanned PDFs.</p>
        </div>

        <div className="feature-card">
          <span>✍️</span>
          <h3>Create Notes</h3>
          <p>Create notes, question papers, and insights.</p>
        </div>
      </section>

      {/* VISION */}
      <div className="public-card vision-card">
        <h2>🎯 Our Vision</h2>
        <p>
          Our mission is to make knowledge accessible, searchable, and actionable.
          Documents should empower people — not slow them down.
        </p>
        <p>
          RovexAI bridges the gap between static files and intelligent
          understanding, helping users unlock the true value hidden inside their
          documents.
        </p>
      </div>
    </PublicPageLayout>
  );
}