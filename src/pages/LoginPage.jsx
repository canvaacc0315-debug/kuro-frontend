// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { useUser, SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import KuroLogo from "../components/layout/KuroLogo.jsx";
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
    <div className="login-page">
      <div className="login-container">

        {/* LEFT – Hero / marketing */}
        <section className="login-hero-section">
          <div className="login-hero-content">

            {/* ✅ FIXED LOGO ROW */}
            <div
              className="login-hero-logo"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <KuroLogo size={60} />
              <div className="login-logo-text">RovexAI</div>
            </div>

            <h1 className="login-hero-title">
              Chat with your PDFs{" "}
              <span className="login-hero-title-accent">like never before</span>
            </h1>

            <p className="login-hero-description">
              RovexAI is your intelligent PDF companion. Upload documents, ask
              questions, generate summaries, extract data, and unlock insights
              in seconds.
            </p>

            <div className="login-hero-features">
              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  Instant Q&amp;A from any PDF
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  AI‑powered summarization
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  Smart data extraction
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  Chart &amp; image understanding
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  Question paper generation
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  Screenshot OCR support
                </div>
              </div>
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
            />

            <div className="login-security-badge">
              <span className="login-security-icon">🔒</span>
              <span>Accounts protected with Clerk &amp; OAuth</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}