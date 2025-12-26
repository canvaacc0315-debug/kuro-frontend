import PublicPageLayout from "../components/layout/PublicPageLayout";
import "../styles/public-pages.css";

export default function PrivacyPolicy() {
  return (
    <PublicPageLayout>
      {/* HERO */}
      <section className="public-hero">
        <h1>Privacy Policy</h1>
        <p className="public-hero-subtitle">
          Your privacy is important to us. Transparency is our priority.
        </p>
      </section>

      {/* INTRO */}
      <div className="public-card">
        <p>
          This Privacy Policy explains how RovexAI collects, uses, and protects
          your information when you use our website and services.
        </p>
      </div>

      {/* SECTIONS */}
      <div className="public-card">
        <h2>Information We Collect</h2>
        <p>
          RovexAI does not collect personal information unless it is required to
          provide our services. Authentication and account management are handled
          securely by trusted third‑party providers.
        </p>
        <p>
          Uploaded documents are processed only to deliver AI‑powered features
          and are never shared with third parties.
        </p>
      </div>

      <div className="public-card">
        <h2>Advertising & Cookies</h2>
        <p>
          RovexAI uses Google AdSense to display advertisements. Google may use
          cookies or similar technologies to personalize ads based on your visits
          to this and other websites.
        </p>
        <p>
          You can opt out of personalized advertising through Google’s Ads
          Settings.
        </p>
      </div>

      <div className="public-card">
        <h2>How We Use Your Information</h2>
        <p>
          Information collected is used solely to operate, maintain, and improve
          our services. We do not sell, rent, or trade user data to third parties.
        </p>
      </div>

      <div className="public-card">
        <h2>Security</h2>
        <p>
          We use industry‑standard security measures to protect user data. All
          communications are encrypted wherever possible.
        </p>
      </div>

      <div className="public-card">
        <h2>Third‑Party Services</h2>
        <p>
          RovexAI may contain links to third‑party websites or services. We are
          not responsible for their privacy practices or content.
        </p>
      </div>

      <div className="public-card vision-card">
        <h2>Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, reach
          out to us at:
        </p>
        <p style={{ color: "#ff5a5a", fontWeight: 600 }}>
          support@rovexai.com
        </p>
      </div>
    </PublicPageLayout>
  );
}