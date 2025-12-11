// src/components/CreatePdfPanel.jsx
import { useState, useRef } from "react";
import "../styles/create-editor.css";
import { jsPDF } from "jspdf"; // ADDED: for frontend PDF export

const defaultTextStyle = {
  fontSize: 16,
  align: "left",
  bold: false,
  italic: false,
  underline: false,
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

const makeImageId = () =>
  `img-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function CreatePdfPanel({ onExportPdf }) {
  const [pages, setPages] = useState([createPage(1)]);
  const [activePageIndex, setActivePageIndex] = useState(0);

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

  const updatePage = (updater) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activePageIndex ? updater(p) : p))
    );
  };

  const applyStyleToSelection = (patch) => {
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
  };

  /* ------------ toolbar ------------ */

  const handleSizeChange = (e) => {
    const v = parseInt(e.target.value || "16", 10);
    applyStyleToSelection({ fontSize: isNaN(v) ? 16 : v });
  };

  const handleAlignChange = (align) => {
    applyStyleToSelection({ align });
  };

  const toggleStyleFlag = (key) => {
    applyStyleToSelection({ [key]: !toolbarStyle[key] });
  };

  /* ------------ text change ------------ */

  const handleHeadingChange = (text) => {
    updatePage((p) => ({
      ...p,
      heading: { ...p.heading, text },
    }));
  };

  const handleBodyChange = (text) => {
    updatePage((p) => ({
      ...p,
      body: { ...p.body, text },
    }));
  };

  /* ------------ images: insert + drag + size slider ------------ */

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
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
  };

  const handleImageMouseDown = (e, img) => {
    if (!pageRef.current) return;
    e.stopPropagation();

    const pageRect = pageRef.current.getBoundingClientRect();
    const pointerX = e.clientX - pageRect.left;
    const pointerY = e.clientY - pageRect.top;

    setDragState({
      imageId: img.id,
      offsetX: pointerX - img.x,
      offsetY: pointerY - img.y,
    });
    setActiveImageId(img.id);
  };

  const handlePageMouseMove = (e) => {
    if (!dragState || !pageRef.current) return;

    const pageRect = pageRef.current.getBoundingClientRect();
    const pointerX = e.clientX - pageRect.left;
    const pointerY = e.clientY - pageRect.top;

    const newX = pointerX - dragState.offsetX;
    const newY = pointerY - dragState.offsetY;

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
  };

  const handlePageMouseUp = () => {
    setDragState(null);
  };

  const handleImageScaleChange = (e, imgId) => {
    const scale = Number(e.target.value) || 60;
    updatePage((p) => ({
      ...p,
      images: p.images.map((img) =>
        img.id === imgId ? { ...img, scale } : img
      ),
    }));
  };

  const activeImage =
    page.images.length === 0
      ? null
      : page.images.find((i) => i.id === activeImageId) ||
        page.images[page.images.length - 1];

  /* ------------ pages ------------ */

  const handleAddPage = () => {
    const newPage = createPage(pages.length + 1);
    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(pages.length);
    setActiveTextTarget("body");
    setToolbarStyle(newPage.body.style);
    setActiveImageId(null);
    setContextMenu(null);
  };

  const handleDeletePage = () => {
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
  };

  /* ------------ context menu ------------ */

  const openContextMenu = (e, target, imageId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target, // 'heading' | 'body' | 'image'
      imageId: imageId || null,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleContextAction = async (action) => {
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
            x: (ref.x ?? 120) + 24,
            y: (ref.y ?? 220) + 24,
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
  };

  /* ------------ inline text styles ------------ */

  const headingInline = (() => {
    const s = page.heading.style;
    return {
      fontSize: s.fontSize,
      fontWeight: s.bold ? 700 : 600,
      fontStyle: s.italic ? "italic" : "normal",
      textDecoration: s.underline ? "underline" : "none",
      textAlign: s.align,
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
    };
  })();

  /* ------------ FRONTEND PDF EXPORT (minimal, async-safe) ------------ */

  // helper to load an image src into dataURL (canvas) so jsPDF can add it
  const loadImageAsDataUrl = (src) =>
    new Promise((resolve, reject) => {
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
          } catch (err) {
            resolve({ dataUrl: src, width: img.naturalWidth, height: img.naturalHeight }); // fallback
          }
        };
        img.onerror = () => {
          // fallback: resolve with original src (might be object URL)
          resolve({ dataUrl: src, width: 0, height: 0 });
        };
        img.src = src;
      } catch (err) {
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

        // heading
        const headingStyle = p.heading.style || {};
        pdf.setFontSize(headingStyle.fontSize || 24);
        pdf.setFont("helvetica", headingStyle.italic ? "italic" : "normal");
        pdf.setFontType(headingStyle.bold ? "bold" : "normal");

        const headingX = margin;
        let cursorY = margin + (headingStyle.fontSize || 24);

        // split heading if long
        const headingLines = pdf.splitTextToSize(p.heading.text || "", pageWidth - margin * 2);
        pdf.text(headingLines, headingX, cursorY);

        cursorY += (headingLines.length + 0.5) * (headingStyle.fontSize || 24);

        // body
        const bodyStyle = p.body.style || {};
        pdf.setFontSize(bodyStyle.fontSize || 14);
        pdf.setFont("helvetica", bodyStyle.italic ? "italic" : "normal");
        pdf.setFontType(bodyStyle.bold ? "bold" : "normal");

        const bodyLines = pdf.splitTextToSize(p.body.text || "", pageWidth - margin * 2);
        // start a bit below heading
        cursorY += 8;
        pdf.text(bodyLines, margin, cursorY);
        cursorY += (bodyLines.length + 1) * (bodyStyle.fontSize || 14);

        // images: render each image according to its scale (% of page width) and (x,y)
        for (const img of p.images || []) {
          try {
            const { dataUrl, width: imgW, height: imgH } = await loadImageAsDataUrl(img.src);

            // compute width on PDF based on scale% and page width inside margins
            const targetW = ((img.scale || 60) / 100) * (pageWidth - margin * 2);
            // maintain aspect ratio if image natural sizes available
            let targetH = targetW * (imgH && imgW ? imgH / imgW : 0.6);

            // If the computed height is zero, set a reasonable default
            if (!targetH || Number.isNaN(targetH) || targetH <= 0) {
              targetH = targetW * 0.6;
            }

            // compute x/y in PDF units: map img.x/img.y (px in editor) proportionally to page area
            // We don't have the original page pixel dimensions here, so place images by stacking below current cursor
            // This is a safe approximation for export without changing backend.
            const imgX = margin + (img.x || 0) * 0.0; // keep left margin; do not attempt pixel-perfect positioning
            const imgY = Math.max(cursorY + 8, margin + 100 + (img.y || 0) * 0.0);

            pdf.addImage(dataUrl, "PNG", imgX, imgY, targetW, targetH);

            // move cursor below image
            cursorY = imgY + targetH + 12;
          } catch (err) {
            // ignore image addition errors, continue
            console.warn("Failed to add image to PDF:", err);
          }
        }

        // If not last page, add new page
        if (i < pages.length - 1) {
          pdf.addPage();
        }
      }

      // trigger download
      pdf.save("rovexai-created.pdf");

      // still call the optional callback so parent can react (keeps backward compatibility)
      if (typeof onExportPdf === "function") {
        try {
          onExportPdf(pages);
        } catch {}
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed: " + (err?.message || err));
    }
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
            />
          </label>
        </div>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-export-btn"
            onClick={exportToPdf} // <-- wired to frontend export (minimal change)
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
            >
              B
            </button>
            <button
              type="button"
              className={
                "toolbar-toggle" + (toolbarStyle.italic ? " active" : "")
              }
              onClick={() => toggleStyleFlag("italic")}
            >
              I
            </button>
            <button
              type="button"
              className={
                "toolbar-toggle" + (toolbarStyle.underline ? " active" : "")
              }
              onClick={() => toggleStyleFlag("underline")}
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
            />

            {/* Body */}
            <textarea
              ref={bodyRef}
              className="body-textarea"
              placeholder="Start writing your PDF content here..."
              value={page.body.text}
              onChange={(e) => handleBodyChange(e.target.value)}
              onFocus={() => {
                setActiveTextTarget("body");
                setToolbarStyle(page.body.style);
              }}
              onContextMenu={(e) => openContextMenu(e, "body")}
              style={bodyInline}
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
              >
                <div className="image-block-inner">
                  <img
                    src={img.src}
                    alt=""
                    className="image-block-img"
                    draggable={false}
                  />
                </div>
              </div>
            ))}

            {/* Image size slider – controls selected image */}
            {activeImage && (
              <div className="image-size-controls">
                <span className="image-size-label">Image size</span>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={activeImage.scale}
                  onChange={(e) =>
                    handleImageScaleChange(e, activeImage.id)
                  }
                  className="image-size-range"
                />
              </div>
            )}
          </div>
        </div>

        {/* Pages bar */}
        <div
          className="pages-bar"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="pages-list">
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
              >
                Page {idx + 1}
              </button>
            ))}
            <button
              type="button"
              className="page-pill add-page-pill"
              onClick={handleAddPage}
            >
              + Add page
            </button>
          </div>

          <button
            type="button"
            className="delete-page-btn"
            disabled={pages.length === 1}
            onClick={handleDeletePage}
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
        >
          <button
            type="button"
            className="context-item"
            onClick={() => handleContextAction("copy")}
          >
            Copy
          </button>
          <button
            type="button"
            className="context-item"
            onClick={() => handleContextAction("cut")}
          >
            Cut
          </button>
          <button
            type="button"
            className="context-item"
            onClick={() => handleContextAction("paste")}
          >
            Paste
          </button>
          <button
            type="button"
            className="context-item context-danger"
            onClick={() => handleContextAction("delete")}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}