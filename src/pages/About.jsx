import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedSection from "../components/animated/AnimatedSection";
import GlassCard from "../components/animated/GlassCard";
import GradientButton from "../components/animated/GradientButton";
import { FileText, MessageSquare, Sparkles, BarChart3, Search, PenTool, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const features = [
    { icon: <FileText size={20} />, title: "Upload & Analyze", description: "Upload PDFs of any size and extract insights instantly." },
    { icon: <MessageSquare size={20} />, title: "Ask Questions", description: "Ask natural‑language questions and get accurate answers." },
    { icon: <Sparkles size={20} />, title: "Smart Summaries", description: "Generate concise summaries from long documents." },
    { icon: <BarChart3 size={20} />, title: "Data Extraction", description: "Extract tables, structured data, and key points." },
    { icon: <Search size={20} />, title: "OCR & Charts", description: "Understand charts, images, and scanned PDFs." },
    { icon: <PenTool size={20} />, title: "Create Notes", description: "Create notes, question papers, and insights." },
  ];

  return (
    <PublicPageLayout>
      {/* HERO */}
      <AnimatedSection>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.8rem", color: "var(--text-primary)" }}>
            About <span style={{ color: "var(--accent)" }}>Rovex</span>AI
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: 550, margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Intelligent document understanding powered by AI
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <GradientButton onClick={() => navigate("/sign-up")}>Get Started Free <ArrowRight size={16} /></GradientButton>
            <GradientButton variant="outline" onClick={() => navigate("/contact")}>Contact Us</GradientButton>
          </div>
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
            <strong style={{ color: "var(--accent)" }}>Rovex</strong><strong style={{ color: "var(--text-primary)" }}>AI</strong> is an advanced AI‑powered document intelligence platform designed
            to transform how users interact with PDFs. Instead of manually reading,
            searching, or extracting information, RovexAI allows users to chat with
            documents, generate summaries, and uncover insights instantly.
          </p>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, margin: 0 }}>
            Built for students, professionals, researchers, and businesses, RovexAI
            helps you analyze research papers, legal documents, invoices, reports,
            and study material — faster and smarter.
          </p>
        </div>
      </AnimatedSection>

      {/* FEATURES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.2rem",
        marginBottom: "3rem",
      }}>
        {features.map((f, i) => (
          <GlassCard key={i} icon={f.icon} title={f.title} description={f.description} delay={i * 0.08} />
        ))}
      </div>

      {/* VISION */}
      <AnimatedSection delay={0.2}>
        <div style={{
          background: "var(--accent-gradient)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          color: "#fff",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <Target size={28} style={{ marginBottom: "0.8rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.8rem" }}>Our Vision</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
              Our mission is to make knowledge accessible, searchable, and actionable.
              RovexAI bridges the gap between static files and intelligent understanding,
              helping users unlock the true value hidden inside their documents.
            </p>
          </div>
        </div>
      </AnimatedSection>
    </PublicPageLayout>
  );
}