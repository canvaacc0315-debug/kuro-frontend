// src/pages/SignUpPage.jsx
import { SignUp } from "@clerk/clerk-react";
import "../styles/login-landing.css";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import Footer from "../components/layout/Footer"; // ✅ ADDED
import "../styles/no-scrollbar-override.css";


export default function SignUpPage() {
  return (
    /* ✅ Wrapper for footer */
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* EXISTING PAGE (UNCHANGED) */}
      <div
        className="login-page"
        style={{
          background: "transparent",
          flex: 1,
        }}
      >
        <div
          className="login-container"
          style={{
            background: "transparent",
          }}
        >
          {/* LEFT – Hero */}
          <section className="login-hero-section">
            <div className="login-hero-content">
              <div
                className="login-hero-logo"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <KuroLogo size={60} />
                <div className="login-logo-text">RovexAI</div>
              </div>

              <h1 className="login-hero-title">
                Join the{" "}
                <span className="login-hero-title-accent">
                  RovexAI community
                </span>
              </h1>

              <p className="login-hero-description">
                Create your free account and start experiencing the future of
                PDF interaction. No credit card required.
              </p>

              <div className="login-hero-features">
                {[
                  "Unlimited PDF uploads",
                  "Advanced AI chat & analysis",
                  "Export & share conversations",
                  "OCR & data extraction",
                  "24/7 support & updates",
                  "100% secure & private",
                ].map((text) => (
                  <div key={text} className="login-feature-item">
                    <div className="login-feature-icon">✓</div>
                    <div className="login-feature-text">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT – Clerk SignUp */}
          <section className="login-auth-section">
            <div className="login-auth-container">
              <div className="login-auth-header">
                <h2 className="login-auth-title">
                  Create{" "}
                  <span className="login-auth-title-accent">Account</span>
                </h2>
                <p className="login-auth-subtitle">
                  Join thousands of users leveraging AI for PDF intelligence
                </p>
              </div>

              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/login"
                afterSignUpUrl="/dashboard"
                afterSignInUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: { background: "transparent" },
                    card: {
                      borderRadius: "14px",
                      boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
                    },
                  },
                }}
              />

              <div className="login-security-badge">
                <span className="login-security-icon">🔒</span>
                <span>256-bit encryption · Accounts protected with Clerk</span>
              </div>

              <div className="login-clerk-badge">Secured by Clerk</div>
            </div>
          </section>
        </div>
      </div>

      {/* ✅ FOOTER ADDED */}
      <Footer />
    </div>
  );
}