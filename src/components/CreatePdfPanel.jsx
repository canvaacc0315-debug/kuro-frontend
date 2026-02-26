// src/components/CreatePdfPanel.jsx
import { useState, useRef, useCallback } from "react";
import "../styles/create-editor.css";
import { jsPDF } from "jspdf"; // for frontend PDF export

const defaultTextStyle = {
  fontSize: 16,
  align: "left",
  bold: false,
  italic: false,
  underline: false,
  color: "#000000",
};

const createPage = (index) => ({
  id: `page-${index}`,
  backgroundColor: "#ffffff",
  texts: [
    {
      id: `text-initial-heading-${index}`,
      text: "Add a heading",
      x: 150,
      y: 100,
      width: 300,
      zIndex: 1,
      style: {
        ...defaultTextStyle,
        fontSize: 26,
        bold: true,
      },
    }
  ],
  shapes: [], // { id, type: 'rect' | 'circle', x, y, width, height, fill, zIndex }
  images: [], // { id, src, format, scale, x, y, zIndex }
});

const makeImageId = () => `img-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const makeTextId = () => `txt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const makeShapeId = () => `shp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const UNDO_REDO_LIMIT = 20;

export default function CreatePdfPanel({ onExportPdf }) {
  const [pages, setPages] = useState([createPage(1)]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [history, setHistory] = useState([]); // array of pages snapshots
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [activeTextId, setActiveTextId] = useState(null);
  const [activeShapeId, setActiveShapeId] = useState(null);
  const [toolbarStyle, setToolbarStyle] = useState(defaultTextStyle);

  const [activeImageId, setActiveImageId] = useState(null);

  const [dragState, setDragState] = useState(null); // { type, id, offsetX, offsetY }

  const [contextMenu, setContextMenu] = useState(null); // { x, y, type, id }
  const [imageClipboard, setImageClipboard] = useState(null); // { src, scale, format }

  const pageRef = useRef(null);

  const page = pages[activePageIndex];

  /* ------------ helpers ------------ */
  const saveToHistory = useCallback((newPages) => {
    setHistory((prev) => {
      const newHist = prev.slice(0, historyIndex + 1); // Trim future
      newHist.push(newPages);
      return newHist.slice(-UNDO_REDO_LIMIT); // Limit size
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const updatePage = useCallback((updater) => {
    setPages((prev) => {
      const newPages = prev.map((p, idx) => (idx === activePageIndex ? updater(p) : p));
      if (historyIndex < history.length - 1) {
        // If not at tip, reset history to current snapshot
        setHistory([newPages]);
        setHistoryIndex(0);
      } else {
        saveToHistory(newPages);
      }
      return newPages;
    });
  }, [activePageIndex, history, historyIndex, saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevPages = history[newIndex];
      setHistoryIndex(newIndex);
      setPages(prevPages);
      setActivePageIndex((prevIdx) => Math.min(prevIdx, prevPages.length - 1));
      // Reset dependent states
      setActiveImageId(null);
      setActiveTextId(null);
      setActiveShapeId(null);
      setContextMenu(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextPages = history[newIndex];
      setHistoryIndex(newIndex);
      setPages(nextPages);
      setActivePageIndex((prevIdx) => Math.min(prevIdx, nextPages.length - 1));
      // Reset dependent states
      setActiveImageId(null);
      setActiveTextId(null);
      setActiveShapeId(null);
      setContextMenu(null);
    }
  }, [history, historyIndex]);

  const applyStyleToSelection = useCallback((patch) => {
    setToolbarStyle((prev) => ({ ...prev, ...patch }));

    if (activeTextId) {
      updatePage((p) => ({
        ...p,
        texts: p.texts.map((txt) =>
          txt.id === activeTextId
            ? { ...txt, style: { ...txt.style, ...patch } }
            : txt
        ),
      }));
    }
  }, [activeTextId, updatePage]);

  /* ------------ toolbar ------------ */

  const handleSizeChange = useCallback((e) => {
    const v = parseInt(e.target.value || "16", 10);
    applyStyleToSelection({ fontSize: isNaN(v) ? 16 : Math.max(8, Math.min(120, v)) });
  }, [applyStyleToSelection]);

  const handleAlignChange = useCallback((align) => {
    applyStyleToSelection({ align });
  }, [applyStyleToSelection]);

  const toggleStyleFlag = useCallback((key) => {
    applyStyleToSelection({ [key]: !toolbarStyle[key] });
  }, [toolbarStyle, applyStyleToSelection]);

  const handleColorChange = useCallback((color) => {
    applyStyleToSelection({ color });
  }, [applyStyleToSelection]);

  /* ------------ text change ------------ */

  const handleTextChange = useCallback((id, newText) => {
    updatePage((p) => ({
      ...p,
      texts: p.texts.map((txt) =>
        txt.id === id ? { ...txt, text: newText } : txt
      ),
    }));
  }, [updatePage]);

  /* ------------ images: insert + drag + size slider ------------ */

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64Src = loadEvent.target.result;
      const imgFormat = file.type.startsWith("image/png") ? "PNG" : "JPEG";
      const newImg = {
        id: makeImageId(),
        src: base64Src, // data: base64 URL for both display and PDF
        format: imgFormat,
        scale: 60,
        x: 120,
        y: 220,
        zIndex: 10,
      };

      updatePage((p) => ({
        ...p,
        images: [...p.images, newImg],
      }));
      setActiveImageId(newImg.id);
    };
    reader.readAsDataURL(file);

    // allow picking same file again
    e.target.value = "";
  }, [updatePage]);

  const handleElementMouseDown = useCallback((e, element, type) => {
    if (!pageRef.current) return;
    e.stopPropagation();
    e.preventDefault();

    const pageRect = pageRef.current.getBoundingClientRect();
    const pointerX = e.clientX - pageRect.left;
    const pointerY = e.clientY - pageRect.top;

    setDragState({
      type,
      id: element.id,
      offsetX: pointerX - element.x,
      offsetY: pointerY - element.y,
    });

    if (type === "image") {
      setActiveImageId(element.id);
      setActiveTextId(null);
      setActiveShapeId(null);
    } else if (type === "text") {
      setActiveTextId(element.id);
      setActiveImageId(null);
      setActiveShapeId(null);
    } else if (type === "shape") {
      setActiveShapeId(element.id);
      setActiveImageId(null);
      setActiveTextId(null);
    }
  }, []);

  const handlePageMouseMove = useCallback((e) => {
    if (!dragState || !pageRef.current) return;

    const pageRect = pageRef.current.getBoundingClientRect();
    const pointerX = e.clientX - pageRect.left;
    const pointerY = e.clientY - pageRect.top;

    const newX = Math.max(0, Math.min(pointerX - dragState.offsetX, 600));
    const newY = Math.max(0, Math.min(pointerY - dragState.offsetY, 800));

    updatePage((p) => {
      if (dragState.type === "image") {
        return {
          ...p,
          images: p.images.map((img) =>
            img.id === dragState.id ? { ...img, x: newX, y: newY } : img
          ),
        };
      } else if (dragState.type === "shape") {
        return {
          ...p,
          shapes: p.shapes.map((shp) =>
            shp.id === dragState.id ? { ...shp, x: newX, y: newY } : shp
          ),
        };
      } else if (dragState.type === "resize-shape") {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        return {
          ...p,
          shapes: p.shapes.map((shp) =>
            shp.id === dragState.id ? { ...shp, width: Math.max(10, dragState.startW + dx), height: Math.max(10, dragState.startH + dy) } : shp
          ),
        };
      }
      return p;
    });
  }, [dragState, updatePage]);

  const handlePageMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleImageScaleChange = useCallback((e, imgId) => {
    const scale = Math.max(30, Math.min(150, Number(e.target.value) || 60));
    updatePage((p) => ({
      ...p,
      images: p.images.map((img) =>
        img.id === imgId ? { ...img, scale } : img
      ),
    }));
  }, [updatePage]);

  const activeImage =
    page.images.length === 0
      ? null
      : page.images.find((i) => i.id === activeImageId) ||
      page.images[page.images.length - 1];

  /* ------------ pages ------------ */

  const handleAddPage = useCallback(() => {
    const newPage = createPage(pages.length + 1);
    const newIndex = pages.length;
    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(newIndex);
    setActiveTextId(newPage.texts[0].id);
    setToolbarStyle(newPage.texts[0].style);
    setActiveImageId(null);
    setContextMenu(null);
  }, [pages.length]);

  const handleDeletePage = useCallback(() => {
    if (pages.length === 1) return;
    const newIndex = Math.max(0, activePageIndex - 1);
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(activePageIndex, 1);
      return copy;
    });
    setActivePageIndex(newIndex);
    setActiveTextId(null);
    setActiveImageId(null);
    setContextMenu(null);
  }, [pages.length, activePageIndex]);

  /* ------------ context menu ------------ */

  const openContextMenu = useCallback((e, type, id) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type, // 'text' | 'image'
      id: id || null,
    });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextAction = useCallback(async (action) => {
    if (!contextMenu) return;

    if (contextMenu.type === "image") {
      const imgId = contextMenu.id;
      const img = page.images.find((i) => i.id === imgId);

      if (!img && action !== "paste") {
        closeContextMenu();
        return;
      }

      if (action === "copy" && img) {
        setImageClipboard({ src: img.src, scale: img.scale, format: img.format });
      }

      if (action === "cut" && img) {
        setImageClipboard({ src: img.src, scale: img.scale, format: img.format });
        updatePage((p) => ({
          ...p,
          images: p.images.filter((i) => i.id !== imgId),
        }));
        if (activeImageId === imgId) setActiveImageId(null);
      }

      if (action === "front" && img) {
        updatePage((p) => ({
          ...p,
          images: p.images.map(i => i.id === imgId ? { ...i, zIndex: Math.max(...p.images.map(img => img.zIndex || 0), ...p.texts.map(txt => txt.zIndex || 0)) + 1 } : i),
        }));
      }

      if (action === "back" && img) {
        updatePage((p) => ({
          ...p,
          images: p.images.map(i => i.id === imgId ? { ...i, zIndex: Math.min(...p.images.map(img => img.zIndex || 0), ...p.texts.map(txt => txt.zIndex || 0)) - 1 } : i),
        }));
      }

      if (action === "delete" && img) {
        updatePage((p) => ({
          ...p,
          images: p.images.filter((i) => i.id !== imgId),
        }));
        if (activeImageId === imgId) setActiveImageId(null);
      }

      if (action === "paste" && imageClipboard) {
        const base = imageClipboard;
        updatePage((p) => {
          const ref =
            p.images.find((i) => i.id === imgId) ||
            p.images[p.images.length - 1] || { x: 120, y: 220 };
          const newImg = {
            id: makeImageId(),
            src: base.src,
            format: base.format,
            scale: base.scale ?? 60,
            x: Math.min((ref.x ?? 120) + 24, 500),
            y: Math.min((ref.y ?? 220) + 24, 700),
          };
          return { ...p, images: [...p.images, newImg] };
        });
      }

      closeContextMenu();
      return;
    }

    // TEXT actions
    if (contextMenu.type === "text") {
      const txtId = contextMenu.id;
      const txt = page.texts.find((t) => t.id === txtId);

      if (!txt) {
        closeContextMenu();
        return;
      }

      const value = txt.text;

      if (action === "front") {
        updatePage((p) => ({
          ...p,
          texts: p.texts.map(t => t.id === txtId ? { ...t, zIndex: Math.max(...p.images.map(img => img.zIndex || 0), ...p.texts.map(text => text.zIndex || 0)) + 1 } : t),
        }));
      }

      if (action === "back") {
        updatePage((p) => ({
          ...p,
          texts: p.texts.map(t => t.id === txtId ? { ...t, zIndex: Math.min(...p.images.map(img => img.zIndex || 0), ...p.texts.map(text => text.zIndex || 0)) - 1 } : t),
        }));
      }

      if (action === "copy") {
        if (value) {
          try {
            await navigator.clipboard.writeText(value);
          } catch { }
        }
      }

      if (action === "cut") {
        if (value) {
          try {
            await navigator.clipboard.writeText(value);
          } catch { }
        }
        updatePage((p) => ({
          ...p,
          texts: p.texts.filter((t) => t.id !== txtId),
        }));
        if (activeTextId === txtId) setActiveTextId(null);
      }

      if (action === "delete") {
        updatePage((p) => ({
          ...p,
          texts: p.texts.filter((t) => t.id !== txtId),
        }));
        if (activeTextId === txtId) setActiveTextId(null);
      }

      if (action === "paste") {
        try {
          const clip = await navigator.clipboard.readText();
          handleTextChange(txtId, value + clip);
        } catch { }
      }
    }

    if (contextMenu.type === "shape") {
      const shpId = contextMenu.id;
      const shp = page.shapes.find((s) => s.id === shpId);

      if (!shp) {
        closeContextMenu();
        return;
      }

      if (action === "front") {
        updatePage((p) => ({
          ...p,
          shapes: p.shapes.map(s => s.id === shpId ? { ...s, zIndex: Math.max(...p.images.map(img => img.zIndex || 0), ...p.texts.map(t => t.zIndex || 0), ...p.shapes.map(sh => sh.zIndex || 0)) + 1 } : s),
        }));
      }

      if (action === "back") {
        updatePage((p) => ({
          ...p,
          shapes: p.shapes.map(s => s.id === shpId ? { ...s, zIndex: Math.min(...p.images.map(img => img.zIndex || 0), ...p.texts.map(t => t.zIndex || 0), ...p.shapes.map(sh => sh.zIndex || 0)) - 1 } : s),
        }));
      }

      if (action === "delete") {
        updatePage((p) => ({
          ...p,
          shapes: p.shapes.filter((s) => s.id !== shpId),
        }));
        if (activeShapeId === shpId) setActiveShapeId(null);
      }
    }

    closeContextMenu();
  }, [contextMenu, page.images, page.texts, page.shapes, activeImageId, activeTextId, activeShapeId, imageClipboard, closeContextMenu, updatePage, handleTextChange]);

  /* ------------ inline text styles ------------ */

  const getTextInlineStyle = (s) => {
    if (!s) return {};
    return {
      fontSize: s.fontSize,
      fontWeight: s.bold ? 700 : 400,
      fontStyle: s.italic ? "italic" : "normal",
      textDecoration: s.underline ? "underline" : "none",
      textAlign: s.align,
      color: s.color || "#000000",
    };
  };

  /* ------------ FRONTEND PDF EXPORT (fixed with base64 + align support) ------------ */

  const loadImageDimensions = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      // Only set crossOrigin for http/https sources
      if (src.startsWith("http")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        console.log("Image loaded successfully:", src);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = (err) => {
        console.error("Image load failed:", src, err);
        resolve({ width: 400, height: 300 }); // Fallback
      };
      img.src = src;
    });

  const EDITOR_WIDTH = 600;
  const EDITOR_HEIGHT = 800;
  const PDF_WIDTH = 595;
  const PDF_HEIGHT = 842;
  const SCALE_FACTOR_X = PDF_WIDTH / EDITOR_WIDTH;
  const SCALE_FACTOR_Y = PDF_HEIGHT / EDITOR_HEIGHT;

  // Helper to compute alignment offset for a line
  const getAlignOffset = (pdf, line, contentWidth, align) => {
    const lineWidth = pdf.getTextWidth(line);
    if (align === "center") {
      return (contentWidth - lineWidth) / 2;
    } else if (align === "right") {
      return contentWidth - lineWidth;
    }
    return 0;
  };

  const exportToPdf = async () => {
    try {
      if (!pages || pages.length === 0) {
        alert("Nothing to export — add a page first.");
        return;
      }

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];

        if (i > 0) pdf.addPage();

        // page background
        if (p.backgroundColor && p.backgroundColor !== "#ffffff") {
          const [r, g, b] = hexToRgb(p.backgroundColor);
          pdf.setFillColor(r, g, b);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        }

        // freeform texts
        for (const t of p.texts || []) {
          const style = t.style || {};
          const fontSize = style.fontSize || 16;
          pdf.setFontSize(fontSize);

          const computeFontStyle = (s) => {
            const bold = !!s.bold;
            const italic = !!s.italic;
            if (bold && italic) return "bolditalic";
            if (bold) return "bold";
            if (italic) return "italic";
            return "normal";
          };
          pdf.setFont("helvetica", computeFontStyle(style));

          pdf.setTextColor(0, 0, 0);
          if (style.color) {
            const [r, g, b] = hexToRgb(style.color);
            pdf.setTextColor(r, g, b);
          }

          const textX = margin + (t.x || 0) * SCALE_FACTOR_X;
          let textY = margin + (t.y || 0) * SCALE_FACTOR_Y + (fontSize * 0.8); // + font ascender

          const boxWidth = (t.width || 300) * SCALE_FACTOR_X;
          const textLines = pdf.splitTextToSize(t.text || "", boxWidth);

          for (const line of textLines) {
            const offset = getAlignOffset(pdf, line, boxWidth, style.align);
            pdf.text(line, textX + offset, textY);
            textY += fontSize * 1.2;
          }
        }

        // shapes
        for (const shp of p.shapes || []) {
          const shpX = margin + (shp.x || 0) * SCALE_FACTOR_X;
          const shpY = margin + (shp.y || 0) * SCALE_FACTOR_Y;
          const shpW = (shp.width || 100) * SCALE_FACTOR_X;
          const shpH = (shp.height || 100) * SCALE_FACTOR_Y;

          if (shp.fill) {
            const [r, g, b] = hexToRgb(shp.fill);
            pdf.setFillColor(r, g, b);
          } else {
            pdf.setFillColor(200, 200, 200);
          }

          if (shp.type === "rect") {
            pdf.rect(shpX, shpY, shpW, shpH, 'F');
          } else if (shp.type === "circle") {
            // pdf.circle wants center X, center Y, and Radius. 
            // since x, y are top-left bounding box, we calc radius = w/2.
            const rX = shpW / 2;
            const rY = shpH / 2;
            pdf.circle(shpX + rX, shpY + rY, rX, 'F');
          }
        }

        // images
        for (const img of p.images || []) {
          try {
            console.log("Attempting to add image:", img.src);

            const { width: imgW, height: imgH } = await loadImageDimensions(img.src);

            const targetW = ((img.scale || 60) / 100) * contentWidth;
            let targetH = targetW * (imgH && imgW ? imgH / imgW : 0.6);

            if (!targetH || Number.isNaN(targetH) || targetH <= 0) {
              targetH = targetW * 0.6;
            }

            const imgX = margin + (img.x || 0) * SCALE_FACTOR_X;
            const imgY = margin + (img.y || 0) * SCALE_FACTOR_Y;

            const imgFormat = img.format || "JPEG";
            pdf.addImage(img.src, imgFormat, imgX, imgY, targetW, targetH);

            console.log("Image added:", { imgX, imgY, targetW, targetH });

            if (imgY + targetH > cursorY) {
              cursorY = imgY + targetH + 12;
            }
          } catch (err) {
            console.error("Failed to add image to PDF:", img.src, err);
          }
        }

        // page number footer
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i + 1} of ${pages.length}`, pageWidth / 2, pageHeight - 20, { align: "center" });
      }

      pdf.save("rovexai-created.pdf");

      if (typeof onExportPdf === "function") {
        onExportPdf(pages);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed: " + (err?.message || err));
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  /* ------------ render ------------ */

  return (
    <div className="create-editor-root">
      {/* SIDEBAR */}
      <aside className="create-editor-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">Text Options</div>
          <button
            type="button"
            className="sidebar-primary-btn"
            onClick={() => {
              const newTextId = makeTextId();
              updatePage(p => ({
                ...p,
                texts: [
                  ...p.texts,
                  {
                    id: newTextId,
                    text: "New heading",
                    x: 150,
                    y: (p.texts.length * 30 + 100) % 600,
                    width: 300,
                    zIndex: 10,
                    style: { ...defaultTextStyle, fontSize: 26, bold: true },
                  }
                ]
              }));
              setActiveTextId(newTextId);
            }}
            aria-label="Add a heading"
          >
            <span className="sidebar-primary-icon">T</span>
            Add a heading
          </button>
          <button
            type="button"
            className="text-style-card text-style-body"
            onClick={() => {
              const newTextId = makeTextId();
              updatePage(p => ({
                ...p,
                texts: [
                  ...p.texts,
                  {
                    id: newTextId,
                    text: "New body text",
                    x: 100,
                    y: (p.texts.length * 50 + 200) % 600,
                    width: 400,
                    zIndex: 10,
                    style: { ...defaultTextStyle, fontSize: 16 },
                  }
                ]
              }));
              setActiveTextId(newTextId);
            }}
            aria-label="Add body text"
          >
            <div className="text-style-main">Add body text</div>
            <div className="text-style-sub">
              Click to focus main document body
            </div>
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Page Styling</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Background</span>
            <input
              type="color"
              value={page.backgroundColor || "#ffffff"}
              onChange={(e) => updatePage(p => ({ ...p, backgroundColor: e.target.value }))}
              className="toolbar-color-picker"
              style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
              aria-label="Page background color"
            />
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Elements</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="sidebar-pill-btn"
              style={{ flex: 1, justifyContent: "center" }}
              title="Add Rectangle"
              onClick={() => {
                const newShapeId = makeShapeId();
                updatePage((p) => ({
                  ...p,
                  shapes: [
                    ...(p.shapes || []),
                    {
                      id: newShapeId,
                      type: "rect",
                      x: 100,
                      y: 100,
                      width: 150,
                      height: 100,
                      fill: toolbarStyle.color || "#3b82f6",
                      zIndex: 10,
                    },
                  ],
                }));
                setActiveShapeId(newShapeId);
              }}
            >
              ⬛ Rect
            </button>
            <button
              type="button"
              className="sidebar-pill-btn"
              style={{ flex: 1, justifyContent: "center" }}
              title="Add Circle"
              onClick={() => {
                const newShapeId = makeShapeId();
                updatePage((p) => ({
                  ...p,
                  shapes: [
                    ...(p.shapes || []),
                    {
                      id: newShapeId,
                      type: "circle",
                      x: 150,
                      y: 150,
                      width: 100,
                      height: 100,
                      fill: toolbarStyle.color || "#ef4444",
                      zIndex: 10,
                    },
                  ],
                }));
                setActiveShapeId(newShapeId);
              }}
            >
              🔴 Circle
            </button>
          </div>
          <label className="sidebar-pill-btn" style={{ justifyContent: 'center' }}>
            <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Upload image
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
              aria-label="Upload image"
            />
          </label>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">History</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <button
              type="button"
              className="sidebar-pill-btn"
              style={{ flex: 1 }}
              onClick={undo}
              disabled={historyIndex <= 0}
              aria-label="Undo"
            >
              <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              Undo
            </button>
            <button
              type="button"
              className="sidebar-pill-btn"
              style={{ flex: 1 }}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              aria-label="Redo"
            >
              Redo
              <svg style={{ width: '16px', height: '16px', marginLeft: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
            </button>
          </div>
        </div>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-export-btn"
            onClick={exportToPdf}
            aria-label="Export PDF"
          >
            Export PDF
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <section className="create-editor-main">
        {/* Toolbar */}
        <div
          className="create-toolbar"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="toolbar-group">
            <span className="toolbar-label">Size</span>
            <input
              className="toolbar-input"
              type="number"
              min={8}
              max={120}
              value={toolbarStyle.fontSize}
              onChange={handleSizeChange}
              aria-label="Font size"
            />
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Color</span>
            <input
              type="color"
              value={toolbarStyle.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="toolbar-color-picker"
              aria-label="Text color"
            />
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Align</span>
            <div className="toolbar-toggle-group">
              <button
                type="button"
                className={
                  "toolbar-toggle" +
                  (toolbarStyle.align === "left" ? " active" : "")
                }
                onClick={() => handleAlignChange("left")}
                aria-label="Align left"
              >
                ☰
              </button>
              <button
                type="button"
                className={
                  "toolbar-toggle" +
                  (toolbarStyle.align === "center" ? " active" : "")
                }
                onClick={() => handleAlignChange("center")}
                aria-label="Align center"
              >
                ≡
              </button>
              <button
                type="button"
                className={
                  "toolbar-toggle" +
                  (toolbarStyle.align === "right" ? " active" : "")
                }
                onClick={() => handleAlignChange("right")}
                aria-label="Align right"
              >
                ☷
              </button>
            </div>
          </div>

          <div className="toolbar-group toolbar-group-right">
            <button
              type="button"
              className={
                "toolbar-toggle" + (toolbarStyle.bold ? " active" : "")
              }
              onClick={() => toggleStyleFlag("bold")}
              aria-label="Bold"
            >
              B
            </button>
            <button
              type="button"
              className={
                "toolbar-toggle" + (toolbarStyle.italic ? " active" : "")
              }
              onClick={() => toggleStyleFlag("italic")}
              aria-label="Italic"
            >
              I
            </button>
            <button
              type="button"
              className={
                "toolbar-toggle" + (toolbarStyle.underline ? " active" : "")
              }
              onClick={() => toggleStyleFlag("underline")}
              aria-label="Underline"
            >
              U
            </button>
          </div>
        </div>

        {/* PAGE */}
        <div
          className="create-page-shell"
          onMouseMove={handlePageMouseMove}
          onMouseUp={handlePageMouseUp}
          onMouseLeave={handlePageMouseUp}
          role="main"
          aria-label="PDF editor canvas"
        >
          <div
            className="create-page"
            ref={pageRef}
            style={{ backgroundColor: page.backgroundColor || "#ffffff" }}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => {
              setActiveTextId(null);
              setActiveImageId(null);
            }}
          >
            {/* SHAPES */}
            {page.shapes && page.shapes.map((shp) => (
              <div
                key={shp.id}
                style={{
                  position: "absolute",
                  left: shp.x,
                  top: shp.y,
                  width: shp.width,
                  height: shp.height,
                  cursor: dragState?.id === shp.id ? "grabbing" : "grab",
                  zIndex: activeShapeId === shp.id ? 999 : (shp.zIndex || 10),
                  borderRadius: shp.type === "circle" ? "50%" : "0",
                  backgroundColor: shp.fill || "#000000",
                  border: activeShapeId === shp.id ? "2px solid #3b82f6" : "none",
                  boxShadow: activeShapeId === shp.id ? "0 0 0 2px white inset" : "none"
                }}
                onMouseDown={(e) => handleElementMouseDown(e, shp, "shape")}
                onContextMenu={(e) => openContextMenu(e, "shape", shp.id)}
              >
                {activeShapeId === shp.id && (
                  <div
                    style={{
                      position: "absolute",
                      right: "-8px",
                      bottom: "-8px",
                      width: "16px",
                      height: "16px",
                      backgroundColor: "#3b82f6",
                      borderRadius: "50%",
                      cursor: "se-resize",
                      zIndex: 20
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDragState({ type: "resize-shape", id: shp.id, startX: e.clientX, startY: e.clientY, startW: shp.width, startH: shp.height });
                    }}
                  />
                )}
              </div>
            ))}

            {/* Freeform Texts */}
            {page.texts.map((txt) => (
              <div
                key={txt.id}
                style={{
                  position: "absolute",
                  left: txt.x,
                  top: txt.y,
                  width: txt.width,
                  cursor: dragState?.id === txt.id ? "grabbing" : "text",
                  zIndex: activeTextId === txt.id ? 999 : (txt.zIndex || 10),
                  padding: "4px",
                  border: activeTextId === txt.id ? "1px solid #3b82f6" : "1px solid transparent",
                  borderRadius: "4px",
                  backgroundColor: "transparent"
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setActiveTextId(txt.id);
                  setToolbarStyle(txt.style);
                  setActiveImageId(null);
                }}
                onContextMenu={(e) => openContextMenu(e, "text", txt.id)}
              >
                <div
                  onMouseDown={(e) => handleElementMouseDown(e, txt, "text")}
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "-12px",
                    width: "24px",
                    height: "24px",
                    cursor: "move",
                    backgroundColor: "transparent",
                    display: activeTextId === txt.id ? "block" : "none",
                    zIndex: 20
                  }}
                  title="Drag to move"
                >
                  <svg style={{ width: "100%", height: "100%", color: "#3b82f6", background: "white", borderRadius: "50%", padding: "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                <textarea
                  className="heading-textarea allow-overflow"
                  value={txt.text}
                  onChange={(e) => handleTextChange(txt.id, e.target.value)}
                  style={{ ...getTextInlineStyle(txt.style), minHeight: "40px", cursor: "text" }}
                  placeholder="Type here..."
                  aria-label="Text editor"
                />
              </div>
            ))}

            {/* IMAGES */}
            {page.images.map((img) => (
              <div
                key={img.id}
                className={
                  "page-image" +
                  (img.id === activeImageId ? " page-image-active" : "")
                }
                style={{
                  top: img.y,
                  left: img.x,
                  width: `${img.scale}%`,
                  zIndex: activeImageId === img.id ? 999 : (img.zIndex || 10),
                }}
                onMouseDown={(e) => handleElementMouseDown(e, img, "image")}
                onContextMenu={(e) => openContextMenu(e, "image", img.id)}
                role="img"
                aria-label={`Image: ${img.scale}% scale`}
              >
                <div className="image-block-inner">
                  <img
                    src={img.src}
                    alt={`Placed image at ${img.x}px, ${img.y}px`}
                    className="image-block-img"
                    draggable={false}
                  />
                </div>
                {img.id === activeImageId && (
                  <div className="resize-handle" aria-hidden="true" />
                )}
              </div>
            ))}

            {/* Image size slider */}
            {activeImage && (
              <div className="image-size-controls">
                <span className="image-size-label">Image size: {activeImage.scale}%</span>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={activeImage.scale}
                  onChange={(e) =>
                    handleImageScaleChange(e, activeImage.id)
                  }
                  className="image-size-range"
                  aria-label="Image scale slider"
                />
              </div>
            )}
          </div>
        </div>

        {/* Pages bar */}
        <div
          className="pages-bar"
          onMouseDown={(e) => e.stopPropagation()}
          role="navigation"
          aria-label="Page navigation"
        >
          <div className="pages-list" role="list">
            {pages.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                className={
                  "page-pill" + (idx === activePageIndex ? " active" : "")
                }
                onClick={() => {
                  setActivePageIndex(idx);
                  setActiveTextTarget("body");
                  setToolbarStyle(pages[idx].body.style);
                  setActiveImageId(null);
                  setContextMenu(null);
                }}
                aria-current={idx === activePageIndex ? "page" : undefined}
                aria-label={`Go to page ${idx + 1}`}
              >
                Page {idx + 1}
              </button>
            ))}
            <button
              type="button"
              className="page-pill add-page-pill"
              onClick={handleAddPage}
              aria-label="Add new page"
            >
              + Add page
            </button>
          </div>

          <button
            type="button"
            className="delete-page-btn"
            disabled={pages.length === 1}
            onClick={handleDeletePage}
            aria-label="Delete current page"
          >
            Delete page
          </button>
        </div>
      </section>

      {/* Right-click menu */}
      {contextMenu && (
        <div
          className="pdf-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={closeContextMenu}
          role="menu"
          aria-label="Context menu"
        >
          <button
            type="button"
            className="context-item"
            onClick={() => handleContextAction("copy")}
            role="menuitem"
          >
            Copy
          </button>
          <button
            type="button"
            className="context-item"
            onClick={() => handleContextAction("cut")}
            role="menuitem"
          >
            Cut
          </button>
          <button
            type="button"
            className="context-item"
            onClick={() => handleContextAction("paste")}
            role="menuitem"
          >
            Paste
          </button>
          <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid #eee" }} />
          <button
            type="button"
            className="context-item"
            onClick={() => handleContextAction("front")}
            role="menuitem"
          >
            Bring to front
          </button>
          <button
            type="button"
            className="context-item"
            onClick={() => handleContextAction("back")}
            role="menuitem"
          >
            Send to back
          </button>
          <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid #eee" }} />
          <button
            type="button"
            className="context-item context-danger"
            onClick={() => handleContextAction("delete")}
            role="menuitem"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}