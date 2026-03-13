// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { useUser, SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, Check } from "lucide-react";
import AnimatedSection from "../components/animated/AnimatedSection";
import FloatingCard from "../components/animated/FloatingCard";
import logoIcon from "../assets/logo.svg";
import "../styles/auth-page.css";

export default function LoginPage() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) navigate("/dashboard", { replace: true });
  }, [isSignedIn, navigate]);

  const features = [
    "Instant Q&A from any PDF",
    "AI‑powered summarization",
    "Smart data extraction",
    "Chart & image understanding",
    "Question paper generation",
    "Screenshot OCR support",
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
              Chat with your PDFs{" "}
              <span className="auth-title-accent">like never before</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <p className="auth-description">
              RovexAI is your intelligent PDF companion. Upload documents, ask
              questions, generate summaries, extract data, and unlock insights
              in seconds.
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

          {/* Floating cards */}
          <div className="auth-floats">
            <FloatingCard icon={<Shield size={16} />} label="Secure" delay={0.5} />
            <FloatingCard icon={<Zap size={16} />} label="Fast" delay={0.7} />
          </div>
        </section>

        {/* RIGHT – Clerk SignIn */}
        <section className="auth-form-section">
          <motion.div
            className="auth-form-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="auth-form-header">
              <h2>
                Sign In to{" "}
                <span style={{ color: "var(--accent)" }}>RovexAI</span>
              </h2>
              <p>Welcome back! Please sign in to continue</p>
            </div>

            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/sign-up"
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: { background: "transparent" },
                  card: {
                    borderRadius: "14px",
                    boxShadow: "none",
                    background: "transparent",
                  },
                },
              }}
            />

            <div className="auth-security-badge">
              <span>🔒</span>
              <span>Accounts protected with Clerk & OAuth</span>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
    </div>
  );
}