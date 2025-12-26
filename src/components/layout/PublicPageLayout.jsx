import { Link } from "react-router-dom";
import Footer from "./Footer";

/* 🔥 HIGH-IMPACT ANIMATION */
const bgAnimation = `
@keyframes bgCrazy {
  0% {
    background-size: 100%;
    background-position: 50% 50%;
  }
  25% {
    background-size: 120%;
    background-position: 60% 40%;
  }
  50% {
    background-size: 130%;
    background-position: 40% 60%;
  }
  75% {
    background-size: 120%;
    background-position: 55% 45%;
  }
  100% {
    background-size: 100%;
    background-position: 50% 50%;
  }
}
`;

export default function PublicPageLayout({ children }) {
  return (
    <>
      <style>{bgAnimation}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundImage: "url('/public-bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "100%",
          animation: "bgCrazy 18s ease-in-out infinite",

          color: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "18px 28px",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textDecoration: "none",
              color: "#fff",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            <img src="/kuro.png" alt="RovexAI" style={{ height: "30px" }} />
            <span>RovexAI</span>
          </Link>
        </header>

        {/* CONTENT */}
        <main
          style={{
            maxWidth: "900px",
            margin: "60px auto",
            padding: "32px",
            flex: 1,
            background: "rgba(0,0,0,0.35)",
            borderRadius: "14px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
          }}
        >
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}