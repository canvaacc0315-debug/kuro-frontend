import { FileText, Cpu, Eye, Infinity } from "lucide-react";
import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";

export default function About() {
  return (
    <PublicPageLayout>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: '3rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
          Our <span className="text-gradient-red">Mission</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          RovexAI is building the infrastructure to transform static documents into intelligent, interactive knowledge bases.
        </p>
      </div>

      <div style={{ marginBottom: "4rem" }}>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          At <span style={{ fontWeight: 600, color: 'var(--text-inverse-secondary)' }}>RovexAI</span>, we believe that human potential shouldn't be bottlenecked by how fast we can read.
          We developed a platform designed to instantly unlock the value hidden inside massive PDFs, scanned reports, and complex datasets.
        </p>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Instead of manually searching for keywords, our users can simply ask questions and let our advanced Retrieval-Augmented Generation (RAG) models do the absolute heavy lifting—fast, accurately, and securely.
        </p>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600, textAlign: 'center' }}>Technological Pillars</h2>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <AnimatedCard
          icon={<Cpu size={22} />}
          title="Contextual ML"
          description="We use sophisticated embedding models to understand the semantic meaning of your documents, not just raw text."
          delay={0.1}
        />
        <AnimatedCard
          icon={<FileText size={22} />}
          title="Structured Output"
          description="Extract clean JSON or tabular data from completely unstructured and messy PDFs."
          delay={0.2}
        />
        <AnimatedCard
          icon={<Eye size={22} />}
          title="Visual OCR"
          description="Our computer vision pipelines seamlessly comprehend terrible scans and complex academic charts."
          delay={0.3}
        />
        <AnimatedCard
          icon={<Infinity size={22} />}
          title="Scale"
          description="Process single pages or entire libraries of research papers simultaneously without dropping context."
          delay={0.4}
        />
      </section>

      <div style={{ textAlign: "center", paddingTop: "3rem", borderTop: "1px solid var(--border-light)" }}>
        <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Join thousands of researchers, lawyers, and students accelerating their workflows today.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a href="/sign-up" className="btn-primary-sleek" style={{ textDecoration: 'none' }}>Get Started Free</a>
        </div>
      </div>
    </PublicPageLayout>
  );
}