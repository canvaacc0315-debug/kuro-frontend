import { useEffect, useMemo, useState } from "react";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import "../styles/kuro.css";
import "../styles/no-scrollbar-override.css";


export default function KuroLandingPage() {
  const { isLoaded, signIn } = useSignIn();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [code, setCode] = useState("");
  const [step, setStep] = useState("email"); // "email" | "code"

  // If already signed in, don't show login – just go to dashboard
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoaded, isSignedIn, navigate]);

  function extractErrorMessage(err) {
    const anyErr = err;
    const msg =
      anyErr?.errors?.[0]?.message ||
      anyErr?.message ||
      "Something went wrong";
    const code = anyErr?.errors?.[0]?.code;
    return { msg, code };
  }

  // GOOGLE LOGIN
  async function handleGoogle(e) {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Google auth error", err);
      const { msg, code } = extractErrorMessage(err);

      if (code === "session_exists") {
        // already logged in → go to dashboard
        navigate("/dashboard", { replace: true });
        return;
      }

      alert(msg || "Google sign-in failed. Check console for details.");
    }
  }

  // STEP 1: SEND EMAIL CODE
  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!isLoaded || !email) return;

    try {
      setSending(true);

      await signIn.create({
        strategy: "email_code",
        identifier: email,
      });

      setSent(true);
      setStep("code");
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error("Email code error", err);
      const { msg, code } = extractErrorMessage(err);

      if (code === "session_exists") {
        // user already has an active session
        navigate("/dashboard", { replace: true });
        return;
      }

      alert(msg || "Could not send code");
    } finally {
      setSending(false);
    }
  }

  // STEP 2: VERIFY CODE
  async function handleCodeSubmit(e) {
    e.preventDefault();
    if (!isLoaded || !code) return;

    try {
      setSending(true);

      const res = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      console.log("Code verify response:", res);

      if (res.status === "complete") {
        navigate("/dashboard", { replace: true });
      } else {
        alert("Verification not complete. Check console.");
      }
    } catch (err) {
      console.error("Code verify error", err);
      const { msg } = extractErrorMessage(err);
      alert(msg || "Invalid code");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="kuro-page">
      <div className="kuro-container">
        {/* LEFT: hero */}
        <div className="landing-brand">
          <KuroLogo size={40} />
        </div>


          <h1 className="hero-title">Chat with Your PDFs Instantly</h1>

          <p className="hero-description">
            RovexAI is an intelligent PDF chatbot that understands your
            documents, answers questions, and extracts insights in seconds.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <div className="feature-title">Smart Q&amp;A</div>
              <div className="feature-desc">
                Ask questions about your PDF content and get instant answers.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-title">Data Extraction</div>
              <div className="feature-desc">
                Extract tables, charts, and structured data automatically.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">Summarization</div>
              <div className="feature-desc">
                Get concise summaries of lengthy documents in seconds.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <div className="feature-title">OCR &amp; Vision</div>
              <div className="feature-desc">
                Understand scanned documents and complex layouts.
              </div>
            </div>
            </div>
        {/* RIGHT: auth form */}
        <div className="auth-section">
          <div className="auth-header">
            <h2 className="auth-title">SIGN IN</h2>
            <p className="auth-subtitle">
              Join the elite PDF intelligence community
            </p>
          </div>

          <form
            onSubmit={step === "email" ? handleEmailSubmit : handleCodeSubmit}
          >
            <div className="btn-container">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGoogle}
                disabled={!isLoaded}
              >
                <span className="google-icon-circle">G</span>
                Continue with Google
              </button>
            </div>

            <div className="divider-container">
              <div className="divider-line" />
              <div className="divider-text">or</div>
              <div className="divider-line" />
            </div>

            {step === "email" && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="emailInput">
                    Email Address
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="btn-container">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isLoaded || sending}
                  >
                    {sending
                      ? "Sending..."
                      : sent
                      ? "✅ Code sent! Check your email"
                      : "📨 Send Code"}
                  </button>
                </div>
              </>
            )}

            {step === "code" && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="codeInput">
                    Enter 6‑digit code
                  </label>
                  <input
                    id="codeInput"
                    type="text"
                    className="form-input"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                <div className="btn-container">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isLoaded || sending}
                  >
                    {sending ? "Verifying..." : "✅ Verify & Continue"}
                  </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setStep("email");
                        setCode("");
                      }}
                    >
                      ← Change email
                    </button>
                </div>
              </>
            )}

            <div className="security-badge">
              Secure authentication by Clerk &amp; OAuth
            </div>

            <div className="auth-link">
              Don&apos;t have an account?{" "}
              <a href="#signup">Sign up instantly</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}