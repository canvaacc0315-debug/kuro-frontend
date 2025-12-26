const bgAnimation = `
@keyframes bgCrazy {
  0% {
    background-size: 100%;
    background-position: 50% 50%;
  }
  25% {
    background-size: 120%;
    background-position: 60% 40%;
  }
  50% {
    background-size: 130%;
    background-position: 40% 60%;
  }
  75% {
    background-size: 120%;
    background-position: 55% 45%;
  }
  100% {
    background-size: 100%;
    background-position: 50% 50%;
  }
}
`;

export default function GlobalBackground({ children }) {
  return (
    <>
      <style>{bgAnimation}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundImage: "url('/public-bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "100%",
          animation: "bgCrazy 18s ease-in-out infinite",
        }}
      >
        {children}
      </div>
    </>
  );
}