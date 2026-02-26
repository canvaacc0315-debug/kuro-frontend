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
  images: [], // { id, src (data: base64), format, scale, x, y }
});

const makeImageId = () => `img-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const UNDO_REDO_LIMIT = 20;

export default function CreatePdfPanel({ onExportPdf }) {
  const [pages, setPages] = useState([createPage(1)]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [history, setHistory] = useState([]); // array of pages snapshots
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [activeTextTarget, setActiveTextTarget] = useState("body");
  const [toolbarStyle, setToolbarStyle] = useState(defaultTextStyle);

  const [activeImageId, setActiveImageId] = useState(null);

  const [dragState, setDragState] = useState(null); // { imageId, offsetX, offsetY }

  const [contextMenu, setContextMenu] = useState(null); // { x, y, target, imageId? }
  const [imageClipboard, setImageClipboard] = useState(null); // { src, scale, format }

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
      setActiveTextTarget("body");
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
      setActiveTextTarget("body");
      setContextMenu(null);
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

  const handleImageMouseDown = useCallback((e, img) => {
    if (!pageRef.current) return;
    e.stopPropagation();
    e.preventDefault();

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

    const newX = Math.max(0, Math.min(pointerX - dragState.offsetX, 600));
    const newY = Math.max(0, Math.min(pointerY - dragState.offsetY, 800));

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
    setActiveTextTarget("body");
    setToolbarStyle(newPage.body.style);
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
        } catch { }
      }
    }

    if (action === "cut") {
      const selection = value.slice(start, end);
      if (selection) {
        try {
          await navigator.clipboard.writeText(selection);
        } catch { }
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
      } catch { }
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

        // heading
        const headingStyle = p.heading.style || {};
        const headingFontSize = headingStyle.fontSize || 24;
        pdf.setFontSize(headingFontSize);

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

        if (headingStyle.color) {
          const [r, g, b] = hexToRgb(headingStyle.color);
          pdf.setTextColor(r, g, b);
        }

        const headingX = margin;
        let cursorY = margin + headingFontSize;

        const headingLines = pdf.splitTextToSize(p.heading.text || "", contentWidth);
        let lineY = cursorY;
        for (const line of headingLines) {
          const offset = getAlignOffset(pdf, line, contentWidth, headingStyle.align);
          pdf.text(line, headingX + offset, lineY);
          lineY += headingFontSize;
        }
        cursorY = lineY + 8; // Space after heading

        // body
        const bodyStyle = p.body.style || {};
        const bodyFontSize = bodyStyle.fontSize || 14;
        pdf.setFontSize(bodyFontSize);

        const bodyFontStyle = computeFontStyle(bodyStyle);
        pdf.setFont("helvetica", bodyFontStyle);

        pdf.setTextColor(0, 0, 0);
        if (bodyStyle.color) {
          const [r, g, b] = hexToRgb(bodyStyle.color);
          pdf.setTextColor(r, g, b);
        }

        const bodyLines = pdf.splitTextToSize(p.body.text || "", contentWidth);
        lineY = cursorY;
        for (const line of bodyLines) {
          const offset = getAlignOffset(pdf, line, contentWidth, bodyStyle.align);
          pdf.text(line, margin + offset, lineY);
          lineY += bodyFontSize;
        }
        cursorY = lineY + 12; // Space after body

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
              headingRef.current?.focus();
              setActiveTextTarget("heading");
              setToolbarStyle(page.heading.style);
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
              bodyRef.current?.focus();
              setActiveTextTarget("body");
              setToolbarStyle(page.body.style);
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
          <div className="sidebar-title">Elements</div>
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
              placeholder="Enter your heading here..."
              aria-label="Heading editor"
            />

            {/* Body */}
            <textarea
              ref={bodyRef}
              className="body-textarea"
              placeholder="Start writing your PDF content here... Apply styles with the toolbar above."
              value={page.body.text}
              onChange={(e) => handleBodyChange(e.target.value)}
              onFocus={() => {
                setActiveTextTarget("body");
                setToolbarStyle(page.body.style);
              }}
              onContextMenu={(e) => openContextMenu(e, "body")}
              style={bodyInline}
              aria-label="Body editor"
            />

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
                }}
                onMouseDown={(e) => handleImageMouseDown(e, img)}
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