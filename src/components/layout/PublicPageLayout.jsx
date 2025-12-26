import { Link } from "react-router-dom";
import Footer from "./Footer";

export default function PublicPageLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
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
            fontWeight: "600",
          }}
        >
          <img src="/kuro.png" alt="RovexAI" style={{ height: "28px" }} />
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
        }}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}