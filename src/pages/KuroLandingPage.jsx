import { useEffect, useState } from "react";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, FileJson, Zap, Search } from "lucide-react";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import AnimatedHero from "../components/animations/AnimatedHero.jsx";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";
import PublicPageLayout from "../components/layout/PublicPageLayout.jsx";

// Import our new theme and landing css
import "../styles/theme-red.css";
import "./KuroLandingPage.css";

export default function KuroLandingPage() {
  const { isLoaded, signIn } = useSignIn();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoaded, isSignedIn, navigate]);

  function extractErrorMessage(err) {
    const msg = err?.errors?.[0]?.message || err?.message || "Something went wrong";
    const code = err?.errors?.[0]?.code;
    return { msg, code };
  }

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
        navigate("/dashboard", { replace: true });
        return;
      }
      alert(msg || "Google sign-in failed.");
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!isLoaded || !email) return;
    try {
      setSending(true);
      await signIn.create({ strategy: "email_code", identifier: email });
      setSent(true);
      setStep("code");
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error("Email code error", err);
      const { msg, code } = extractErrorMessage(err);
      if (code === "session_exists") {
        navigate("/dashboard", { replace: true });
        return;
      }
      alert(msg || "Could not send code");
    } finally {
      setSending(false);
    }
  }

  async function handleCodeSubmit(e) {
    e.preventDefault();
    if (!isLoaded || !code) return;
    try {
      setSending(true);
      const res = await signIn.attemptFirstFactor({ strategy: "email_code", code });
      if (res.status === "complete") {
        navigate("/dashboard", { replace: true });
      } else {
        alert("Verification not complete.");
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
    <div className="premium-landing-root">
      {/* Vercel-style floating navigation */}
      <header className="premium-nav">
        <div className="nav-container">
          <div className="logo-container">
            <KuroLogo size={28} />
            <span className="logo-text" style={{ fontSize: '1.25rem' }}>
              <span style={{ color: "var(--brand-red)" }}>Rovex</span>
              <span style={{ color: "var(--text-primary)" }}>AI</span>
            </span>
          </div>
          <div className="nav-links desktop-only">
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/privacy-policy">Privacy</a>
          </div>
          <div className="nav-auth">
            <button className="btn-ghost-sleek" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn-primary-sleek" onClick={() => navigate('/sign-up')}>Sign up</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <AnimatedHero
        badges={["RovexAI v2.0 Is Live", "Military-Grade Security"]}
        title={<>Chat with Your PDFs <br /><span className="text-gradient-red">Instantly</span></>}
        subtitle="The intelligent document processor that understands context, extracts structured data, and answers complex questions in seconds."
      >

        {/* The Sleek Central Auth Form */}
        <div className="hero-auth-container">
          <div className="glowing-border-wrap">
            <div className="glowing-border-inner premium-auth-form">
              <h3>Start For Free</h3>

              <form onSubmit={step === "email" ? handleEmailSubmit : handleCodeSubmit}>
                <button type="button" className="btn-provider" onClick={handleGoogle} disabled={!isLoaded}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="provider-icon" />
                  Continue with Google
                </button>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                {step === "email" ? (
                  <div className="form-group stack">
                    <input
                      type="email"
                      className="premium-input"
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary-sleek full" disabled={!isLoaded || sending}>
                      {sending ? "Sending..." : sent ? "✅ Sent!" : "Continue with Email"}
                    </button>
                  </div>
                ) : (
                  <div className="form-group stack">
                    <input
                      type="text"
                      className="premium-input text-center"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      required
                    />
                    <button type="submit" className="btn-primary-sleek full" disabled={!isLoaded || sending}>
                      {sending ? "Verifying..." : "Verify & Sign In"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

      </AnimatedHero>

      {/* Premium Dark Bento Grid section */}
      <section className="premium-features-section">
        <div className="features-header">
          <h2>Everything you need for <span className="text-gradient-red">Intelligence</span></h2>
          <p>Stop reading generic words. Start conversing with your research.</p>
        </div>

        <div className="bento-grid-landing">
          <AnimatedCard
            delay={0.1}
            icon={<MessageSquare size={24} />}
            title="Semantic Search"
            description="Our advanced pipeline understands context, not just keywords. Find exactly what you need instantly."
          />
          <AnimatedCard
            delay={0.2}
            icon={<FileJson size={24} />}
            title="Extraction"
            description="Parse out complex financial tables or legal clauses into clean, machine-readable JSON."
          />
          <AnimatedCard
            delay={0.3}
            icon={<Zap size={24} />}
            title="Summation"
            description="TL;DR for 100-page reports. Get key takeaways customized to the length you desire."
          />
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} RovexAI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}