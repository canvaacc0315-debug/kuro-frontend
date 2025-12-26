import PublicPageLayout from "../components/layout/PublicPageLayout";
import "../styles/public-pages.css";

export default function Contact() {
  return (
    <PublicPageLayout>
      {/* HERO */}
      <section className="public-hero">
        <h1>Contact Us</h1>
        <p className="public-hero-subtitle">
          We’d love to hear from you. Our team is always here to help.
        </p>
      </section>

      {/* INTRO */}
      <div className="public-card">
        <p>
          Whether you have a question, feedback, feature request, or need help
          using RovexAI, our support team is ready to assist you.
        </p>
        <p>
          We’re committed to providing reliable support and continuously
          improving our platform based on user feedback.
        </p>
      </div>

      {/* CONTACT INFO GRID */}
      <section className="features-grid">
        <div className="feature-card">
          <span>✉️</span>
          <h3>Email</h3>
          <p>RovexAi.HelpDesk@2025</p>
        </div>

        <div className="feature-card">
          <span>🌐</span>
          <h3>Website</h3>
          <p>https://rovexai.com</p>
        </div>

        <div className="feature-card">
          <span>⏰</span>
          <h3>Support Hours</h3>
          <p>24/7 Availability</p>
        </div>

        <div className="feature-card">
          <span>🎯</span>
          <h3>Response Time</h3>
          <p>Most inquiries answered within 24 hours</p>
        </div>
      </section>

      {/* NOTE */}
      <div className="public-card vision-card">
        <h2>We’re Here to Help</h2>
        <p>
          Thank you for choosing RovexAI. Your feedback helps us build a better
          document intelligence platform for everyone.
        </p>
      </div>
    </PublicPageLayout>
  );
}