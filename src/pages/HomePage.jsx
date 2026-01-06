import { useNavigate } from "react-router-dom";
import "../styles/homepage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-shell">
      {/* Top navigation */}
      <header className="top-nav">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => navigate("/")}>
            RovexAI
          </div>

          <nav className="nav-links">
            <button type="button">Product</button>
            <button type="button">Solutions</button>
            <button type="button">Pricing</button>
            <button type="button">Docs</button>
          </nav>
        </div>

        <div className="nav-right">
          <button
            className="nav-link-btn"
            type="button"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>

          <button
            className="primary-btn"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-header">
        <h1>Turn static PDFs into living workflows.</h1>
        <p>
          Upload contracts, reports, and research. RovexAI turns them into a
          conversational workspace with traceable answers and exportable
          insights.
        </p>

        <div className="hero-cta-row">
          <button
            className="primary-btn"
            type="button"
            onClick={() => navigate("/sign-up")}
          >
            Start for free
          </button>

          <button className="ghost-btn" type="button">
            Book a demo
          </button>
        </div>

        <div className="hero-badges">
          <span>No setup · Just upload</span>
          <span>Optimized for long documents</span>
        </div>
      </section>

      {/* Hero mock */}
      <section className="hero-mock">
        <div className="mock-window">
          <div className="mock-topbar">
            <div className="mock-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="mock-title">Rovex · Q4 Workspace</div>
          </div>

          <div className="mock-body">
            <aside className="mock-sidebar">
              <div className="mock-sidebar-header">Workspaces</div>
              <ul>
                <li className="active">Q4 contracts</li>
                <li>Board reports</li>
                <li>Vendor reviews</li>
                <li>Research notes</li>
              </ul>
            </aside>

            <div className="mock-main">
              <div className="mock-channel-header"># q4-contracts</div>

              <div className="mock-message">
                <div className="mock-avatar">R</div>
                <div className="mock-message-body">
                  <div className="mock-message-title">Rovex AI</div>
                  <p>
                    Upload the contracts for this quarter and I will surface
                    risks, opportunities, and unusual clauses in one lifecycle
                    view.
                  </p>
                </div>
              </div>

              <div className="mock-input">
                Ask Rovex about this workspace…
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="cycle-section">
        <header className="cycle-header">
          <h2>Document lifecycle, in one orbit.</h2>
          <p>
            Hover or tap each stage to see how RovexAI handles your documents from
            upload to export.
          </p>
        </header>

        <div className="cycle-layout">
          <div className="cycle-shell">
            <div className="cycle-card">
              <div className="orbit-ring">
                <div className="orbit-spark" />
                <div className="orbit-spark" />
              </div>

              <div className="cycle-core">
                <span className="core-pill">
                  <span className="core-dot" />
                  Rovex document engine
                </span>

                <div className="core-title">Helio Core Stack</div>
                <div className="core-subtitle">
                  PDFs are converted into a single structured context so every
                  answer points to the exact page that supports it.
                </div>
              </div>

              <button className="cycle-node" aria-current="true">
                <div className="cycle-node-indicator" />
                <span className="cycle-node-label">Upload</span>
                <span className="cycle-node-caption">Bring files in</span>
              </button>

              <button className="cycle-node">
                <div className="cycle-node-indicator" />
                <span className="cycle-node-label">Process</span>
                <span className="cycle-node-caption">Clean & index</span>
              </button>

              <button className="cycle-node">
                <div className="cycle-node-indicator" />
                <span className="cycle-node-label">Chat</span>
                <span className="cycle-node-caption">Ask & explore</span>
              </button>

              <button className="cycle-node">
                <div className="cycle-node-indicator" />
                <span className="cycle-node-label">Insights</span>
                <span className="cycle-node-caption">Summaries</span>
              </button>

              <button className="cycle-node">
                <div className="cycle-node-indicator" />
                <span className="cycle-node-label">Share</span>
                <span className="cycle-node-caption">Export & send</span>
              </button>
            </div>
          </div>

          <article className="cycle-detail">
            <h3>Smart upload hub</h3>
            <p>
              Add one or many PDFs from your drive or cloud storage. RovexAI
              validates each file and prepares it for fast AI search.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
