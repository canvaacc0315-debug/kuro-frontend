// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import KuroWorkspacePage from "./pages/KuroWorkspacePage";

// existing overlay component (UNCHANGED)
import HomeOverlayButton from "./components/layout/HomeOverlayButton";

// legal pages (NEW)
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
}

export default function App() {

  // ✅ FIX: Always keep RovexAI title in browser tab
  useEffect(() => {
    const path = window.location.pathname;

    if (path.includes("login")) document.title = "Login | RovexAI";
    else if (path.includes("sign-up")) document.title = "Sign Up | RovexAI";
    else document.title = "RovexAI";
  }, []);

  return (
    <Routes>

      {/* Root */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* LOGIN — wildcard so Clerk's internal routes work */}
      <Route path="/login/*" element={<LoginPage />} />

      {/* SIGN UP — wildcard required */}
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* App workspace */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <>
              {/* Invisible overlay button over logo */}
              <HomeOverlayButton />
              <KuroWorkspacePage />
            </>
          </ProtectedRoute>
        }
      />

      {/* ✅ PUBLIC LEGAL PAGES (AdSense required) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}