// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { useUser, SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import Footer from "../components/layout/Footer"; // ✅ ADDED
import "../styles/login-landing.css";

export default function LoginPage() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSignedIn, navigate]);

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
                Chat with your PDFs{" "}
                <span className="login-hero-title-accent">
                  like never before
                </span>
              </h1>

              <p className="login-hero-description">
                RovexAI is your intelligent PDF companion. Upload documents, ask
                questions, generate summaries, extract data, and unlock insights
                in seconds.
              </p>

              <div className="login-hero-features">
                {[
                  "Instant Q&A from any PDF",
                  "AI‑powered summarization",
                  "Smart data extraction",
                  "Chart & image understanding",
                  "Question paper generation",
                  "Screenshot OCR support",
                ].map((text) => (
                  <div key={text} className="login-feature-item">
                    <div className="login-feature-icon">✓</div>
                    <div className="login-feature-text">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT – Clerk SignIn */}
          <section className="login-auth-section">
            <div className="login-auth-container">
              <div className="login-auth-header">
                <h2 className="login-auth-title">
                  Sign In to{" "}
                  <span className="login-auth-title-accent">RovexAI</span>
                </h2>

                <p className="login-auth-subtitle">
                  Welcome back! Please sign in to continue
                </p>

                <div className="login-last-used">
                  Secure authentication by Clerk
                </div>
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
                      boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
                    },
                  },
                }}
              />

              <div className="login-security-badge">
                <span className="login-security-icon">🔒</span>
                <span>Accounts protected with Clerk &amp; OAuth</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ✅ FOOTER ADDED */}
      <Footer />
    </div>
  );
}