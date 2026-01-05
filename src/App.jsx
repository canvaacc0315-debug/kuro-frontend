// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react"; // Removed useState

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import KuroWorkspacePage from "./pages/KuroWorkspacePage";
import HomeOverlayButton from "./components/layout/HomeOverlayButton";
import ScrollToTop from "./components/utils/ScrollToTop";
import FloatingHelp from "./components/FloatingHelp/FloatingHelp"; // ✅ Added import
import "./styles/no-scrollbar-override.css";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";

import GlobalBackground from "./components/layout/GlobalBackground";

import InstructionModal from "./components/modals/InstructionModal";

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
  // ✅ Google AdSense (keep as-is)
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9545152753392718";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return (
    <GlobalBackground>
      {/* ✅ Instruction popup – always mounted, self-manages visibility */}
      <InstructionModal />

      <ScrollToTop />

      <Routes>
        {/* INDEX */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
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
              {/* ✅ Floating help widget – only on dashboard */}
              <FloatingHelp />
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
    </GlobalBackground>
  );
}