// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import KuroWorkspacePage from "./pages/KuroWorkspacePage";
import HomeOverlayButton from "./components/layout/HomeOverlayButton";
import ScrollToTop from "./components/utils/ScrollToTop";
import FloatingHelp from "./components/FloatingHelp/FloatingHelp";
import "./styles/no-scrollbar-override.css";
import HomePage from "./pages/HomePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import InstructionModal from "./components/modals/InstructionModal";

// ❌ REMOVED: PDF Tools import (using workspace tab instead)

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
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9545152753392718 ";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  const { isSignedIn } = useUser();
  const location = useLocation();

  if (isSignedIn && (location.pathname.startsWith("/login") || location.pathname.startsWith("/sign-up"))) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <InstructionModal />
      <ScrollToTop />

      <Routes>
        {/* INDEX */}
        <Route index element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        
        {/* PUBLIC PAGES */}
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
              <FloatingHelp />
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* WORKSPACE - PDF Tools is inside this as a tab */}
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

        {/* ❌ REMOVED: PDF Tools standalone route (using workspace tab instead) */}

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to={isSignedIn ? "/homepage" : "/"} replace />} />
      </Routes>
    </>
  );
}