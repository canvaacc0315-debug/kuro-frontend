// src/components/CreatePdfPanel.jsx
import { useState, useRef, useEffect } from "react";
import "../styles/create-editor.css";
import { jsPDF } from "jspdf";
import * as fabric from "fabric";
import {
  Download, Type, Square, Circle, Trash2, Settings,
  ChevronDown, Image as ImageIcon, Triangle,
  Minus, Star, RotateCw, Layers, Eye, Palette,
  Copy, Plus, ArrowLeft, ArrowRight
} from "lucide-react";

// Base canvas dimensions (A4-ish ratio)
const BASE_W = 600;
const BASE_H = 800;

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function CreatePdfPanel({ onExportPdf }) {
  // states
  const [activeObject, setActiveObject] = useState(null);
  const [toolbarStyle, setToolbarStyle] = useState({
    fontSize: 26, color: "#000000", bold: false, italic: false,
    underline: false, align: "left", opacity: 1, angle: 0
  });
  const [showTools, setShowTools] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [canvasScale, setCanvasScale] = useState(1);
  const [activeSection, setActiveSection] = useState("text"); // mobile section tabs

  // Multi-page state
  const [pages, setPages] = useState([{ id: generateId(), data: null, bg: "#ffffff" }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
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

    // Set globally visible Canva-style selection styles
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#dc2626', // Red accent
      borderColor: '#dc2626',
      cornerSize: 10,
      padding: 8,
      cornerStyle: 'circle',
      borderDashArray: [4, 4]
    });

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: BASE_W,
      height: BASE_H,
      backgroundColor: pages[currentPageIndex].bg,
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

    // Initial load of current page
    if (pages[currentPageIndex].data) {
      canvas.loadFromJSON(pages[currentPageIndex].data).then(() => {
        canvas.renderAll();
      });
    }

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
        // Adjusted padding for safe areas on mobile
        const padX = isMobile ? 32 : 80;
        const padY = isMobile ? 64 : 80;
        const availW = width - padX;
        const availH = height - padY;
        const scaleW = availW / BASE_W;
        const scaleH = availH / BASE_H;
        let scale = Math.min(scaleW, scaleH, 1.2);
        
        // Prevent extreme tiny scales on weird resizes
        scale = Math.max(0.2, scale);
        setCanvasScale(scale);
      }
    });

    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [isMobile]);

  // --- MULTI PAGE LOGIC ---
  const saveCurrentPage = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const data = canvas.toJSON();
    const bg = canvas.backgroundColor;
    setPages(prev => {
      const newPages = [...prev];
      newPages[currentPageIndex] = {
        ...newPages[currentPageIndex],
        data,
        bg
      };
      return newPages;
    });
  };

  const switchPage = (newIndex) => {
    if (newIndex < 0 || newIndex >= pages.length || newIndex === currentPageIndex) return;
    
    // 1. Save current
    saveCurrentPage();
    
    // 2. Prepare switch
    setCurrentPageIndex(newIndex);
    const canvas = fabricRef.current;
    if (!canvas) return;
    
    // 3. Clear and load
    canvas.clear();
    const nextBg = pages[newIndex].bg || "#ffffff";
    canvas.backgroundColor = nextBg;
    
    if (pages[newIndex].data) {
      canvas.loadFromJSON(pages[newIndex].data).then(() => {
        canvas.renderAll();
      });
    } else {
      canvas.renderAll();
    }
    setActiveObject(null);
  };

  const addPage = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const data = canvas.toJSON();
    const bg = canvas.backgroundColor;
    setPages(prev => {
      const newPages = [...prev];
      newPages[currentPageIndex] = {
        ...newPages[currentPageIndex],
        data,
        bg
      };
      return [...newPages, { id: generateId(), data: null, bg: "#ffffff" }];
    });
    const newIndex = pages.length;
    setCurrentPageIndex(newIndex);
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();
    setActiveObject(null);
  };

  const deletePage = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (pages.length <= 1) {
      // Cannot delete last page, just clear it
      canvas.clear();
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();
      setPages([{ id: generateId(), data: null, bg: "#ffffff" }]);
      return;
    }

    const nextIndex = currentPageIndex > 0 ? currentPageIndex - 1 : 0;
    let targetPage;
    if (currentPageIndex > 0) {
        targetPage = pages[currentPageIndex - 1]; // Next index is the previous page
    } else {
        targetPage = pages[1]; // We are deleting 0, so next page is old index 1
    }

    canvas.clear();
    canvas.backgroundColor = targetPage.bg || "#ffffff";
    if (targetPage.data) {
        canvas.loadFromJSON(targetPage.data).then(() => canvas.renderAll());
    } else {
        canvas.renderAll();
    }
    
    setPages(prev => prev.filter((_, idx) => idx !== currentPageIndex));
    setCurrentPageIndex(nextIndex);
    setActiveObject(null);
  };

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
      saveCurrentPage(); // auto-save on style change
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
    saveCurrentPage();
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
        shape = new fabric.Rect({ left: baseLeft, top: baseTop, fill: "#3b82f6", width: 120, height: 80, rx: 8, ry: 8 });
        break;
      case "circle":
        shape = new fabric.Circle({ left: baseLeft, top: baseTop, fill: "#ef4444", radius: 50 });
        break;
      case "triangle":
        shape = new fabric.Triangle({ left: baseLeft, top: baseTop, fill: "#f59e0b", width: 100, height: 100 });
        break;
      case "line":
        shape = new fabric.Line([0, 0, 200, 0], { left: baseLeft, top: baseTop, stroke: "#6366f1", strokeWidth: 3, fill: "", selectable: true });
        break;
      case "star": {
        const points = [];
        const outerR = 50, innerR = 22;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
        }
        shape = new fabric.Polygon(points, { left: baseLeft, top: baseTop, fill: "#eab308", strokeWidth: 0 });
        break;
      }
      default: return;
    }
    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      saveCurrentPage();
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
        saveCurrentPage();
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
      saveCurrentPage();
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
      saveCurrentPage();
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
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
    if (activeObj) { canvas.bringObjectToFront(activeObj); canvas.renderAll(); saveCurrentPage(); }
  };
  
  const sendToBack = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) { canvas.sendObjectToBack(activeObj); canvas.renderAll(); saveCurrentPage(); }
  };

  // Multi-page Async Export
  const exportToPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);

    const canvas = fabricRef.current;
    if (!canvas) return setIsExporting(false);

    // Initial discard
    canvas.discardActiveObject();
    canvas.renderAll();

    const latestData = canvas.toJSON();
    const latestBg = canvas.backgroundColor;

    const finalPages = pages.map((page, index) => {
        if (index === currentPageIndex) {
            return { ...page, data: latestData, bg: latestBg };
        }
        return page;
    });

    // Eagerly sync React state
    setPages(finalPages);

    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const scale = pdfWidth / BASE_W;
    const finalHeight = BASE_H * scale;

    try {
        for (let i = 0; i < finalPages.length; i++) {
            const p = finalPages[i];
            canvas.clear();
            canvas.backgroundColor = p.bg || "#ffffff";
            
            if (p.data) {
                await canvas.loadFromJSON(p.data);
            }
            canvas.renderAll();
    
            const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
            
            if (i > 0) pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, finalHeight);
        }
    
        pdf.save("rovexai-design.pdf");
        if (onExportPdf) onExportPdf();
        
        // Restore the original viewed page
        canvas.clear();
        canvas.backgroundColor = finalPages[currentPageIndex].bg || "#ffffff";
        if (finalPages[currentPageIndex].data) {
            await canvas.loadFromJSON(finalPages[currentPageIndex].data);
        }
        canvas.renderAll();
    } catch(err) {
        console.error("PDF Export failed", err);
    } finally {
        setIsExporting(false);
    }
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    if (activeObject) {
      updateObjectStyle({ fill: color });
    } else {
      setPages(prev => {
          const newPages = [...prev];
          newPages[currentPageIndex] = { ...newPages[currentPageIndex], bg: color };
          return newPages;
      });
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
                <input type="color" value={pages[currentPageIndex]?.bg || "#ffffff"} onChange={handleColorChange} className="toolbar-color-picker" />
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
            <button className="sidebar-export-btn" onClick={exportToPdf} disabled={isExporting}>
              <Download size={20} /> <span className="btn-text">{isExporting ? "Exporting..." : "Export PDF"}</span>
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

        {/* Canvas wrapper - CRITICAL FIX FOR MULTI-PAGE & OVERFLOW */}
        <div className="create-page-shell" ref={wrapperRef}>
          {/* Inner constraint wrapper forces scrollable area bounds exactly equal to scaled canvas */}
          <div 
            className="canvas-bounding-box"
            style={{ 
              width: BASE_W * canvasScale, 
              height: BASE_H * canvasScale,
              position: 'relative',
              margin: '0 auto', /* Center canvas horizontally in scrolling area */
              flexShrink: 0  /* Ensure flex parent doesn't squish */
            }}
          >
            <div 
              className="canvas-frame"
              style={{ 
                transform: `scale(${canvasScale})`, 
                transformOrigin: "top left",
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>
          
          {/* Page Navigation Overlay */}
          <div className="page-navigation-bar">
             <button title="Previous Page" className="page-nav-btn" disabled={currentPageIndex === 0} onClick={() => switchPage(currentPageIndex - 1)}>
                <ArrowLeft size={16} />
             </button>
             <span className="page-nav-text">Page {currentPageIndex + 1} / {pages.length}</span>
             <button title="Next Page" className="page-nav-btn" disabled={currentPageIndex === pages.length - 1} onClick={() => switchPage(currentPageIndex + 1)}>
                <ArrowRight size={16} />
             </button>
             <div className="page-nav-divider"></div>
             <button title="Add Page" className="page-nav-btn success" onClick={addPage}>
                <Plus size={16} />
             </button>
             <button title="Delete Page" className="page-nav-btn danger" onClick={deletePage}>
                <Trash2 size={16} />
             </button>
          </div>
        </div>

        {/* Mobile: floating export button */}
        {isMobile && !showTools && (
          <button className="mobile-fab-export" onClick={exportToPdf} disabled={isExporting}>
            <Download size={22} />
          </button>
        )}
      </section>
    </div>
  );
}
