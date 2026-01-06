import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./styles/homepage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate("/")}>
          RovexAI
        </div>
      </header>
      <div className="home-content">
        <div className="home-card">
          <h1 className="home-title">Welcome to RovexAI</h1>
          <p className="home-subtitle">
            Your AI-powered PDF workspace. Effortlessly manage, edit, and analyze your PDFs with intelligent tools designed to boost productivity.
          </p>
          <div className="home-actions">
            <SignedOut>
              <button
                onClick={() => navigate("/login")}
                className="home-btn home-btn-secondary"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/sign-up")}
                className="home-btn home-btn-primary"
              >
                Sign Up
              </button>
            </SignedOut>
            <SignedIn>
              <button
                onClick={() => navigate("/app")}
                className="home-btn home-btn-primary"
              >
                Go to Workspace
              </button>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
}