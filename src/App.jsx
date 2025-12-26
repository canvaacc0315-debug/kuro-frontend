// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import KuroWorkspacePage from "./pages/KuroWorkspacePage";

import HomeOverlayButton from "./components/layout/HomeOverlayButton";

// public legal pages
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
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("login")) document.title = "Login | RovexAI";
    else if (path.includes("sign-up")) document.title = "Sign Up | RovexAI";
    else document.title = "RovexAI";
  }, []);

  return (
    <Routes>

      {/* ✅ INDEX ROUTE (instead of path="/") */}
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* Public routes (NO AUTH) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth routes */}
      <Route path="/login/*" element={<LoginPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected dashboard */}
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
              <HomeOverlayButton />
              <KuroWorkspacePage />
            </>
          </ProtectedRoute>
        }
      />

      {/* ✅ Fallback MUST BE LAST */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}