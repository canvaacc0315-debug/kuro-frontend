import { useEffect, useState } from "react";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, FileJson, Zap, Search } from "lucide-react";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import AnimatedHero from "../components/animations/AnimatedHero.jsx";
import AnimatedCard from "../components/animations/AnimatedCard.jsx";

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
  const [step, setStep] = useState("email"); // "email" | "code"

  // If already signed in, don't show login – just go to dashboard
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
        navigate("/dashboard", { replace: true });
        return;
      }
      alert(msg || "Google sign-in failed.");
    }
  }

  // STEP 1: SEND EMAIL CODE
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

  // STEP 2: VERIFY CODE
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
    <div className="landing-page-root">

      {/* Brand Header */}
      <motion.div
        className="landing-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-container">
          <KuroLogo size={36} />
          <span className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            <span style={{ color: "var(--brand-red)" }}>Rovex</span>
            <span style={{ color: "var(--text-primary)" }}>AI</span>
          </span>
        </div>
      </motion.div>

      {/* Main Hero & Auth Split */}
      <div className="landing-main-split">

        {/* LEFT: Animated Hero Info */}
        <div className="landing-hero-side">
          <AnimatedHero
            badges={["🚀 GPT-4 Powered", "🔒 Military-Grade Security"]}
            title={<>Chat with Your PDFs <span className="text-gradient-red">Instantly</span></>}
            subtitle="RovexAI is an intelligent document processor that understands context, extracts structured data, and answers complex questions in seconds."
          >
            <div className="features-simple-grid">
              <motion.div className="feature-pill" whileHover={{ scale: 1.05 }}><MessageSquare size={18} /> Smart Q&amp;A</motion.div>
              <motion.div className="feature-pill" whileHover={{ scale: 1.05 }}><FileJson size={18} /> Data Extraction</motion.div>
              <motion.div className="feature-pill" whileHover={{ scale: 1.05 }}><Zap size={18} /> Instant Summaries</motion.div>
              <motion.div className="feature-pill" whileHover={{ scale: 1.05 }}><Search size={18} /> OCR &amp; Vision</motion.div>
            </div>
          </AnimatedHero>
        </div>

        {/* RIGHT: Glassmorphism Auth Form */}
        <div className="landing-auth-side">
          <motion.div
            className="auth-glass-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Join the elite PDF intelligence community</p>
            </div>

            <form onSubmit={step === "email" ? handleEmailSubmit : handleCodeSubmit}>
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogle}
                disabled={!isLoaded}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="google-icon" />
                Continue with Google
              </button>

              <div className="divider-container">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>

              {step === "email" ? (
                <div className="auth-step-container">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={!isLoaded || sending}>
                    {sending ? "Sending Code..." : sent ? "✅ Check your email" : "Continue with Email"}
                  </button>
                </div>
              ) : (
                <div className="auth-step-container">
                  <div className="form-group">
                    <label>Enter 6-digit code</label>
                    <input
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={!isLoaded || sending}>
                    {sending ? "Verifying..." : "Verify & Sign In"}
                  </button>
                  <button type="button" className="btn-text" onClick={() => { setStep("email"); setCode(""); }}>
                    &larr; Use a different email
                  </button>
                </div>
              )}
            </form>

            <p className="auth-footer-text">Secure authentication by Clerk &amp; OAuth</p>
          </motion.div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="landing-features-section">
        <motion.div
          className="section-header-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Everything you need for <span className="text-gradient-red">Document Intelligence</span></h2>
          <p>Stop reading. Start conversing with your research, contracts, and textbooks.</p>
        </motion.div>

        <div className="landing-cards-grid">
          <AnimatedCard
            delay={0.1}
            icon={<MessageSquare color="var(--brand-red)" size={28} />}
            title="Semantic Search"
            description="Our advanced RAG pipeline understands context, not just keywords. Find exactly what you need instantly."
          />
          <AnimatedCard
            delay={0.2}
            icon={<FileJson color="var(--brand-red)" size={28} />}
            title="Structured Extraction"
            description="Automatically parse out complex financial tables or legal clauses into clean, machine-readable JSON/CSV."
          />
          <AnimatedCard
            delay={0.3}
            icon={<Zap color="var(--brand-red)" size={28} />}
            title="Automated Summaries"
            description="TL;DR for 100-page reports. Get the key takeaways customized to the length and tone you desire."
          />
        </div>
      </div>
    </div>
  );
}