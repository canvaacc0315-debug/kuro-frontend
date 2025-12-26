import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "24px 0",
        textAlign: "center",
        fontSize: "15px",
        color: "#bbb",
        borderTop: "1px solid #222",
        marginTop: "48px",
        letterSpacing: "0.3px",
      }}
    >
      © 2025 RovexAI ·{" "}
      <Link to="/about" style={{ color: "#ff6b6b", margin: "0 6px" }}>
        About
      </Link>
      ·
      <Link to="/contact" style={{ color: "#ff6b6b", margin: "0 6px" }}>
        Contact
      </Link>
      ·
      <Link to="/privacy-policy" style={{ color: "#ff6b6b", margin: "0 6px" }}>
        Privacy Policy
      </Link>
    </footer>
  );
}