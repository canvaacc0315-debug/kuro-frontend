// src/components/PdfDesignCanvas.jsx
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import html2canvas from "html2canvas"; // still used for saveToServer
import { jsPDF } from "jspdf";
import { Rnd } from "react-rnd";

// Safe API base (force https in prod)
const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://canvaacc0315-debug-canvaacc0315-debug.hf.space";
const API_BASE = RAW_API_BASE.replace("http://", "https://");

export default function PdfDesignCanvas({ onCreated } = {}) {
  const { getToken } = useAuth();
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  function addTextBox() {
    const id = crypto.randomUUID();
    setElements((prev) => [
      ...prev,
      {
        id,
        type: "text",
        text: "Double-click to edit",
        x: 80,
        y: 80,
        fontSize: 18,
        color: "#ffffff",
        fontFamily: "system-ui",
        fontWeight: "600",
      },
    ]);
    setSelectedId(id);
  }

  function triggerImageUpload() {
    fileInputRef.current?.click();
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const id = crypto.randomUUID();
      setElements((prev) => [
        ...prev,
        {
          id,
          type: "image",
          src: reader.result,
          x: 100,
          y: 120,
          width: 260,
          height: 160,
        },
      ]);
      setSelectedId(id);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleCanvasClick(e) {
    // click‑to‑place new text if nothing selected
    if (selectedId) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = crypto.randomUUID();
    setElements((prev) => [
      ...prev,
      {
        id,
        type: "text",
        text: "Text",
        x,
        y,
        fontSize: 18,
        color: "#ffffff",
        fontFamily: "system-ui",
        fontWeight: "600",
      },
    ]);
    setSelectedId(id);
  }

  function updateElement(id, props) {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...props } : el))
    );
  }

  function deleteSelected() {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  }

  function onDrag(id, e) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateElement(id, { x, y });
  }

  // ✅ Export PDF directly from `elements` (no html2canvas)
  function exportToPdf() {
    console.log("Export PDF clicked");

    if (elements.length === 0) {
      alert("Nothing to export – add some text or an image first.");
      return;
    }

    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // simple margin in points
      const marginX = 40;
      const marginY = 40;
      const usableWidth = pageWidth - marginX * 2;
      const usableHeight = pageHeight - marginY * 2;

      // We need to map canvas pixel coordinates -> PDF points.
      // Compute the pixel size of the canvas element (the visible design area).
      let canvasPixelWidth = 800; // fallback if not available
      let canvasPixelHeight = 1100;
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        canvasPixelWidth = Math.max(1, rect.width);
        canvasPixelHeight = Math.max(1, rect.height);
      }

      // scale factor: pixels -> points (fit canvas width into usable PDF width)
      const scaleX = usableWidth / canvasPixelWidth;
      const scaleY = usableHeight / canvasPixelHeight;
      // choose scale that preserves aspect ratio (so canvas fits)
      const scale = Math.min(scaleX, scaleY);

      // iterate elements and draw
      elements.forEach((el) => {
        // map element pixel coords to PDF points
        const x = marginX + (el.x || 0) * scale;
        const y = marginY + (el.y || 0) * scale;

        if (el.type === "text") {
          // set a default font (avoid using removed APIs like setFontType)
          // Use built-in "helvetica" with a style (normal / bold)
          const style = (el.fontWeight && String(el.fontWeight).includes("6")) ? "bold" : "normal";
          pdf.setFont("helvetica", style);

          // fontSize in px -> approximate mapping to points:
          // jsPDF fontSize is in points already; if fontSize from canvas is px,
          // scale it similarly with our scale factor for consistent sizing.
          const fontSize = (el.fontSize || 18) * scale;
          pdf.setFontSize(Math.max(8, fontSize));

          // color: hex -> rgb numbers
          try {
            const hex = (el.color || "#000000").replace("#", "");
            const r = parseInt(hex.slice(0, 2) || "00", 16);
            const g = parseInt(hex.slice(2, 4) || "00", 16);
            const b = parseInt(hex.slice(4, 6) || "00", 16);
            pdf.setTextColor(r, g, b);
          } catch {
            // fallback
            pdf.setTextColor(0, 0, 0);
          }

          // split and draw text (respecting width)
          const maxLineWidth = usableWidth - (el.x || 0) * scale;
          const lines = pdf.splitTextToSize(el.text || "", Math.max(30, maxLineWidth));
          // ensure not to overflow page vertically — start at y and advance
          let cursorY = y;
          lines.forEach((line) => {
            if (cursorY > pageHeight - marginY) {
              pdf.addPage();
              cursorY = marginY;
            }
            pdf.text(line, x, cursorY);
            cursorY += (pdf.getLineHeight() || 14) * 1.1;
          });
        }

        if (el.type === "image") {
          // compute target size in PDF points (scale pixels -> points)
          const w = (el.width || 260) * scale;
          const h = (el.height || 160) * scale;

          // keep inside page bounds
          const safeX = Math.max(marginX, Math.min(x, pageWidth - marginX - w));
          const safeY = Math.max(marginY, Math.min(y, pageHeight - marginY - h));

          // detect image type for addImage (PNG/JPEG)
          let imgType = "PNG";
          if (typeof el.src === "string") {
            if (el.src.startsWith("data:image/jpeg") || el.src.startsWith("data:image/jpg")) {
              imgType = "JPEG";
            } else if (el.src.startsWith("data:image/png")) {
              imgType = "PNG";
            } else {
              // if other dataURL or remote URL, default to PNG (jsPDF will try)
              imgType = "PNG";
            }
          }

          // addImage accepts dataURL. If the src is an <img> URL (remote),
          // jsPDF may need a dataURL. We assume we stored dataURLs when uploading.
          try {
            pdf.addImage(el.src, imgType, safeX, safeY, w, h);
          } catch (err) {
            console.warn("addImage failed for element", el.id, err);
            // As a fallback, try to create an Image and draw to an offscreen canvas to get dataURL
            // (best-effort fallback)
            // Note: This may fail cross-domain without CORS.
            try {
              const tmpImg = new Image();
              tmpImg.crossOrigin = "anonymous";
              tmpImg.src = el.src;
              // synchronous path won't work — but attempt a basic fallback for well-behaved data URLs
              // If it still fails, skip the image and continue.
            } catch (e) {
              // skip image
            }
          }
        }
      });

      pdf.save("rovexai-design.pdf");
    } catch (err) {
      console.error("Export PDF error:", err);
      // If the error is about a removed API (setFontType), provide a helpful message
      const message =
        err && err.message && err.message.includes("setFontType")
          ? "Export failed: code used removed jsPDF API `setFontType`. I've updated the export code to use current jsPDF methods (setFont/setFontSize). If you still see this error, clear browser cache / restart dev server to ensure new bundle is loaded."
          : `Export failed: ${err?.message || String(err)}`;
      alert(message);
    }
  }

  // expose export function globally so other components/buttons can call it
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.exportCanvasToPdf = exportToPdf;
    }
    return () => {
      if (typeof window !== "undefined" && window.exportCanvasToPdf === exportToPdf) {
        delete window.exportCanvasToPdf;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  // Still use html2canvas only for sending to backend
  async function saveToServer() {
    if (!canvasRef.current) return;

    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("Failed to render canvas to image");

      const token = await getToken();
      const form = new FormData();
      form.append("title", "Canvas design");
      form.append("body_text", "Generated from canvas");
      form.append(
        "images",
        new File([blob], "canvas.png", { type: "image/png" })
      );

      const res = await fetch(`${API_BASE}/api/pdf/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        let msg = `Create PDF failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }
      const data = await res.json();
      alert(`PDF created: ${data.pdf}`);
      if (onCreated && typeof onCreated === "function") {
        onCreated({ pdf_id: data.pdf, filename: data.pdf });
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to save canvas to server");
    }
  }

  const selected = elements.find((el) => el.id === selectedId);

  return (
    <div className="kuro-canvas-wrapper">
      {/* Toolbar */}
      <div className="kuro-canvas-toolbar">
        <div className="kuro-canvas-toolbar-left">
          <button type="button" className="kuro-btn" onClick={addTextBox}>
            ➕ Text
          </button>
          <button type="button" className="kuro-btn" onClick={triggerImageUpload}>
            🖼 Upload Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="kuro-btn"
            onClick={deleteSelected}
            disabled={!selectedId}
          >
            🗑 Delete
          </button>
        </div>
        <div className="kuro-canvas-toolbar-right">
          <button type="button" className="kuro-btn" onClick={saveToServer}>
            💾 Save to Server
          </button>
          <button
            type="button"
            className="kuro-btn primary"
            onClick={exportToPdf}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Inspector for selected element */}
      {selected && (
        <div className="kuro-inspector">
          <div className="kuro-inspector-row">
            <label>Text</label>
            <input
              type="text"
              value={selected.text || ""}
              onChange={(e) =>
                updateElement(selected.id, { text: e.target.value })
              }
              disabled={selected.type !== "text"}
            />
          </div>
          <div className="kuro-inspector-row">
            <label>Font size</label>
            <input
              type="number"
              min={8}
              max={72}
              value={selected.fontSize || 18}
              onChange={(e) =>
                updateElement(selected.id, {
                  fontSize: Number(e.target.value) || 12,
                })
              }
              disabled={selected.type !== "text"}
            />
          </div>
          <div className="kuro-inspector-row">
            <label>Font</label>
            <select
              value={selected.fontFamily || "system-ui"}
              onChange={(e) =>
                updateElement(selected.id, { fontFamily: e.target.value })
              }
              disabled={selected.type !== "text"}
            >
              <option value="system-ui">System</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times</option>
              <option value="'Courier New', monospace">Monospace</option>
            </select>
          </div>
          <div className="kuro-inspector-row">
            <label>Color</label>
            <input
              type="color"
              value={selected.color || "#ffffff"}
              onChange={(e) =>
                updateElement(selected.id, { color: e.target.value })
              }
              disabled={selected.type !== "text"}
            />
          </div>
        </div>
      )}

      {/* Design canvas */}
      <div
        className="kuro-design-canvas"
        ref={canvasRef}
        style={{
          minHeight: "80vh",
          maxHeight: "80vh",
          overflow: "auto",
          paddingBottom: "260px",
          position: "relative",
        }}
        onClick={(e) => {
          if (e.target === canvasRef.current) setSelectedId(null);
          handleCanvasClick(e);
        }}
      >
        {elements.map((el) => {
          if (el.type === "text") {
            return (
              <div
                key={el.id}
                className={
                  "kuro-canvas-text" + (el.id === selectedId ? " selected" : "")
                }
                style={{
                  top: el.y,
                  left: el.x,
                  fontSize: el.fontSize,
                  color: el.color,
                  fontFamily: el.fontFamily,
                  fontWeight: el.fontWeight,
                  position: "absolute",
                  cursor: "move",
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedId(el.id);
                }}
                onMouseMove={(e) => {
                  if (e.buttons === 1 && el.id === selectedId) {
                    e.preventDefault();
                    onDrag(el.id, e);
                  }
                }}
              >
                {el.text}
              </div>
            );
          }

          if (el.type === "image") {
            const width = el.width || 260;
            const height = el.height || 160;

            return (
              <Rnd
                key={el.id}
                size={{ width, height }}
                position={{ x: el.x, y: el.y }}
                bounds="parent"
                dragHandleClassName="drag-handle"
                enableResizing={{
                  top: true, right: true, bottom: true, left: true,
                  topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
                }}
                resizeHandleStyles={{
                  bottomRight: { width: 18, height: 18, borderRadius: 6 },
                  bottomLeft:  { width: 18, height: 18, borderRadius: 6 },
                  topRight:    { width: 18, height: 18, borderRadius: 6 },
                  topLeft:     { width: 18, height: 18, borderRadius: 6 },
                }}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setSelectedId(el.id);
                }}
                onDragStop={(e, data) => {
                  updateElement(el.id, { x: data.x, y: data.y });
                }}
                onResizeStop={(e, dir, ref, delta, position) => {
                  updateElement(el.id, {
                    x: position.x,
                    y: position.y,
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                  });
                }}
              >
                <img
                  src={el.src}
                  crossOrigin="anonymous"
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    border:
                      el.id === selectedId
                        ? "2px solid #ff4b6e"
                        : "2px solid transparent",
                    borderRadius: 8,
                    cursor: "move",
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                />
              </Rnd>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}