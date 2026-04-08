// src/components/CreatePdfPanel.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import "../styles/create-editor.css";
import { jsPDF } from "jspdf";
import * as fabric from "fabric";
import {
  Download, Type, Square, Circle, Trash2, Settings,
  ChevronUp, ChevronDown, Image as ImageIcon, Triangle,
  Minus, Star, RotateCw, Layers, Eye, Palette,
  ZoomIn, ZoomOut, Undo2, Redo2, Copy
} from "lucide-react";

// Base canvas dimensions (A4-ish ratio)
const BASE_W = 600;
const BASE_H = 800;

export default function CreatePdfPanel({ onExportPdf }) {
  // states
  const [activeObject, setActiveObject] = useState(null);
  const [toolbarStyle, setToolbarStyle] = useState({
    fontSize: 26, color: "#000000", bold: false, italic: false,
    underline: false, align: "left", opacity: 1, angle: 0
  });
  const [showTools, setShowTools] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [pageBg, setPageBg] = useState("#ffffff");
  const [canvasScale, setCanvasScale] = useState(1);
  const [activeSection, setActiveSection] = useState("text"); // mobile section tabs

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // INIT FABRIC
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: BASE_W,
      height: BASE_H,
      backgroundColor: pageBg,
      preserveObjectStacking: true,
      allowTouchScrolling: false,
      selection: true,
    });
    fabricRef.current = canvas;

    // Handle selection changes
    const updateToolbar = () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        setActiveObject(activeObj);
        const base = {
          opacity: activeObj.opacity ?? 1,
          angle: Math.round(activeObj.angle || 0),
          color: activeObj.fill || "#000000"
        };
        if (activeObj.type === "i-text" || activeObj.type === "text") {
          setToolbarStyle({
            ...base,
            fontSize: activeObj.fontSize || 26,
            bold: activeObj.fontWeight === "bold" || activeObj.fontWeight === 700,
            italic: activeObj.fontStyle === "italic",
            underline: activeObj.underline || false,
            align: activeObj.textAlign || "left"
          });
        } else {
          setToolbarStyle(prev => ({ ...prev, ...base }));
        }
      } else {
        setActiveObject(null);
      }
    };

    canvas.on("selection:created", updateToolbar);
    canvas.on("selection:updated", updateToolbar);
    canvas.on("selection:cleared", updateToolbar);
    canvas.on("object:modified", updateToolbar);
    canvas.on("object:rotating", updateToolbar);
    canvas.on("object:scaling", updateToolbar);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Responsive canvas scaling
  useEffect(() => {
    if (!wrapperRef.current) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const padX = isMobile ? 20 : 80;
        const padY = isMobile ? 20 : 80;
        const availW = width - padX;
        const availH = height - padY;
        const scaleW = availW / BASE_W;
        const scaleH = availH / BASE_H;
        const scale = Math.min(scaleW, scaleH, 1.2);
        setCanvasScale(Math.max(0.3, scale));
      }
    });

    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [isMobile]);

  const updateObjectStyle = (styles) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      activeObj.set(styles);
      canvas.renderAll();
      // update toolbar state from the object
      const base = {
        opacity: activeObj.opacity ?? 1,
        angle: Math.round(activeObj.angle || 0),
        color: activeObj.fill || "#000000"
      };
      if (activeObj.type === "i-text" || activeObj.type === "text") {
        setToolbarStyle({
          ...base,
          fontSize: activeObj.fontSize || 26,
          bold: activeObj.fontWeight === "bold" || activeObj.fontWeight === 700,
          italic: activeObj.fontStyle === "italic",
          underline: activeObj.underline || false,
          align: activeObj.textAlign || "left"
        });
      } else {
        setToolbarStyle(prev => ({ ...prev, ...base }));
      }
    }
  };

  // ADD COMPONENTS
  const addText = (isHeading) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText(isHeading ? "Heading" : "Body text", {
      left: 100 + Math.random() * 100,
      top: 100 + Math.random() * 100,
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: isHeading ? 36 : 18,
      fontWeight: isHeading ? "bold" : "normal",
      fill: "#000000",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    if (isMobile) setShowTools(false);
  };

  const addShape = (type) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    let shape;
    const baseLeft = 150 + Math.random() * 100;
    const baseTop = 200 + Math.random() * 100;

    switch (type) {
      case "rect":
        shape = new fabric.Rect({
          left: baseLeft, top: baseTop, fill: "#3b82f6", width: 120, height: 80, rx: 8, ry: 8
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          left: baseLeft, top: baseTop, fill: "#ef4444", radius: 50
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          left: baseLeft, top: baseTop, fill: "#f59e0b", width: 100, height: 100
        });
        break;
      case "line":
        shape = new fabric.Line([0, 0, 200, 0], {
          left: baseLeft, top: baseTop, stroke: "#6366f1", strokeWidth: 3,
          fill: "", selectable: true
        });
        break;
      case "star": {
        // 5-pointed star using polygon
        const points = [];
        const outerR = 50, innerR = 22;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
        }
        shape = new fabric.Polygon(points, {
          left: baseLeft, top: baseTop, fill: "#eab308",
          strokeWidth: 0
        });
        break;
      }
      default: return;
    }
    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      if (isMobile) setShowTools(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const canvas = fabricRef.current;
    if (!canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target.result;
      const imgObj = new Image();
      imgObj.onload = () => {
        const img = new fabric.Image(imgObj);
        if (img.width > 300) img.scaleToWidth(300);
        img.set({ left: 80, top: 80 });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      };
      imgObj.src = data;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    if (isMobile) setShowTools(false);
  };

  const deleteActive = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

  const duplicateActive = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    activeObj.clone().then((cloned) => {
      cloned.set({ left: (activeObj.left || 0) + 20, top: (activeObj.top || 0) + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      // Check if the active fabric object is being edited (typing text)
      const canvas = fabricRef.current;
      if (canvas) {
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.isEditing) return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        deleteActive();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        duplicateActive();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bringToFront = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) { canvas.bringObjectToFront(activeObj); canvas.renderAll(); }
  };
  
  const sendToBack = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) { canvas.sendObjectToBack(activeObj); canvas.renderAll(); }
  };

  const exportToPdf = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const scale = pdfWidth / BASE_W;
    const finalHeight = BASE_H * scale;
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, finalHeight);
    pdf.save("rovexai-design.pdf");
    if (onExportPdf) onExportPdf();
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    if (activeObject) {
      updateObjectStyle({ fill: color });
    } else {
      setPageBg(color);
      const canvas = fabricRef.current;
      if (canvas) {
        canvas.backgroundColor = color;
        canvas.renderAll();
      }
    }
  };

  // --- MOBILE SECTION TABS ---
  const mobileSections = [
    { id: "text", label: "Text", icon: <Type size={16} /> },
    { id: "shapes", label: "Shapes", icon: <Square size={16} /> },
    { id: "style", label: "Style", icon: <Palette size={16} /> },
    { id: "actions", label: "Actions", icon: <Layers size={16} /> },
  ];

  return (
    <div className={`create-editor-root ${!showTools ? 'tools-hidden' : ''}`}>
      {/* MOBILE: Floating toggle */}
      {isMobile && (
        <button 
          className="mobile-tools-toggle"
          onClick={() => setShowTools(!showTools)}
          aria-label={showTools ? "Hide Tools" : "Show Tools"}
        >
          {showTools ? <ChevronDown size={18} /> : <Settings size={18} />}
          <span>{showTools ? "Hide" : "Tools"}</span>
        </button>
      )}

      {/* SIDEBAR (Desktop) / BOTTOM SHEET (Mobile) */}
      {(showTools || !isMobile) && (
        <aside className="create-editor-sidebar">
          {/* Mobile section tabs */}
          {isMobile && (
            <div className="mobile-section-tabs">
              {mobileSections.map(s => (
                <button 
                  key={s.id}
                  className={`mobile-section-tab ${activeSection === s.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* TEXT Section */}
          {(!isMobile || activeSection === "text") && (
            <div className="sidebar-section">
              <div className="sidebar-title">Text Options</div>
              <button className="sidebar-primary-btn" onClick={() => addText(true)}>
                <span className="sidebar-primary-icon">H</span> Add Heading
              </button>
              <button className="text-style-card text-style-body" onClick={() => addText(false)}>
                <div className="text-style-main">Add body text</div>
                <div className="text-style-sub">Click to add paragraph</div>
              </button>
            </div>
          )}

          {/* SHAPES Section */}
          {(!isMobile || activeSection === "shapes") && (
            <div className="sidebar-section">
              <div className="sidebar-title">Elements</div>
              <div className="shapes-grid">
                <button className="shape-btn" onClick={() => addShape('rect')} title="Rectangle">
                  <Square size={20} />
                  <span>Rect</span>
                </button>
                <button className="shape-btn" onClick={() => addShape('circle')} title="Circle">
                  <Circle size={20} />
                  <span>Circle</span>
                </button>
                <button className="shape-btn" onClick={() => addShape('triangle')} title="Triangle">
                  <Triangle size={20} />
                  <span>Triangle</span>
                </button>
                <button className="shape-btn" onClick={() => addShape('line')} title="Line">
                  <Minus size={20} />
                  <span>Line</span>
                </button>
                <button className="shape-btn" onClick={() => addShape('star')} title="Star">
                  <Star size={20} />
                  <span>Star</span>
                </button>
                <label className="shape-btn" title="Upload Image">
                  <ImageIcon size={20} />
                  <span>Image</span>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          )}

          {/* STYLE Section */}
          {(!isMobile || activeSection === "style") && (
            <div className="sidebar-section">
              <div className="sidebar-title">Styling</div>
              
              {/* Background Color */}
              <div className="style-row">
                <span className="style-label">Page BG</span>
                <input type="color" value={pageBg} onChange={(e) => {
                  setPageBg(e.target.value);
                  const canvas = fabricRef.current;
                  if (canvas) { canvas.backgroundColor = e.target.value; canvas.renderAll(); }
                }} className="toolbar-color-picker" />
              </div>

              {/* Object Color */}
              <div className="style-row">
                <span className="style-label">Fill Color</span>
                <input type="color" value={toolbarStyle.color} onChange={handleColorChange} className="toolbar-color-picker" />
              </div>

              {/* Opacity */}
              <div className="style-row">
                <span className="style-label"><Eye size={14} /> Opacity</span>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={toolbarStyle.opacity}
                  onChange={(e) => updateObjectStyle({ opacity: parseFloat(e.target.value) })}
                  className="style-slider"
                  disabled={!activeObject}
                />
                <span className="style-value">{Math.round(toolbarStyle.opacity * 100)}%</span>
              </div>

              {/* Rotation */}
              <div className="style-row">
                <span className="style-label"><RotateCw size={14} /> Rotation</span>
                <input 
                  type="range" min="0" max="360" step="1"
                  value={toolbarStyle.angle}
                  onChange={(e) => updateObjectStyle({ angle: parseInt(e.target.value) })}
                  className="style-slider"
                  disabled={!activeObject}
                />
                <span className="style-value">{toolbarStyle.angle}°</span>
              </div>
            </div>
          )}

          {/* ACTIONS Section */}
          {(!isMobile || activeSection === "actions") && (
            <div className="sidebar-section">
              <div className="sidebar-title">Actions</div>
              <div className="actions-grid">
                <button className="action-mini-btn" onClick={bringToFront} disabled={!activeObject} title="Bring to Front">
                  <Layers size={16} /> Front
                </button>
                <button className="action-mini-btn" onClick={sendToBack} disabled={!activeObject} title="Send to Back">
                  <Layers size={16} style={{ transform: 'rotate(180deg)' }} /> Back
                </button>
                <button className="action-mini-btn" onClick={duplicateActive} disabled={!activeObject} title="Duplicate (Ctrl+D)">
                  <Copy size={16} /> Copy
                </button>
                <button className="action-mini-btn danger" onClick={deleteActive} disabled={!activeObject} title="Delete (Del)">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Export - always visible */}
          <div className="sidebar-bottom">
            <button className="sidebar-export-btn" onClick={exportToPdf}>
              <Download size={20} /> <span className="btn-text">Export PDF</span>
            </button>
          </div>
        </aside>
      )}

      {/* MAIN CANVAS AREA */}
      <section className="create-editor-main">
        {/* Top Toolbar - text formatting */}
        <div className="create-toolbar" onMouseDown={(e) => e.stopPropagation()}>
          <div className="toolbar-group">
            <span className="toolbar-label">Size</span>
            <input
              type="number" min={8} max={120}
              value={toolbarStyle.fontSize}
              onChange={(e) => updateObjectStyle({ fontSize: parseInt(e.target.value) || 16 })}
              className="toolbar-input"
              disabled={!activeObject}
            />
          </div>
          
          <div className="toolbar-group">
            <span className="toolbar-label">Color</span>
            <input type="color" value={toolbarStyle.color} onChange={handleColorChange} className="toolbar-color-picker" />
          </div>

          {!isMobile && (
            <>
              <div className="toolbar-group">
                <span className="toolbar-label">Align</span>
                <div className="toolbar-toggle-group">
                  <button className={`toolbar-toggle ${toolbarStyle.align === "left" ? "active" : ""}`} onClick={() => updateObjectStyle({ textAlign: "left" })}>☰</button>
                  <button className={`toolbar-toggle ${toolbarStyle.align === "center" ? "active" : ""}`} onClick={() => updateObjectStyle({ textAlign: "center" })}>≡</button>
                  <button className={`toolbar-toggle ${toolbarStyle.align === "right" ? "active" : ""}`} onClick={() => updateObjectStyle({ textAlign: "right" })}>☷</button>
                </div>
              </div>

              <div className="toolbar-group toolbar-group-right">
                <button className={`toolbar-toggle ${toolbarStyle.bold ? "active" : ""}`} onClick={() => updateObjectStyle({ fontWeight: toolbarStyle.bold ? "normal" : "bold" })}>B</button>
                <button className={`toolbar-toggle ${toolbarStyle.italic ? "active" : ""}`} onClick={() => updateObjectStyle({ fontStyle: toolbarStyle.italic ? "normal" : "italic" })}>I</button>
                <button className={`toolbar-toggle ${toolbarStyle.underline ? "active" : ""}`} onClick={() => updateObjectStyle({ underline: !toolbarStyle.underline })}>U</button>
              </div>
            </>
          )}

          {isMobile && (
            <div className="toolbar-group toolbar-group-right">
              <button className={`toolbar-toggle ${toolbarStyle.bold ? "active" : ""}`} onClick={() => updateObjectStyle({ fontWeight: toolbarStyle.bold ? "normal" : "bold" })}>B</button>
              <button className={`toolbar-toggle ${toolbarStyle.italic ? "active" : ""}`} onClick={() => updateObjectStyle({ fontStyle: toolbarStyle.italic ? "normal" : "italic" })}>I</button>
            </div>
          )}
        </div>

        {/* Canvas wrapper */}
        <div className="create-page-shell" ref={wrapperRef}>
          <div 
            className="canvas-frame"
            style={{ transform: `scale(${canvasScale})`, transformOrigin: "top center" }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Mobile: floating export button */}
        {isMobile && !showTools && (
          <button className="mobile-fab-export" onClick={exportToPdf}>
            <Download size={22} />
          </button>
        )}
      </section>
    </div>
  );
}