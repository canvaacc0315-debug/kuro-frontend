// src/components/layout/KuroLogo.jsx
import React from "react";
import kuroLogo from "../../assets/kuro-logo.png"; // ✅ path: from layout → ../../assets

export default function KuroLogo({ size = 40 }) {
  return (
    <div
      className="kuro-logo-wrapper"
      style={{
        width: size,
        height: size,
        borderRadius: "14px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #ff4b6e, #ff9a62)", // matches your UI
      }}
    >
      <img
        src={kuroLogo}
        alt="Kuro.ai logo"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}