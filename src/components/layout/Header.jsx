import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",

        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",

        zIndex: 50,
      }}
    >
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#fff",
          fontWeight: 600,
          textDecoration: "none",
          fontSize: "18px",
        }}
      >
        <span style={{ color: "#ff5a5a", fontWeight: 800 }}>R</span>
        RovexAI
      </Link>
    </header>
  );
}