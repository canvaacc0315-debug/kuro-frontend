// src/pages/DashboardPage.jsx
import { useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import KuroLogo from "../components/layout/KuroLogo.jsx";
import { useRef, useEffect } from "react";
import logoIcon from "../assets/logo.svg";
import {
  MessageSquare, BarChart2, GraduationCap, PenTool,
  ScanSearch, Wrench, Shield, Zap, Bot, Smartphone,
  Link2, Target, ArrowRight
} from "lucide-react";

/* ─────────────────────────────────────────────
   ALL STYLES — injected into <head>
   Uses very specific selectors so global dark
   theme cannot win
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

/* ROOT */
div.rovex-dash {
  font-family: 'DM Sans', sans-serif !important;
  background: #F0F2F5 !important;
  color: #111111 !important;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
}

/* ── HEADER ── forced white always */
div.rovex-dash header.rdh {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
  height: 64px !important;
  background: #ffffff !important;
  border-bottom: 1px solid rgba(0,0,0,0.08) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 3rem !important;
  box-shadow: 0 1px 16px rgba(0,0,0,0.05) !important;
  backdrop-filter: none !important;
}

div.rovex-dash .rdh-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

div.rovex-dash .rdh-logo {
  font-family: 'Syne', sans-serif !important;
  font-weight: 800 !important;
  font-size: 1.3rem !important;
  letter-spacing: -0.03em !important;
  color: #111 !important;
}
div.rovex-dash .rdh-logo .r-red  { color: #FF6B5A !important; }

div.rovex-dash .rdh-nav {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
div.rovex-dash .rdh-nl {
  font-family: 'DM Sans', sans-serif !important;
  color: #6B7280 !important;
  text-decoration: none !important;
  font-weight: 500 !important;
  font-size: 0.9rem !important;
  padding: 0.45rem 0.95rem !important;
  border-radius: 8px !important;
  border: none !important;
  background: none !important;
  cursor: pointer !important;
  transition: all 0.18s ease !important;
}
div.rovex-dash .rdh-nl:hover {
  color: #FF6B5A !important;
  background: rgba(255,107,90,0.07) !important;
}

/* ── MAIN ── full width */
div.rovex-dash main.rdm {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 3rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 4.5rem;
}

/* ── HERO ── */
div.rovex-dash .rdh-hero {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 28px;
  padding: 4rem 4rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  box-shadow: 0 2px 20px rgba(0,0,0,0.04);
}

div.rovex-dash .rdh-blob1 {
  position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none;
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(255,107,90,0.16) 0%, transparent 65%);
  top: -140px; left: -80px;
}
div.rovex-dash .rdh-blob2 {
  position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  width: 260px; height: 260px;
  background: radial-gradient(circle, rgba(255,154,60,0.12) 0%, transparent 65%);
  bottom: -80px; right: 25%;
}
div.rovex-dash .rdh-dots {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(circle, rgba(0,0,0,0.045) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 5%, transparent 100%);
  opacity: 0.5;
}

div.rovex-dash .rdh-left { position: relative; z-index: 1; max-width: 560px; }

div.rovex-dash .rdh-pill {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-size: 0.72rem; font-weight: 700; color: #6B7280;
  letter-spacing: 0.08em; text-transform: uppercase;
  margin-bottom: 1.2rem;
  background: #F0F2F5; border: 1px solid rgba(0,0,0,0.07);
  border-radius: 100px; padding: 0.3rem 1rem;
}
div.rovex-dash .rdh-online {
  width: 7px; height: 7px; background: #22c55e;
  border-radius: 50%; flex-shrink: 0;
  box-shadow: 0 0 6px rgba(34,197,94,0.6);
}

div.rovex-dash .rdh-title {
  font-family: 'Syne', sans-serif !important;
  font-size: 3.2rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.04em !important;
  line-height: 1.06 !important;
  color: #111111 !important;
  margin-bottom: 1rem;
}
div.rovex-dash .rdh-grad {
  background: linear-gradient(135deg, #FF6B5A, #FF9A3C) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}
div.rovex-dash .rdh-sub {
  font-size: 1.05rem !important;
  color: #6B7280 !important;
  line-height: 1.7 !important;
  margin-bottom: 2rem;
  max-width: 460px;
}
div.rovex-dash .rdh-cta {
  font-family: 'DM Sans', sans-serif !important;
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: #FF6B5A !important; color: #fff !important;
  border: none; padding: 0.85rem 2.2rem;
  border-radius: 14px; font-weight: 700; font-size: 0.95rem;
  cursor: pointer; transition: all 0.22s;
  box-shadow: 0 6px 24px rgba(255,107,90,0.28);
}
div.rovex-dash .rdh-cta:hover {
  background: #E8503F !important;
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(255,107,90,0.38);
}

div.rovex-dash .rdh-right {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 0.75rem; flex-shrink: 0;
}
div.rovex-dash .rdh-tag {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: #ffffff; border: 1px solid rgba(0,0,0,0.08);
  border-radius: 14px; padding: 0.65rem 1.2rem;
  font-size: 0.85rem; font-weight: 600; color: #111 !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  white-space: nowrap;
}
div.rovex-dash .rdh-tag svg { color: #FF6B5A; flex-shrink: 0; }
div.rovex-dash .rdh-t1 { animation: rdf 4s ease-in-out infinite; }
div.rovex-dash .rdh-t2 { animation: rdf 4.7s ease-in-out infinite 0.5s; }
div.rovex-dash .rdh-t3 { animation: rdf 3.9s ease-in-out infinite 1s; }
@keyframes rdf { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

/* ── SECTION HEADER ── */
div.rovex-dash .rds-hdr {
  text-align: center;
  display: flex; flex-direction: column; align-items: center;
  margin-bottom: 2.8rem;
}
div.rovex-dash .rds-eye {
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: #FF6B5A !important;
  margin-bottom: 0.6rem;
}
div.rovex-dash .rds-hdr h2 {
  font-family: 'Syne', sans-serif !important;
  font-size: 2.4rem !important; font-weight: 800 !important;
  letter-spacing: -0.035em !important; color: #111 !important;
  margin-bottom: 0.65rem; line-height: 1.12;
}
div.rovex-dash .rds-hdr p {
  color: #6B7280 !important; font-size: 1rem;
  max-width: 480px; line-height: 1.65;
}

/* ── WORKSPACE GRID ── */
div.rovex-dash .rdw-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.4rem;
}

div.rovex-dash .rdw-card {
  background: #ffffff !important;
  border: 1px solid rgba(0,0,0,0.07) !important;
  border-radius: 24px;
  padding: 2rem 1.8rem 1.8rem;
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
  transition: transform 0.26s, box-shadow 0.26s, border-color 0.26s;
  cursor: default;
}
div.rovex-dash .rdw-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  border-color: rgba(0,0,0,0.11) !important;
}

div.rovex-dash .rdw-abar {
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  border-radius: 24px 24px 0 0;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94);
}
div.rovex-dash .rdw-card:hover .rdw-abar { transform: scaleX(1); }

div.rovex-dash .rdw-ico {
  width: 46px; height: 46px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.2rem; flex-shrink: 0;
  transition: transform 0.22s;
}
div.rovex-dash .rdw-card:hover .rdw-ico { transform: scale(1.1) rotate(-4deg); }

div.rovex-dash .rdw-name {
  font-family: 'Syne', sans-serif !important;
  font-size: 1.15rem !important; font-weight: 700 !important;
  letter-spacing: -0.025em !important; color: #111 !important;
  margin-bottom: 0.5rem;
}
div.rovex-dash .rdw-desc {
  color: #6B7280 !important; font-size: 0.87rem !important;
  line-height: 1.68 !important; margin-bottom: 1.3rem; flex: 1;
}
div.rovex-dash .rdw-feats {
  list-style: none; display: flex; flex-direction: column;
  gap: 0.35rem; margin-bottom: 1.5rem;
}
div.rovex-dash .rdw-feats li {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.82rem; font-weight: 500; color: #6B7280 !important;
}
div.rovex-dash .rdw-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

div.rovex-dash .rdw-btn {
  font-family: 'DM Sans', sans-serif !important;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  width: 100%; padding: 0.7rem 1rem; border-radius: 12px;
  border: 1.5px solid rgba(0,0,0,0.08); background: none !important;
  color: #111 !important; font-weight: 600; font-size: 0.85rem;
  cursor: pointer; margin-top: auto;
  transition: background 0.22s, border-color 0.22s, color 0.22s, box-shadow 0.22s;
}

/* ── FEATURES GRID ── */
div.rovex-dash .rdf-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem;
}
div.rovex-dash .rdf-card {
  background: #ffffff !important;
  border: 1px solid rgba(0,0,0,0.07) !important;
  border-radius: 24px; padding: 2rem 1.8rem;
  display: flex; align-items: flex-start; gap: 1.1rem;
  transition: transform 0.26s, box-shadow 0.26s, border-color 0.26s;
}
div.rovex-dash .rdf-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border-color: rgba(255,107,90,0.12) !important;
}
div.rovex-dash .rdf-ico {
  width: 42px; height: 42px; min-width: 42px;
  background: rgba(255,107,90,0.09); border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #FF6B5A; transition: transform 0.22s;
}
div.rovex-dash .rdf-card:hover .rdf-ico { transform: scale(1.1); }
div.rovex-dash .rdf-title {
  font-family: 'Syne', sans-serif !important;
  font-size: 1rem !important; font-weight: 700 !important;
  letter-spacing: -0.02em !important; color: #111 !important;
  margin-bottom: 0.4rem;
}
div.rovex-dash .rdf-desc { font-size: 0.86rem !important; color: #6B7280 !important; line-height: 1.65 !important; }

/* ── FOOTER ── */
div.rovex-dash footer.rdf-footer {
  background: #0f0f1a !important; color: #fff !important;
  padding: 3.5rem 3rem 2rem;
}
div.rovex-dash .rdf-fi {
  display: grid; grid-template-columns: 1.6fr 1fr 1fr;
  gap: 3rem; max-width: 1400px; margin: 0 auto 2.5rem;
}
div.rovex-dash .rdf-fbrand { display: flex; flex-direction: column; }
div.rovex-dash .rdf-frow { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
div.rovex-dash .rdf-fimg { width: 30px; height: 30px; object-fit: contain; }
div.rovex-dash .rdf-ftxt {
  font-family: 'Syne', sans-serif !important;
  font-weight: 800 !important; font-size: 1.2rem !important;
  letter-spacing: -0.03em !important;
}
div.rovex-dash .rdf-ftag {
  color: rgba(255,255,255,0.32) !important; font-size: 0.84rem;
  margin-top: 0.6rem; line-height: 1.6; max-width: 260px;
}
div.rovex-dash .rdf-fcol { display: flex; flex-direction: column; }
div.rovex-dash .rdf-fcol h4 {
  font-family: 'Syne', sans-serif !important;
  font-size: 0.7rem !important; font-weight: 700 !important;
  text-transform: uppercase; letter-spacing: 0.11em;
  color: rgba(255,255,255,0.75) !important; margin-bottom: 1rem;
}
div.rovex-dash .rdf-flnk {
  font-family: 'DM Sans', sans-serif !important;
  color: rgba(255,255,255,0.35) !important; font-size: 0.85rem;
  background: none; border: none; padding: 0; cursor: pointer;
  text-align: left; display: block; margin-bottom: 0.55rem;
  text-decoration: none; transition: color 0.2s;
}
div.rovex-dash .rdf-flnk:hover { color: #FF6B5A !important; }
div.rovex-dash .rdf-fbot {
  text-align: center; padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.18) !important; font-size: 0.75rem;
  max-width: 1400px; margin: 0 auto;
}

/* ── RESPONSIVE ── */
@media(max-width:1200px) {
  div.rovex-dash .rdw-grid,
  div.rovex-dash .rdf-grid { grid-template-columns: repeat(2,1fr); }
}
@media(max-width:1024px) {
  div.rovex-dash .rdh-hero { flex-direction:column; align-items:flex-start; }
  div.rovex-dash .rdh-right { flex-direction:row; flex-wrap:wrap; }
}
@media(max-width:768px) {
  div.rovex-dash header.rdh { padding:0 1.5rem !important; height:58px !important; }
  div.rovex-dash main.rdm { padding:1.5rem 1.2rem 4rem; gap:3rem; }
  div.rovex-dash .rdh-hero { padding:2.5rem 1.8rem; }
  div.rovex-dash .rdh-title { font-size:2.2rem !important; }
  div.rovex-dash .rdw-grid,
  div.rovex-dash .rdf-grid { grid-template-columns:1fr; }
  div.rovex-dash .rds-hdr h2 { font-size:1.9rem !important; }
  div.rovex-dash .rdf-fi { grid-template-columns:1fr 1fr; }
}
@media(max-width:540px) {
  div.rovex-dash .rdh-right { display:none; }
  div.rovex-dash .rdf-fi { grid-template-columns:1fr; }
}
`;

const WS = [
  { icon:<MessageSquare size={22}/>, name:"PDF Chat",         desc:"Interact with your PDFs using natural language. Ask questions, extract information, and get instant answers.",            feats:["Smart Q&A Engine","Context Understanding","Real-time Responses"], tab:"chat",     c:"#FF6B5A", bg:"rgba(255,107,90,.1)"  },
  { icon:<BarChart2     size={22}/>, name:"Analysis",         desc:"Deep dive into your PDF content. Extract data, generate insights, and visualize information beautifully.",               feats:["Data Extraction","Advanced Insights","Report Generation"],        tab:"analysis", c:"#3B82F6", bg:"rgba(59,130,246,.1)"  },
  { icon:<GraduationCap size={22}/>, name:"Study Mode",       desc:"Turn your PDFs into interactive learning materials. Generate flashcards and quizzes to master any subject.",             feats:["AI Flashcards","Smart Quizzes","Knowledge Testing"],              tab:"study",    c:"#8B5CF6", bg:"rgba(139,92,246,.1)" },
  { icon:<PenTool       size={22}/>, name:"Create & Edit",    desc:"Design and edit PDFs with Canva-like simplicity. Professional templates and easy tools.",                                feats:["Simple Editor","Add Text & Images","Custom PDFs"],                tab:"create",   c:"#10B981", bg:"rgba(16,185,129,.1)" },
  { icon:<ScanSearch    size={22}/>, name:"OCR & Recognition",desc:"Convert scanned documents to editable text and extract data from complex layouts.",                                      feats:["Text Recognition","Layout Detection","Batch Processing"],         tab:"ocr",      c:"#F59E0B", bg:"rgba(245,158,11,.1)" },
  { icon:<Wrench        size={22}/>, name:"PDF Tools",        desc:"Manage and transform your PDF documents. Merge, split, convert, and extract text from PDFs with ease.",                  feats:["Merge PDFs","Split PDFs","Convert to PDF"],                       tab:"pdftools", c:"#EC4899", bg:"rgba(236,72,153,.1)" },
];

const FEATS = [
  { icon:<Shield size={20}/>,     title:"Military-Grade Security", desc:"Your documents are encrypted and protected with industry-leading security standards."              },
  { icon:<Zap size={20}/>,        title:"Lightning Fast",          desc:"Process and analyze documents in milliseconds with our optimized infrastructure."                  },
  { icon:<Bot size={20}/>,        title:"AI Powered",              desc:"Advanced machine learning algorithms understand context and provide intelligent solutions."         },
  { icon:<Smartphone size={20}/>, title:"Fully Responsive",        desc:"Access RovexAI from any device. Work seamlessly on desktop, tablet, or mobile."                   },
  { icon:<Link2 size={20}/>,      title:"API Integration",         desc:"Integrate RovexAI into your workflows with our REST API and webhooks."                             },
  { icon:<Target size={20}/>,     title:"Precision Accuracy",      desc:"Industry-leading accuracy for text recognition, data extraction, and analysis."                   },
];

const GRAD = { background:"linear-gradient(135deg,#FF6B5A,#FF9A3C)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" };

export default function DashboardPage() {
  const { user }            = useUser();
  const navigate            = useNavigate();
  const { openUserProfile } = useClerk();
  const footerRef           = useRef(null);
  const firstName           = user?.firstName || user?.fullName?.split(" ")[0] || "there";

  useEffect(() => {
    const id = "rovex-ds-v3";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className="rovex-dash">

      {/* ── HEADER ── */}
      <header className="rdh">
        <div className="rdh-brand" onClick={() => navigate("/")}>
          <KuroLogo size={36} />
          <span className="rdh-logo">
            <span className="r-red">Rovex</span>AI
          </span>
        </div>

        <nav className="rdh-nav">
          <a href="/homepage"                    className="rdh-nl">Home</a>
          <a href="/app?tab=upload"              className="rdh-nl">Workspace</a>
          <a href="https://rovexai.com/contact"  className="rdh-nl">Help</a>
          <button onClick={openUserProfile}      className="rdh-nl">Settings</button>
        </nav>

        <UserButton showName afterSignOutUrl="/login" />
      </header>

      {/* ── MAIN ── */}
      <main className="rdm">

        {/* HERO */}
        <section className="rdh-hero">
          <div className="rdh-blob1" />
          <div className="rdh-blob2" />
          <div className="rdh-dots"  />

          <div className="rdh-left">
            <div className="rdh-pill">
              <span className="rdh-online" />
              Good to see you, {firstName}
            </div>
            <h1 className="rdh-title">
              Welcome to{" "}
              <span className="rdh-grad">RovexAI</span>
            </h1>
            <p className="rdh-sub">
              Transform your PDF workflows with intelligent document processing and creation
            </p>
            <button className="rdh-cta" onClick={() => navigate("/app?tab=upload")}>
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          <div className="rdh-right">
            <div className="rdh-tag rdh-t1"><Zap size={14}/> AI-Powered Analysis</div>
            <div className="rdh-tag rdh-t2"><PenTool size={14}/> Seamless Editing</div>
            <div className="rdh-tag rdh-t3"><ScanSearch size={14}/> Smart OCR</div>
          </div>
        </section>

        {/* WORKSPACES */}
        <section style={{display:"flex",flexDirection:"column"}}>
          <div className="rds-hdr">
            <span className="rds-eye">Workspaces</span>
            <h2>Choose Your <span style={GRAD}>Workspace</span></h2>
            <p>Select a workspace to get started with your PDF tasks</p>
          </div>

          <div className="rdw-grid">
            {WS.map((ws, i) => (
              <div className="rdw-card" key={i}
                onMouseEnter={e => {
                  const bar = e.currentTarget.querySelector(".rdw-abar");
                  const btn = e.currentTarget.querySelector(".rdw-btn");
                  if (bar) bar.style.transform = "scaleX(1)";
                  if (btn) { btn.style.background = ws.c; btn.style.borderColor = ws.c; btn.style.color = "#fff"; }
                }}
                onMouseLeave={e => {
                  const bar = e.currentTarget.querySelector(".rdw-abar");
                  const btn = e.currentTarget.querySelector(".rdw-btn");
                  if (bar) bar.style.transform = "scaleX(0)";
                  if (btn) { btn.style.background = "none"; btn.style.borderColor = "rgba(0,0,0,0.08)"; btn.style.color = "#111"; }
                }}
              >
                <div className="rdw-abar" style={{background: ws.c}} />
                <div className="rdw-ico" style={{background: ws.bg, color: ws.c}}>{ws.icon}</div>
                <h3 className="rdw-name">{ws.name}</h3>
                <p className="rdw-desc">{ws.desc}</p>
                <ul className="rdw-feats">
                  {ws.feats.map((f, fi) => (
                    <li key={fi}><span className="rdw-dot" style={{background: ws.c}}/>{f}</li>
                  ))}
                </ul>
                <button className="rdw-btn" onClick={() => navigate(`/app?tab=${ws.tab}`)}>
                  Go to Workspace <ArrowRight size={13}/>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* WHY ROVEXAI */}
        <section style={{display:"flex",flexDirection:"column"}}>
          <div className="rds-hdr">
            <span className="rds-eye">Why Us</span>
            <h2>Why Choose <span style={GRAD}>RovexAI</span>?</h2>
          </div>

          <div className="rdf-grid">
            {FEATS.map((f, i) => (
              <div className="rdf-card" key={i}>
                <div className="rdf-ico">{f.icon}</div>
                <div>
                  <h3 className="rdf-title">{f.title}</h3>
                  <p className="rdf-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="rdf-footer" ref={footerRef}>
        <div className="rdf-fi">
          <div className="rdf-fbrand">
            <div className="rdf-frow" onClick={() => navigate("/")}>
              <img src={logoIcon} alt="RovexAI" className="rdf-fimg" />
              <span className="rdf-ftxt">
                <span style={{color:"#FF6B5A"}}>Rovex</span><span style={{color:"#fff"}}>AI</span>
              </span>
            </div>
            <p className="rdf-ftag">Transforming how you work with documents through AI</p>
          </div>

          <div className="rdf-fcol">
            <h4>Company</h4>
            <button onClick={() => navigate("/about")}   className="rdf-flnk">About</button>
            <button onClick={() => navigate("/contact")} className="rdf-flnk">Contact</button>
          </div>

          <div className="rdf-fcol">
            <h4>Legal</h4>
            <button onClick={() => navigate("/privacy-policy")} className="rdf-flnk">Privacy Policy</button>
          </div>
        </div>

        <div className="rdf-fbot">
          <p>© {new Date().getFullYear()} RovexAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}