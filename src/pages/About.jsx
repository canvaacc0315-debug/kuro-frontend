import { FileText, MessageSquare, List, BarChart, Search, Edit } from "lucide-react";
import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";

export default function About() {
  return (
    <PublicPageLayout>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1>About <span className="text-gradient-red">RovexAI</span></h1>
        <p>Intelligent document understanding powered by AI</p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <a href="/sign-up" className="btn-primary-small" style={{ textDecoration: 'none' }}>Get Started Free</a>
          <a href="/contact" className="btn-ghost" style={{ textDecoration: 'none' }}>Contact Us</a>
        </div>
      </div>

      <div style={{ marginBottom: "3rem" }}>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--brand-red)' }}>RovexAI</span> is an advanced AI‑powered document intelligence platform designed
          to transform how users interact with PDFs. Instead of manually reading,
          searching, or extracting information, <span style={{ fontWeight: 700, color: 'var(--brand-red)' }}>RovexAI</span> allows users to chat with
          documents, generate summaries, and uncover insights instantly.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          Built for students, professionals, researchers, and businesses, <span style={{ fontWeight: 700, color: 'var(--brand-red)' }}>RovexAI</span> helps
          you analyze research papers, legal documents, invoices, reports,
          and study material — faster and smarter.
        </p>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <AnimatedCard
          icon={<FileText size={24} color="var(--brand-red)" />}
          title="Upload & Analyze"
          description="Upload PDFs of any size and extract insights instantly without reading the whole file."
          delay={0.1}
        />
        <AnimatedCard
          icon={<MessageSquare size={24} color="var(--brand-red)" />}
          title="Ask Questions"
          description="Ask natural-language questions and get accurate, context-aware answers."
          delay={0.2}
        />
        <AnimatedCard
          icon={<List size={24} color="var(--brand-red)" />}
          title="Smart Summaries"
          description="Generate concise, readable summaries from 100+ page long documents."
          delay={0.3}
        />
        <AnimatedCard
          icon={<BarChart size={24} color="var(--brand-red)" />}
          title="Data Extraction"
          description="Extract complex tables, structured data, and key numerical points."
          delay={0.4}
        />
        <AnimatedCard
          icon={<Search size={24} color="var(--brand-red)" />}
          title="OCR & Charts"
          description="Understand charts, poor-quality images, and scanned PDFs easily."
          delay={0.5}
        />
        <AnimatedCard
          icon={<Edit size={24} color="var(--brand-red)" />}
          title="Create Notes"
          description="Create comprehensive study notes, question papers, and interactive flashcards."
          delay={0.6}
        />
      </section>

      <div style={{ textAlign: "center", paddingTop: "2rem", borderTop: "1px solid var(--border-light)" }}>
        <h2>🎯 Our <span style={{ color: 'var(--brand-red)' }}>Vision</span></h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 1rem' }}>
          Our mission is to make knowledge accessible, searchable, and actionable.
          Documents should empower people — not slow them down.
        </p>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ fontWeight: 700, color: 'var(--brand-red)' }}>RovexAI</span> bridges the gap between static files and intelligent
          understanding, helping users unlock the true value hidden inside their
          documents.
        </p>
      </div>
    </PublicPageLayout>
  );
}