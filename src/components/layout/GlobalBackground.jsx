// src/components/layout/GlobalBackground.jsx
const bgAnimation = `
@keyframes bgCrazy {
  0% {
    transform: scale(1);
    background-position: 50% 0%;
  }
  25% {
    transform: scale(1.12);
    background-position: 65% 35%;
  }
  50% {
    transform: scale(1.18);
    background-position: 35% 65%;
  }
  75% {
    transform: scale(1.12);
    background-position: 60% 40%;
  }
  100% {
    transform: scale(1);
    background-position: 50% 0%;
  }
}
`;

export default function GlobalBackground({ children }) {
  return (
    <>
      <style>{bgAnimation}</style>

      {/* 🌌 FIXED ANIMATED BACKGROUND */}
      <div
        className="global-bg-fixed"  // 👈 Added class for CSS protection
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,0.55),
              rgba(0,0,0,0.85)
            ),
            url('/public-bg.jpg')
          `,
          backgroundRepeat: "repeat",
          backgroundSize: "1400px auto",
          backgroundPosition: "center",
          animation: "bgCrazy 20s ease-in-out infinite",  // 👈 Ensure it's set
        }}
      />

      {/* APP CONTENT */}
      <div style={{ minHeight: "100dvh" }}>
        {children}
      </div>
    </>
  );
}