import { Shield, Lock, Eye, Database, Globe, Share2 } from "lucide-react";
import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";

export default function PrivacyPolicy() {
  return (
    <PublicPageLayout>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1>Privacy <span className="text-gradient-red">Policy</span></h1>
        <p>Your trust is our top priority. Here's how we protect your data.</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div style={{ marginBottom: "3rem", fontSize: '1.05rem', lineHeight: 1.6 }}>
        <p>
          At <span style={{ fontWeight: 700, color: 'var(--brand-red)' }}>RovexAI</span>, we take your privacy seriously. This Privacy Policy
          explains how we collect, use, and safeguard your personal information and
          documents when you use our platform.
        </p>
        <p>
          By accessing or using <span style={{ fontWeight: 700, color: 'var(--brand-red)' }}>RovexAI</span>, you agree to the terms described in this
          policy.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <AnimatedCard
          icon={<Shield size={24} color="var(--brand-red)" />}
          title="1. Information We Collect"
          description="We collect basic account information (name, email) via Clerk authentication and the PDF files you choose to upload."
          delay={0.1}
        />
        <AnimatedCard
          icon={<Lock size={24} color="var(--brand-red)" />}
          title="2. Document Security"
          description="Your PDFs are encrypted at rest and in transit. We do not use your private documents to train public AI models."
          delay={0.2}
        />
        <AnimatedCard
          icon={<Database size={24} color="var(--brand-red)" />}
          title="3. How We Use Data"
          description="We only process your documents to provide you with the AI services you request (chat, analysis, summaries)."
          delay={0.3}
        />
        <AnimatedCard
          icon={<Share2 size={24} color="var(--brand-red)" />}
          title="4. Data Sharing"
          description="We never sell your data. We only share data with essential infrastructure providers (like secure LLM APIs) to process your requests."
          delay={0.4}
        />
        <AnimatedCard
          icon={<Globe size={24} color="var(--brand-red)" />}
          title="5. Third-Party Services"
          description="RovexAI utilizes third-party authentication and cloud hosting to maintain secure and stable operations."
          delay={0.5}
        />
        <AnimatedCard
          icon={<Eye size={24} color="var(--brand-red)" />}
          title="6. Your Rights"
          description="You can delete your account and all associated documents permanently at any time from your settings panel."
          delay={0.6}
        />
      </div>

      <div style={{ textAlign: "center", paddingTop: "2rem", borderTop: "1px solid var(--border-light)" }}>
        <h2>Questions about <span style={{ color: 'var(--brand-red)' }}>Privacy?</span></h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 1rem' }}>
          If you have any questions or concerns about this Privacy Policy, please
          contact our Data Protection Officer.
        </p>
        <a href="/contact" className="btn-primary-small" style={{ textDecoration: 'none', display: 'inline-block' }}>Contact Support</a>
      </div>
    </PublicPageLayout>
  );
}