// src/components/layout/GlobalBackground.jsx

const bgAnimation = `
@keyframes bgCrazy {
  0% {
    transform: scale(1);
    background-position: 50% 50%;
  }
  25% {
    transform: scale(1.05);
    background-position: 52% 48%;
  }
  50% {
    transform: scale(1.08);
    background-position: 48% 52%;
  }
  75% {
    transform: scale(1.05);
    background-position: 51% 49%;
  }
  100% {
    transform: scale(1);
    background-position: 50% 50%;
  }
}
`;

export default function GlobalBackground({ children }) {
  return (
    <>
      <style>{bgAnimation}</style>

      {/* 🌌 FIXED ANIMATED BACKGROUND */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,

          backgroundImage: `
            linear-gradient(
              rgba(0, 0, 0, 0.55),
              rgba(0, 0, 0, 0.85)
            ),
            url('/public-bg.jpg')
          `,
          backgroundRepeat: "repeat",
          backgroundSize: "1200px auto",
          backgroundPosition: "center",

          /* ⭐ BALANCED SPEED */
          animation: "bgCrazy 30s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        }}
      />

      {/* APP CONTENT */}
      <div style={{ minHeight: "100dvh" }}>
        {children}
      </div>
    </>
  );
}