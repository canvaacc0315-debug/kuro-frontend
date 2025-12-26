// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import KuroWorkspacePage from "./pages/KuroWorkspacePage";

import HomeOverlayButton from "./components/layout/HomeOverlayButton";

// Public legal pages
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

  // ✅ ADD GOOGLE ADSENSE SCRIPT (YOUR CODE)
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5203867874990287";
    script.crossOrigin = "anonymous";

    document.head.appendChild(script);
  }, []);

  // ✅ Keep correct tab title
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("login")) document.title = "Login | RovexAI";
    else if (path.includes("sign-up")) document.title = "Sign Up | RovexAI";
    else document.title = "RovexAI";
  }, []);

  return (
    <Routes>

      {/* INDEX */}
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* PUBLIC LEGAL PAGES (NO AUTH) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* AUTH */}
      <Route path="/login/*" element={<LoginPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* WORKSPACE */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <>
              <HomeOverlayButton />
              <KuroWorkspacePage />
            </>
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}