import { Link } from "react-router-dom";
import Footer from "./Footer";

export default function PublicPageLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",

        /* 🖼️ BACKGROUND IMAGE — NO OVERLAY */
        backgroundImage: "url('/public-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔝 HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 28px",
          background:
            "linear-gradient(180deg, rgba(15,15,20,0.85), rgba(10,10,15,0.6))",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
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
            fontWeight: "600",
          }}
        >
          <img
            src="/kuro.png"
            alt="RovexAI"
            style={{ height: "28px", display: "block" }}
          />
          <span>RovexAI</span>
        </Link>
      </header>

      {/* 📄 PAGE CONTENT */}
      <main
        style={{
          maxWidth: "900px",
          margin: "60px auto",
          padding: "32px",
          flex: 1,

          /* light glass so bg is still visible */
          background: "rgba(0,0,0,0.25)",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </main>

      {/* 🔻 FOOTER */}
      <Footer />
    </div>
  );
}