import { Shield, Lock, Database, Trash2 } from "lucide-react";
import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";

export default function PrivacyPolicy() {
  return (
    <PublicPageLayout>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: '3rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
          Privacy <span className="text-gradient-red">Policy</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Your data is strictly yours. We do not use private documents to train public AI models.
        </p>
      </div>

      <div style={{ marginBottom: "4rem", color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <p style={{ marginBottom: '1.5rem' }}>
          This Privacy Policy explains how RovexAI collects, uses, and safeguards your personal information and documents when you use our platform. By utilizing RovexAI, you consent to the practices described below.
        </p>
        <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>Data Encryption & Security</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          All documents uploaded to RovexAI are encrypted both in transit (TLS 1.3) and at rest (AES-256). We utilize isolated cloud storage buckets to ensure your files are completely inaccessible to anyone other than your authenticated account.
        </p>
        <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>Third-Party AI Models</h3>
        <p>
          RovexAI leverages enterprise-grade AI APIs (such as OpenAI and Anthropic) to run our contextual processing. We have strict data processing agreements in place which guarantee that zero data sent from RovexAI is retained or used to train their foundational models.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <AnimatedCard
          icon={<Shield size={22} />}
          title="Account Data"
          description="We collect basic account information via Clerk authentication. You can revoke access at any time."
          delay={0.1}
        />
        <AnimatedCard
          icon={<Lock size={22} />}
          title="Zero Training Data"
          description="Unlike public chatbots, your private PDFs and chats are never used as training data."
          delay={0.2}
        />
        <AnimatedCard
          icon={<Database size={22} />}
          title="Cloud Vault"
          description="Files are securely processed in memory and encrypted when stored in your private vault."
          delay={0.3}
        />
        <AnimatedCard
          icon={<Trash2 size={22} />}
          title="Right to Delete"
          description="You maintain full control. Delete your account and all associated documents permanently instantly."
          delay={0.4}
        />
      </div>

      <div style={{ textAlign: "center", paddingTop: "3rem", borderTop: "1px solid var(--border-light)" }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          For inquiries regarding data compliance or GDPR, please contact our Data Protection team.
        </p>
      </div>
    </PublicPageLayout>
  );
}