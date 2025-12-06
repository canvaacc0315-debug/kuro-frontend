// src/components/PdfDesignCanvas.jsx
import { useState } from "react";

export default function PdfDesignCanvas() {
  const [activeTool, setActiveTool] = useState("text");

  return (
    <div className="create-editor-root">
      {/* SIDEBAR */}
      <aside className="create-sidebar">
        <div className="create-sidebar-header">
          <h2>Kuro Create</h2>
        </div>

        <div className="create-sidebar-section">
          <div className="create-sidebar-title">Tools</div>

          <button
            type="button"
            className={
              "create-tool-btn" + (activeTool === "text" ? " active" : "")
            }
            onClick={() => setActiveTool("text")}
          >
            <span className="create-tool-icon">📝</span>
            <span>Text</span>
          </button>

          <button
            type="button"
            className={
              "create-tool-btn" + (activeTool === "shape" ? " active" : "")
            }
            onClick={() => setActiveTool("shape")}
          >
            <span className="create-tool-icon">⬜</span>
            <span>Shape</span>
          </button>

          <button
            type="button"
            className={
              "create-tool-btn" + (activeTool === "image" ? " active" : "")
            }
            onClick={() => setActiveTool("image")}
          >
            <span className="create-tool-icon">🖼️</span>
            <span>Image</span>
          </button>

          <button
            type="button"
            className={
              "create-tool-btn" + (activeTool === "button" ? " active" : "")
            }
            onClick={() => setActiveTool("button")}
          >
            <span className="create-tool-icon">🔗</span>
            <span>Button</span>
          </button>
        </div>

        <div className="create-sidebar-section">
          <div className="create-sidebar-title">Templates</div>

          <button type="button" className="create-tool-btn">
            <span className="create-tool-icon">📋</span>
            <span>Blank</span>
          </button>

          <button type="button" className="create-tool-btn">
            <span className="create-tool-icon">📘</span>
            <span>Study Guide</span>
          </button>

          <button type="button" className="create-tool-btn">
            <span className="create-tool-icon">🎯</span>
            <span>Quiz</span>
          </button>
        </div>

        <div className="create-sidebar-footer">
          <button type="button" className="create-action-btn primary">
            Export
          </button>
          <button type="button" className="create-action-btn">
            Save
          </button>
        </div>
      </aside>

      {/* MAIN / CANVAS + RIGHT PANEL */}
      <div className="create-main">
        {/* Top bar inside editor, NOT the page navbar */}
        <div className="create-header">
          <div className="create-header-left">
            <h1>Untitled document</h1>
          </div>
          <div className="create-header-right">
            <button
              type="button"
              className="create-icon-btn"
              title="Undo"
            >
              ↶
            </button>
            <button
              type="button"
              className="create-icon-btn"
              title="Redo"
            >
              ↷
            </button>
            <button
              type="button"
              className="create-icon-btn"
              title="Zoom"
            >
              🔍
            </button>
            <button
              type="button"
              className="create-icon-btn"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>

        <div className="create-editor-body">
          {/* CANVAS */}
          <div className="create-canvas">
            <div className="create-canvas-content">
              <div
                className="create-canvas-element"
                style={{ top: 60, left: 80, width: 300 }}
              >
                <strong>Click to edit text</strong>
                <br />
                <span style={{ fontSize: 12 }}>Double‑click to edit</span>
              </div>

              <div className="create-canvas-placeholder">
                <div className="create-canvas-placeholder-icon">✏️</div>
                <div className="create-canvas-placeholder-text">
                  Drag tools or double‑click to add content
                </div>
              </div>
            </div>
          </div>

          {/* PROPERTIES PANEL */}
          <aside className="create-properties">
            <div className="create-properties-title">Element properties</div>

            <div className="create-property-group">
              <div className="create-property-label">Font</div>
              <select className="create-property-input">
                <option>Inter</option>
                <option>JetBrains Mono</option>
                <option>Georgia</option>
                <option>Times New Roman</option>
              </select>
            </div>

            <div className="create-property-group">
              <div className="create-property-label">Size</div>
              <input
                type="range"
                min="8"
                max="72"
                defaultValue="14"
                className="create-property-input create-range-input"
              />
            </div>

            <div className="create-property-group">
              <div className="create-property-label">Color</div>
              <div className="create-color-picker">
                <div
                  className="create-color-swatch active"
                  style={{ background: "#ff2945" }}
                />
                <div
                  className="create-color-swatch"
                  style={{ background: "#ff9aa8" }}
                />
                <div
                  className="create-color-swatch"
                  style={{ background: "#f5f5f7" }}
                />
                <div
                  className="create-color-swatch"
                  style={{ background: "#8a8ca0" }}
                />
                <div
                  className="create-color-swatch"
                  style={{ background: "#2a2a36" }}
                />
              </div>
            </div>

            <div className="create-divider" />

            <div className="create-property-group">
              <div className="create-property-label">Opacity</div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="100"
                className="create-property-input create-range-input"
              />
            </div>

            <div className="create-property-group">
              <div className="create-property-label">Rotation</div>
              <input
                type="number"
                className="create-property-input"
                defaultValue="0"
                placeholder="0°"
              />
            </div>

            <div className="create-divider" />

            <button type="button" className="create-action-btn">
              Delete element
            </button>
            <button type="button" className="create-action-btn primary">
              Save document
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}