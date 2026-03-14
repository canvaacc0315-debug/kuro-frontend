// src/pages/SignUpPage.jsx
import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedSection from "../components/animated/AnimatedSection";
import logoIcon from "../assets/logo.svg";
import "../styles/auth-page.css";

export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* TOP – Hero/Logo */}
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
              Create an account
            </h1>
            <p className="auth-description">
              Join the RovexAI community today
            </p>
          </AnimatedSection>
        </section>

        {/* BOTTOM – Clerk SignUp */}
        <section className="auth-form-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/login"
              afterSignUpUrl="/dashboard"
              afterSignInUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: '#e11d48',
                },
                elements: {
                  formButtonPrimary: { background: 'var(--accent)' },
                  card: {
                    width: '100%',
                    maxWidth: '100%',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    borderRadius: '16px',
                  }
                },
              }}
            />
          </motion.div>
        </section>
      </div>

      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
    </div>
  );
}