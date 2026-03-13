import PublicPageLayout from "../components/layout/PublicPageLayout";
import AnimatedSection from "../components/animated/AnimatedSection";
import { Shield, Cookie, Database, Lock, ExternalLink, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <Database size={20} />,
      title: "Information We Collect",
      content: [
        "RovexAI does not collect personal information unless it is required to provide our services. Authentication and account management are handled securely by trusted third‑party providers.",
        "Uploaded documents are processed only to deliver AI‑powered features and are never shared with third parties.",
      ],
    },
    {
      icon: <Cookie size={20} />,
      title: "Advertising & Cookies",
      content: [
        "RovexAI uses Google AdSense to display advertisements. Google may use cookies or similar technologies to personalize ads based on your visits to this and other websites.",
        "You can opt out of personalized advertising through Google's Ads Settings.",
      ],
    },
    {
      icon: <Shield size={20} />,
      title: "How We Use Your Information",
      content: [
        "Information collected is used solely to operate, maintain, and improve our services. We do not sell, rent, or trade user data to third parties.",
      ],
    },
    {
      icon: <Lock size={20} />,
      title: "Security",
      content: [
        "We use industry‑standard security measures to protect user data. All communications are encrypted wherever possible.",
      ],
    },
    {
      icon: <ExternalLink size={20} />,
      title: "Third‑Party Services",
      content: [
        "RovexAI may contain links to third‑party websites or services. We are not responsible for their privacy practices or content.",
      ],
    },
  ];

  return (
    <PublicPageLayout>
      <AnimatedSection>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.8rem", color: "var(--text-primary)" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Your privacy is important to us. Transparency is our priority.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-card)",
          padding: "2rem",
          marginBottom: "2rem",
          color: "var(--text-secondary)",
          lineHeight: 1.8,
        }}>
          This Privacy Policy explains how RovexAI collects, uses, and protects
          your information when you use our website and services.
        </div>
      </AnimatedSection>

      {sections.map((s, i) => (
        <AnimatedSection key={i} delay={0.1 + i * 0.05}>
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-card)",
            padding: "2rem",
            marginBottom: "1.2rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.8rem" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "var(--radius-sm)",
                background: "var(--accent-subtle)", display: "flex",
                alignItems: "center", justifyContent: "center", color: "var(--accent)",
              }}>
                {s.icon}
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.title}</h2>
            </div>
            {s.content.map((p, j) => (
              <p key={j} style={{ color: "var(--text-secondary)", lineHeight: 1.8, margin: j < s.content.length - 1 ? "0 0 0.8rem" : 0 }}>
                {p}
              </p>
            ))}
          </div>
        </AnimatedSection>
      ))}

      <AnimatedSection delay={0.3}>
        <div style={{
          background: "var(--accent-gradient)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          color: "#fff",
          textAlign: "center",
          marginTop: "1rem",
        }}>
          <Mail size={24} style={{ marginBottom: "0.5rem" }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>Contact Us</h2>
          <p style={{ opacity: 0.9, marginBottom: "0.5rem" }}>
            If you have any questions about this Privacy Policy, reach out at:
          </p>
          <p style={{ fontWeight: 700 }}>RovexAi.HelpDesk2025@gmail.com</p>
        </div>
      </AnimatedSection>
    </PublicPageLayout>
  );
}