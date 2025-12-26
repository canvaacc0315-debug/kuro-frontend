import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "16px 0",
        textAlign: "center",
        fontSize: "13px",
        color: "#aaa",
        borderTop: "1px solid #222",
        marginTop: "40px",
      }}
    >
      © 2025 RovexAI ·{" "}
      <Link to="/about" style={{ color: "#ff6b6b", textDecoration: "none" }}>
        About
      </Link>{" "}
      ·{" "}
      <Link to="/contact" style={{ color: "#ff6b6b", textDecoration: "none" }}>
        Contact
      </Link>{" "}
      ·{" "}
      <Link
        to="/privacy-policy"
        style={{ color: "#ff6b6b", textDecoration: "none" }}
      >
        Privacy Policy
      </Link>
    </footer>
  );
}