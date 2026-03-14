// src/pages/SignUpPage.jsx
import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Sparkles, Check } from "lucide-react";
import { dark } from '@clerk/themes';
import { useTheme } from "../context/ThemeContext";
import AnimatedSection from "../components/animated/AnimatedSection";
import FloatingCard from "../components/animated/FloatingCard";
import logoIcon from "../assets/logo.svg";
import "../styles/auth-page.css";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const features = [
    "Unlimited PDF uploads",
    "Advanced AI chat & analysis",
    "Export & share conversations",
    "OCR & data extraction",
    "24/7 support & updates",
    "100% secure & private",
  ];

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* LEFT – Hero */}
        <section className="auth-hero">
          <AnimatedSection>
            <div className="auth-logo" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI" style={{ width: 44, height: 44 }} />
              <span className="auth-logo-text">
                <span style={{ color: "var(--accent)" }}>Rovex</span>AI
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className="auth-title">
              Join the{" "}
              <span className="auth-title-accent">RovexAI community</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <p className="auth-description">
              Create your free account and start experiencing the future of
              PDF interaction. No credit card required.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="auth-features">
              {features.map((text) => (
                <div key={text} className="auth-feature-item">
                  <Check size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <div className="auth-floats">
            <FloatingCard icon={<Shield size={16} />} label="Secure" delay={0.5} />
            <FloatingCard icon={<Sparkles size={16} />} label="AI Powered" delay={0.7} />
          </div>
        </section>

        {/* RIGHT – Clerk SignUp */}
        <section className="auth-form-section">
          <motion.div
            className="auth-form-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="auth-form-header">
              <h2>
                Create{" "}
                <span style={{ color: "var(--accent)" }}>Account</span>
              </h2>
              <p>Join users leveraging AI for PDF intelligence</p>
            </div>

            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/login"
              afterSignUpUrl="/dashboard"
              afterSignInUrl="/dashboard"
              appearance={{
                baseTheme: theme === 'dark' ? dark : undefined,
                variables: {
                  colorPrimary: '#dc2626',
                  colorBackground: 'transparent',
                  colorInputBackground: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                  colorInputText: theme === 'dark' ? '#fff' : '#000',
                  colorText: theme === 'dark' ? '#f9fafb' : '#111111',
                },
                elements: {
                  rootBox: { background: "transparent" },
                  card: {
                    borderRadius: "14px",
                    boxShadow: "none",
                    background: "transparent",
                  },
                  footerActionText: { color: theme === 'dark' ? '#a1a1aa' : '#52525b' },
                  footerActionLink: { color: '#dc2626' },
                  formButtonPrimary: { background: 'linear-gradient(135deg, #dc2626, #ef4444)' },
                },
              }}
            />

            <div className="auth-security-badge">
              <span>🔒</span>
              <span>256-bit encryption · Accounts protected with Clerk</span>
            </div>
          </motion.div>
        </section>
      </div>

      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
    </div>
  );
}