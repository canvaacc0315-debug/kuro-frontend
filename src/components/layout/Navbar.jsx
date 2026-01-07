// src/components/layout/Navbar.jsx
import { useMemo, useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import "../../styles/kuro-navbar.css";
import KuroLogo from "./KuroLogo.jsx"; // ✅ use our logo

const HOME_PATH = "/app"; // 👈 change this if your main page is different

export default function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  const email = user?.primaryEmailAddress?.emailAddress || "";

  const initials = useMemo(() => {
    if (!user) return "U";
    const name =
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      email ||
      "User";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");
  }, [user, email]);

  function toggleDropdown() {
    setOpen((prev) => !prev);
  }

  function closeDropdown() {
    setOpen(false);
  }

  function handleProfileClick() {
    closeDropdown();
    window.location.href = "/homepage?section=profile";
  }

  function handleSettingsClick() {
    closeDropdown();
    window.location.href = "/homepage?section=settings";
  }

  function handleSignOut() {
    closeDropdown();
    signOut(() => {
      window.location.href = "/";
    });
  }

  return (
    <>
      <nav className="kuro-navbar">
        {/* LEFT – LOGO / BRAND with invisible button on top */}
        <div className="kuro-navbar-brand">
          {/* 🔹 our image logo instead of emoji */}
          <KuroLogo size={42} />

          <div className="kuro-navbar-brand-text">RovexAI</div>

          {/* invisible hit‑area button */}
          <button
            type="button"
            className="kuro-navbar-brand-hitbox"
            aria-label="Back to main page"
            onClick={() => {
              window.location.href = HOME_PATH;
            }}
          />
        </div>

        {/* RIGHT – PROFILE / DROPDOWN */}
        {user && (
          <div className="kuro-navbar-right">
            <button
              type="button"
              className={`kuro-profile-btn ${open ? "active" : ""}`}
              onClick={toggleDropdown}
            >
              <div className="kuro-avatar">{initials}</div>
              <div className="kuro-user-meta">
                <div className="kuro-user-name">{displayName}</div>
                {email && <div className="kuro-user-email">{email}</div>}
              </div>
              <svg
                className="kuro-dropdown-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div
              className={
                "kuro-dropdown-menu " + (open ? "kuro-dropdown-open" : "")
              }
            >
              <div className="kuro-dropdown-header">
                <div className="kuro-avatar kuro-avatar-lg">{initials}</div>
                <div className="kuro-dropdown-header-info">
                  <div className="kuro-dropdown-header-name">
                    {displayName}
                  </div>
                  {email && (
                    <div className="kuro-dropdown-header-email">{email}</div>
                  )}
                </div>
              </div>

              <div className="kuro-dropdown-section">
                <div className="kuro-section-title">Account</div>

                <button
                  type="button"
                  className="kuro-dropdown-item"
                  onClick={handleProfileClick}
                >
                  <span className="kuro-item-icon">👤</span>
                  <span className="kuro-item-label">User Profile</span>
                </button>

                <button
                  type="button"
                  className="kuro-dropdown-item"
                  onClick={handleSettingsClick}
                >
                  <span className="kuro-item-icon">⚙️</span>
                  <span className="kuro-item-label">Settings</span>
                </button>
              </div>

              <div className="kuro-dropdown-section">
                <button
                  type="button"
                  className="kuro-dropdown-item kuro-danger"
                  onClick={handleSignOut}
                >
                  <span className="kuro-item-icon">🚪</span>
                  <span className="kuro-item-label">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* BACKDROP */}
      {open && (
        <div
          className="kuro-dropdown-overlay kuro-dropdown-overlay-active"
          onClick={closeDropdown}
        />
      )}
    </>
  );
}