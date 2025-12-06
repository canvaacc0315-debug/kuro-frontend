import React from "react";

export default function RippleSurface({ className = "", children }) {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
  };

  return (
    <div
      className={`ripple-surface ${className}`}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}