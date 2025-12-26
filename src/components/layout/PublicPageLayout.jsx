import { Link } from "react-router-dom";
import Footer from "./Footer";

export default function PublicPageLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0b0b0f, #000)",
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
          borderBottom: "1px solid #222",
        }}
      >
        {/* LOGO → BACK TO MAIN PAGE */}
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#fff",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          <img
            src="/logo.png"
            alt="RovexAI"
            style={{ height: "28px" }}
          />
          RovexAI
        </Link>
      </header>

      {/* 📄 PAGE CONTENT */}
      <main
        style={{
          maxWidth: "900px",
          margin: "60px auto",
          padding: "0 24px",
          flex: 1,
        }}
      >
        {children}
      </main>

      {/* 🔻 FOOTER */}
      <Footer />
    </div>
  );
}