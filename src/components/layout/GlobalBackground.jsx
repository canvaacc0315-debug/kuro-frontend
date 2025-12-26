const bgAnimation = `
@keyframes bgCrazy {
  0% {
    transform: scale(1);
    background-position: 50% 50%;
  }
  25% {
    transform: scale(1.2);
    background-position: 60% 40%;
  }
  50% {
    transform: scale(1.3);
    background-position: 40% 60%;
  }
  75% {
    transform: scale(1.2);
    background-position: 55% 45%;
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

      {/* 🔥 FIXED BACKGROUND LAYER */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,

          backgroundImage: "url('/public-bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          animation: "bgCrazy 18s ease-in-out infinite",
        }}
      />

      {/* APP CONTENT */}
      <div style={{ minHeight: "100dvh" }}>{children}</div>
    </>
  );
}