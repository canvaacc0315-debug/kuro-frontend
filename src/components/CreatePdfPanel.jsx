// src/components/CreatePdfPanel.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import "../styles/create-editor.css";
import { jsPDF } from "jspdf"; // ADDED: for frontend PDF export

const defaultTextStyle = {
  fontSize: 16,
  align: "left",
  bold: false,
  italic: false,
  underline: false,
  color: "#000000", // 👈 NEW: Added text color support
};

const createPage = (index) => ({
  id: `page-${index}`,
  heading: {
    text: "Add a heading",
    style: {
      ...defaultTextStyle,
      fontSize: 26,
      bold: true,
    },
  },
  body: {
    text: "",
    style: {
      ...defaultTextStyle,
      fontSize: 16,
    },
  },
  // MULTIPLE images per page
  images: [], // { id, src, scale, x, y }
});

const makeImageId = () => `img-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// 👈 NEW: Simple undo/redo stack (limited to 20 actions for "mini" feel)
const UNDO_REDO_LIMIT = 20;

export default function CreatePdfPanel({ onExportPdf }) {
  const [pages, setPages] = useState([createPage(1)]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [history, setHistory] = useState([]); // 👈 NEW: Undo/redo
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [activeTextTarget, setActiveTextTarget] = useState("body");
  const [toolbarStyle, setToolbarStyle] = useState(defaultTextStyle);

  // which image is selected (for size slider + context menu)
  const [activeImageId, setActiveImageId] = useState(null);

  // dragging one image
  const [dragState, setDragState] = useState(null); // { imageId, offsetX, offsetY }

  // context menu (works for text + images)
  const [contextMenu, setContextMenu] = useState(null); // { x, y, target, imageId? }
  const [imageClipboard, setImageClipboard] = useState(null); // { src, scale }

  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);

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
        // If not at tip, reset
        setHistory(newPages);
        setHistoryIndex(0);
      } else {
        saveToHistory(newPages);
      }
      return newPages;
    });
  }, [activePageIndex, history, historyIndex, saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setPages(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setPages(history[prev + 1]);
    }
  }, [history, historyIndex]);

  const applyStyleToSelection = useCallback((patch) => {
    setToolbarStyle((prev) => ({ ...prev, ...patch }));

    updatePage((p) => {
      if (activeTextTarget === "heading") {
        return {
          ...p,
          heading: {
            ...p.heading,
            style: { ...p.heading.style, ...patch },
          },
        };
      }
      return {
        ...p,
        body: {
          ...p.body,
          style: { ...p.body.style, ...patch },
        },
      };
    });
  }, [activeTextTarget, updatePage]);

  // 👈 NEW: Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      pages.flatMap(p => p.images).forEach(img => URL.revokeObjectURL(img.src));
    };
  }, [pages]);

  /* ------------ toolbar ------------ */

  const handleSizeChange = useCallback((e) => {
    const v = parseInt(e.target.value || "16", 10);
    applyStyleToSelection({ fontSize: isNaN(v) ? 16 : Math.max(8, Math.min(120, v)) }); // 👈 Clamp values
  }, [applyStyleToSelection]);

  const handleAlignChange = useCallback((align) => {
    applyStyleToSelection({ align });
  }, [applyStyleToSelection]);

  const toggleStyleFlag = useCallback((key) => {
    applyStyleToSelection({ [key]: !toolbarStyle[key] });
  }, [toolbarStyle, applyStyleToSelection]);

  // 👈 NEW: Color picker handler
  const handleColorChange = useCallback((color) => {
    applyStyleToSelection({ color });
  }, [applyStyleToSelection]);

  /* ------------ text change ------------ */

  const handleHeadingChange = useCallback((text) => {
    updatePage((p) => ({
      ...p,
      heading: { ...p.heading, text },
    }));
  }, [updatePage]);

  const handleBodyChange = useCallback((text) => {
    updatePage((p) => ({
      ...p,
      body: { ...p.body, text },
    }));
  }, [updatePage]);

  /* ------------ images: insert + drag + size slider ------------ */

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newImg = {
      id: makeImageId(),
      src: url,
      scale: 60, // % of page width
      x: 120, // px from left
      y: 220, // px from top
    };

    updatePage((p) => ({
      ...p,
      images: [...p.images, newImg],
    }));
    setActiveImageId(newImg.id);

    // allow picking same file again
    e.target.value = "";
  }, [updatePage]);

  const handleImageMouseDown = useCallback((e, img) => {
    if (!pageRef.current) return;
    e.stopPropagation();
    e.preventDefault(); // 👈 Prevent text selection

    const pageRect = pageRef.current.getBoundingClientRect();
    const pointerX = e.clientX - pageRect.left;
    const pointerY = e.clientY - pageRect.top;

    setDragState({
      imageId: img.id,
      offsetX: pointerX - img.x,
      offsetY: pointerY - img.y,
    });
    setActiveImageId(img.id);
  }, []);

  const handlePageMouseMove = useCallback((e) => {
    if (!dragState || !pageRef.current) return;

    const pageRect = pageRef.current.getBoundingClientRect();
    const pointerX = e.clientX - pageRect.left;
    const pointerY = e.clientY - pageRect.top;

    const newX = Math.max(0, Math.min(pointerX - dragState.offsetX, 600)); // 👈 Clamp to page bounds (approx 600px wide)
    const newY = Math.max(0, Math.min(pointerY - dragState.offsetY, 800)); // 👈 Clamp to page bounds (approx 800px tall)

    updatePage((p) => ({
      ...p,
      images: p.images.map((img) =>
        img.id === dragState.imageId
          ? {
              ...img,
              x: newX,
              y: newY,
            }
          : img
      ),
    }));
  }, [dragState, updatePage]);

  const handlePageMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleImageScaleChange = useCallback((e, imgId) => {
    const scale = Math.max(30, Math.min(150, Number(e.target.value) || 60)); // 👈 Clamp
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
    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(pages.length);
    setActiveTextTarget("body");
    setToolbarStyle(newPage.body.style);
    setActiveImageId(null);
    setContextMenu(null);
  }, [pages.length]);

  const handleDeletePage = useCallback(() => {
    if (pages.length === 1) return;
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(activePageIndex, 1);
      return copy;
    });
    setActivePageIndex((i) => Math.max(0, i - 1));
    setActiveTextTarget("body");
    setActiveImageId(null);
    setContextMenu(null);
  }, [pages.length, activePageIndex]);

  /* ------------ context menu ------------ */

  const openContextMenu = useCallback((e, target, imageId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target, // 'heading' | 'body' | 'image'
      imageId: imageId || null,
    });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextAction = useCallback(async (action) => {
    if (!contextMenu) return;

    // IMAGE actions
    if (contextMenu.target === "image") {
      const imgId = contextMenu.imageId;
      const img = page.images.find((i) => i.id === imgId);

      if (!img && action !== "paste") {
        closeContextMenu();
        return;
      }

      if (action === "copy" && img) {
        setImageClipboard({ src: img.src, scale: img.scale });
      }

      if (action === "cut" && img) {
        setImageClipboard({ src: img.src, scale: img.scale });
        updatePage((p) => ({
          ...p,
          images: p.images.filter((i) => i.id !== imgId),
        }));
        if (activeImageId === imgId) setActiveImageId(null);
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
            scale: base.scale ?? 60,
            x: Math.min((ref.x ?? 120) + 24, 500), // 👈 Clamp
            y: Math.min((ref.y ?? 220) + 24, 700),
          };
          return { ...p, images: [...p.images, newImg] };
        });
      }

      closeContextMenu();
      return;
    }

    // TEXT actions
    const textarea =
      contextMenu.target === "heading" ? headingRef.current : bodyRef.current;
    if (!textarea) {
      closeContextMenu();
      return;
    }

    const value = textarea.value;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;

    if (action === "copy") {
      const selection = value.slice(start, end);
      if (selection) {
        try {
          await navigator.clipboard.writeText(selection);
        } catch {}
      }
    }

    if (action === "cut") {
      const selection = value.slice(start, end);
      if (selection) {
        try {
          await navigator.clipboard.writeText(selection);
        } catch {}
      }
      const updated = value.slice(0, start) + value.slice(end);
      if (contextMenu.target === "heading") handleHeadingChange(updated);
      else handleBodyChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start;
      }, 0);
    }

    if (action === "delete") {
      const updated =
        start === end ? "" : value.slice(0, start) + value.slice(end);
      if (contextMenu.target === "heading") handleHeadingChange(updated);
      else handleBodyChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start;
      }, 0);
    }

    if (action === "paste") {
      try {
        const clip = await navigator.clipboard.readText();
        const updated = value.slice(0, start) + clip + value.slice(end);
        const newPos = start + clip.length;
        if (contextMenu.target === "heading") handleHeadingChange(updated);
        else handleBodyChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newPos;
        }, 0);
      } catch {}
    }

    closeContextMenu();
  }, [contextMenu, page.images, activeImageId, imageClipboard, closeContextMenu, updatePage, handleHeadingChange, handleBodyChange]);

  /* ------------ inline text styles ------------ */

  const headingInline = (() => {
    const s = page.heading.style;
    return {
      fontSize: s.fontSize,
      fontWeight: s.bold ? 700 : 600,
      fontStyle: s.italic ? "italic" : "normal",
      textDecoration: s.underline ? "underline" : "none",
      textAlign: s.align,
      color: s.color || "#000000",
    };
  })();

  const bodyInline = (() => {
    const s = page.body.style;
    return {
      fontSize: s.fontSize,
      fontWeight: s.bold ? 500 : 400,
      fontStyle: s.italic ? "italic" : "normal",
      textDecoration: s.underline ? "underline" : "none",
      textAlign: s.align,
      color: s.color || "#000000",
    };
  })();

  /* ------------ FRONTEND PDF EXPORT (improved positioning) ------------ */

  // 👈 IMPROVED: Assume editor page dims for better x/y mapping (A4 ~595x842pt, editor ~600x800px)
  const EDITOR_WIDTH = 600;
  const EDITOR_HEIGHT = 800;
  const PDF_WIDTH = 595;
  const PDF_HEIGHT = 842;
  const SCALE_FACTOR_X = PDF_WIDTH / EDITOR_WIDTH;
  const SCALE_FACTOR_Y = PDF_HEIGHT / EDITOR_HEIGHT;

  // helper to load an image src into dataURL (canvas) so jsPDF can add it
  const loadImageAsDataUrl = (src) =>
    new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = c.toDataURL("image/png");
            resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
          } catch {
            resolve({ dataUrl: src, width: img.naturalWidth, height: img.naturalHeight }); // fallback
          }
        };
        img.onerror = () => resolve({ dataUrl: src, width: 0, height: 0 });
        img.src = src;
      } catch {
        resolve({ dataUrl: src, width: 0, height: 0 });
      }
    });

  // export all pages to a PDF in the browser
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

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];

        if (i > 0) pdf.addPage(); // 👈 Move addPage to top for cleaner flow

        // heading
        const headingStyle = p.heading.style || {};
        pdf.setFontSize(headingStyle.fontSize || 24);

        const computeFontStyle = (style) => {
          const bold = !!style.bold;
          const italic = !!style.italic;
          if (bold && italic) return "bolditalic";
          if (bold) return "bold";
          if (italic) return "italic";
          return "normal";
        };
        const headingFontStyle = computeFontStyle(headingStyle);
        pdf.setFont("helvetica", headingFontStyle);

        // 👈 IMPROVED: Support color (basic, as jsPDF color is limited; use hex)
        if (headingStyle.color) {
          const [r, g, b] = hexToRgb(headingStyle.color);
          pdf.setTextColor(r, g, b);
        }

        const headingX = margin;
        let cursorY = margin + (headingStyle.fontSize || 24);

        const headingLines = pdf.splitTextToSize(p.heading.text || "", pageWidth - margin * 2);
        pdf.text(headingLines, headingX, cursorY);

        cursorY += (headingLines.length + 0.5) * (headingStyle.fontSize || 24);

        // body
        const bodyStyle = p.body.style || {};
        pdf.setFontSize(bodyStyle.fontSize || 14);

        const bodyFontStyle = computeFontStyle(bodyStyle);
        pdf.setFont("helvetica", bodyFontStyle);

        // 👈 IMPROVED: Reset color for body if different
        pdf.setTextColor(0, 0, 0); // Default black; override if color set
        if (bodyStyle.color) {
          const [r, g, b] = hexToRgb(bodyStyle.color);
          pdf.setTextColor(r, g, b);
        }

        const bodyLines = pdf.splitTextToSize(p.body.text || "", pageWidth - margin * 2);
        cursorY += 8;
        pdf.text(bodyLines, margin, cursorY);
        cursorY += (bodyLines.length + 1) * (bodyStyle.fontSize || 14);

        // images: render each with improved positioning
        for (const img of p.images || []) {
          try {
            const { dataUrl, width: imgW, height: imgH } = await loadImageAsDataUrl(img.src);

            const contentWidth = pageWidth - margin * 2;
            const targetW = ((img.scale || 60) / 100) * contentWidth;
            let targetH = targetW * (imgH && imgW ? imgH / imgW : 0.6);

            if (!targetH || Number.isNaN(targetH) || targetH <= 0) {
              targetH = targetW * 0.6;
            }

            // 👈 IMPROVED: Map editor px to PDF pt using scale factors
            const imgX = margin + (img.x || 0) * SCALE_FACTOR_X;
            const imgY = margin + (img.y || 0) * SCALE_FACTOR_Y;

            pdf.addImage(dataUrl, "PNG", imgX, imgY, targetW, targetH);

            // Update cursor if image overlaps (simple heuristic)
            if (imgY + targetH > cursorY) {
              cursorY = imgY + targetH + 12;
            }
          } catch (err) {
            console.warn("Failed to add image to PDF:", err);
          }
        }

        // 👈 NEW: Add page number footer
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
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

  // 👈 NEW: Hex to RGB helper for PDF colors
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
          <div className="sidebar-title">Text</div>
          <button
            type="button"
            className="sidebar-primary-btn"
            onClick={() => {
              headingRef.current?.focus();
              setActiveTextTarget("heading");
              setToolbarStyle(page.heading.style);
            }}
            aria-label="Edit heading" // 👈 Accessibility
          >
            <span className="sidebar-primary-icon">T</span>
            Edit heading
          </button>
          <button
            type="button"
            className="text-style-card text-style-body"
            onClick={() => {
              bodyRef.current?.focus();
              setActiveTextTarget("body");
              setToolbarStyle(page.body.style);
            }}
            aria-label="Edit paragraph" // 👈 Accessibility
          >
            <div className="text-style-main">Edit paragraph</div>
            <div className="text-style-sub">
              Click to focus main content area
            </div>
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Images</div>
          <label className="sidebar-pill-btn">
            🖼 Import image
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
              aria-label="Import image" // 👈 Accessibility
            />
          </label>
        </div>

        {/* 👈 NEW: Undo/Redo buttons */}
        <div className="sidebar-section">
          <div className="sidebar-title">Actions</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <button
              type="button"
              className="sidebar-pill-btn"
              onClick={undo}
              disabled={historyIndex <= 0}
              aria-label="Undo"
            >
              ↶ Undo
            </button>
            <button
              type="button"
              className="sidebar-pill-btn"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              aria-label="Redo"
            >
              ↷ Redo
            </button>
          </div>
        </div>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-export-btn"
            onClick={exportToPdf}
            aria-label="Export PDF" // 👈 Accessibility
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
              aria-label="Font size" // 👈 Accessibility
            />
          </div>

          {/* 👈 NEW: Color picker (simple input) */}
          <div className="toolbar-group">
            <span className="toolbar-label">Color</span>
            <input
              type="color"
              value={toolbarStyle.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="toolbar-color-picker" // 👈 Add CSS for this if needed
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
          role="main" // 👈 Accessibility
          aria-label="PDF editor canvas"
        >
          <div
            className="create-page"
            ref={pageRef}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Heading */}
            <textarea
              ref={headingRef}
              className="heading-textarea"
              value={page.heading.text}
              onChange={(e) => handleHeadingChange(e.target.value)}
              onFocus={() => {
                setActiveTextTarget("heading");
                setToolbarStyle(page.heading.style);
              }}
              onContextMenu={(e) => openContextMenu(e, "heading")}
              style={headingInline}
              placeholder="Enter your heading here..." // 👈 Better placeholder
              aria-label="Heading editor" // 👈 Accessibility
            />

            {/* Body */}
            <textarea
              ref={bodyRef}
              className="body-textarea"
              placeholder="Start writing your PDF content here... Apply styles with the toolbar above." // 👈 Enhanced
              value={page.body.text}
              onChange={(e) => handleBodyChange(e.target.value)}
              onFocus={() => {
                setActiveTextTarget("body");
                setToolbarStyle(page.body.style);
              }}
              onContextMenu={(e) => openContextMenu(e, "body")}
              style={bodyInline}
              aria-label="Body editor" // 👈 Accessibility
            />

            {/* IMAGES – many per page */}
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
                }}
                onMouseDown={(e) => handleImageMouseDown(e, img)}
                onContextMenu={(e) => openContextMenu(e, "image", img.id)}
                role="img" // 👈 Accessibility
                aria-label={`Image: ${img.scale}% scale`}
              >
                <div className="image-block-inner">
                  <img
                    src={img.src}
                    alt={`Placed image at ${img.x}px, ${img.y}px`} // 👈 Better alt
                    className="image-block-img"
                    draggable={false}
                  />
                </div>
                {/* 👈 NEW: Visual resize handle */}
                {img.id === activeImageId && (
                  <div className="resize-handle" aria-hidden="true" />
                )}
              </div>
            ))}

            {/* Image size slider – controls selected image */}
            {activeImage && (
              <div className="image-size-controls">
                <span className="image-size-label">Image size: {activeImage.scale}%</span> {/* 👈 Show value */}
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={activeImage.scale}
                  onChange={(e) =>
                    handleImageScaleChange(e, activeImage.id)
                  }
                  className="image-size-range"
                  aria-label="Image scale slider" // 👈 Accessibility
                />
              </div>
            )}
          </div>
        </div>

        {/* Pages bar */}
        <div
          className="pages-bar"
          onMouseDown={(e) => e.stopPropagation()}
          role="navigation" // 👈 Accessibility
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
                aria-current={idx === activePageIndex ? "page" : undefined} // 👈 Accessibility
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

      {/* Right‑click menu */}
      {contextMenu && (
        <div
          className="pdf-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={closeContextMenu}
          role="menu" // 👈 Accessibility
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