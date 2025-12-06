// src/components/layout/HomeOverlayButton.jsx
import { useNavigate } from "react-router-dom";
// 👇 FIXED PATH: two levels up, then styles
import "../../styles/home-overlay-button.css";

export default function HomeOverlayButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="home-overlay-btn"
      aria-label="Back to main page"
      onClick={() => navigate("/dashboard")} // or "/app" if you prefer
    />
  );
}