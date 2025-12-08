// src/pages/SignUpPage.jsx
import { SignUp } from "@clerk/clerk-react";
import "../styles/login-landing.css";
import KuroLogo from "../components/layout/KuroLogo.jsx"; // ✅ ADD THIS

export default function SignUpPage() {
  return (
    <div className="login-page">
      <div className="login-container">
        {/* LEFT – Hero / marketing (sign‑up flavor) */}
        <section className="login-hero-section">
          <div className="login-hero-content">
            <div className="login-hero-logo">
              {/* ✅ REAL LOGO IMAGE */}
              <KuroLogo size={60} />

              {/* ✅ TEXT NEXT TO LOGO */}
              <div className="login-logo-text">RovexAI</div>
            </div>

            <h1 className="login-hero-title">
              Join the{" "}
              <span className="login-hero-title-accent">RovexAI community</span>
            </h1>

            <p className="login-hero-description">
              Create your free account and start experiencing the future of PDF
              interaction. No credit card required.
            </p>

            <div className="login-hero-features">
              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">Unlimited PDF uploads</div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  Advanced AI chat &amp; analysis
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  Export &amp; share conversations
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">OCR &amp; data extraction</div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  24/7 support &amp; updates
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">
                  100% secure &amp; private
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT – Clerk SignUp directly, no black card */}
        <section className="login-auth-section">
          <div className="login-auth-container">
            <div className="login-auth-header">
              <h2 className="login-auth-title">
                Create <span className="login-auth-title-accent">Account</span>
              </h2>
              <p className="login-auth-subtitle">
                Join thousands of users leveraging AI for PDF intelligence
              </p>
            </div>

            {/* Clerk card */}
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/login"
              afterSignUpUrl="/dashboard"
              afterSignInUrl="/dashboard"
            />

            <div className="login-security-badge">
              <span className="login-security-icon">🔒</span>
              <span>256-bit encryption · Accounts protected with Clerk</span>
            </div>

            <div className="login-clerk-badge">
              Secured by Clerk{" "}
              <span className="login-dev-mode">Development mode</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}