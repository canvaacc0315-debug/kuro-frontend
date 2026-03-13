import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedSection from "../components/animated/AnimatedSection";
import GlassCard from "../components/animated/GlassCard";
import { Mail, Globe, Clock, Target } from "lucide-react";

export default function Contact() {
  const contactInfo = [
    { icon: <Mail size={20} />, title: "Email", description: <span style={{ wordBreak: "break-all" }}>RovexAi.HelpDesk2025@gmail.com</span> },
    { icon: <Globe size={20} />, title: "Website", description: "https://rovexai.com" },
    { icon: <Clock size={20} />, title: "Support Hours", description: "24/7 Availability" },
    { icon: <Target size={20} />, title: "Response Time", description: "Most inquiries answered within 24 hours" },
  ];

  return (
    <PublicPageLayout>
      {/* HERO */}
      <AnimatedSection>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.8rem", color: "var(--text-primary)" }}>
            Contact Us
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            We'd love to hear from you. Our team is always here to help.
          </p>
        </div>
      </AnimatedSection>

      {/* INTRO */}
      <AnimatedSection delay={0.1}>
        <div style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-card)",
          padding: "2rem",
          marginBottom: "3rem",
        }}>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "1rem" }}>
            Whether you have a question, feedback, feature request, or need help
            using RovexAI, our support team is ready to assist you.
          </p>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, margin: 0 }}>
            We're committed to providing reliable support and continuously
            improving our platform based on user feedback.
          </p>
        </div>
      </AnimatedSection>

      {/* CONTACT INFO GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.2rem",
        marginBottom: "3rem",
      }}>
        {contactInfo.map((c, i) => (
          <GlassCard key={i} icon={c.icon} title={c.title} description={c.description} delay={i * 0.1} />
        ))}
      </div>

      {/* NOTE */}
      <AnimatedSection delay={0.2}>
        <div style={{
          background: "var(--accent-gradient)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          color: "#fff",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.8rem" }}>We're Here to Help</h2>
          <p style={{ opacity: 0.9, lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            Thank you for choosing RovexAI. Your feedback helps us build a better
            document intelligence platform for everyone.
          </p>
        </div>
      </AnimatedSection>
    </PublicPageLayout>
  );
}