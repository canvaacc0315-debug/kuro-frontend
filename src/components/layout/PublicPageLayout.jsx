import "../../styles/homepage.css";
import KuroHeader from "./KuroHeader";
import KuroFooter from "./KuroFooter";

export default function PublicPageLayout({ children }) {
  return (
    <div className="hp" style={{ paddingTop: 72, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <KuroHeader />

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: 900, margin: "3rem auto", padding: "2rem", flex: 1, width: "100%" }}>
        {children}
      </main>

      <KuroFooter />
    </div>
  );
}