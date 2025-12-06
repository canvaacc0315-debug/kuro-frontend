// src/components/dashboard/SettingsCard.jsx
import { useClerk } from "@clerk/clerk-react";
import "../../styles/dashboard-settings-card.css"; // keep your existing CSS file name if different

export default function SettingsCard() {
  const { openUserProfile } = useClerk();

  const handleOpenSettings = () => {
    // Open Clerk "Manage account" modal
    if (openUserProfile) {
      openUserProfile();
    } else {
      // Fallback: go to a settings section page if you have one
      window.location.href = "/dashboard?section=settings";
    }
  };

  return (
    <div className="dash-card dash-card-settings">
      <div className="dash-card-icon settings-icon">
        {/* your gear icon / emoji */}
        <span role="img" aria-label="settings">
          ⚙️
        </span>
      </div>

      <h3 className="dash-card-title">Settings</h3>

      <p className="dash-card-subtitle">
        Manage your account, preferences, and security for a personalized
        experience.
      </p>

      <ul className="dash-card-list">
        <li>✔ Account Management</li>
        {/* ❌ API Integration removed */}
        <li>✔ Security Settings</li>
      </ul>

      <button
        type="button"
        className="dash-card-cta"
        onClick={handleOpenSettings}
      >
        OPEN SETTINGS
      </button>
    </div>
  );
}