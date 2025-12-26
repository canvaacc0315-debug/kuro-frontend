// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import KuroWorkspacePage from "./pages/KuroWorkspacePage";
import HomeOverlayButton from "./components/layout/HomeOverlayButton";

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

  // ✅ AdSense script (OK to keep)
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5203867874990287";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />

      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/login/*" element={<LoginPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

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

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}