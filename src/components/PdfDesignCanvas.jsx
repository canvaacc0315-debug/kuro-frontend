import { useRef, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import html2canvas from "html2canvas"; // still used for fallback and saveToServer
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

  // NEW: helper to make an A4 sized PDF and place an image on it (used by fallback)
  async function createPdfFromCanvasImage(imageDataUrl) {
    // create PDF in points (pt)
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // create an Image object to get dimensions
    const img = new Image();
    img.src = imageDataUrl;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    // fit image to page while preserving aspect ratio and leave small margin
    const margin = 24;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;
    let w = img.width;
    let h = img.height;
    const ratio = Math.min(maxW / w, maxH / h, 1);
    w = w * ratio;
    h = h * ratio;
    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;

    pdf.addImage(imageDataUrl, "PNG", x, y, w, h);
    return pdf;
  }

  // Export PDF: attempt element-by-element export (fast & vector for text)
  // If any error occurs (font methods missing in runtime) we gracefully fallback
  // to rendering the canvas with html2canvas and embedding the resulting image.
  async function exportToPdf() {
    console.log("Export PDF clicked");

    if (elements.length === 0) {
      alert("Nothing to export – add some text or an image first.");
      return;
    }

    // primary attempt: draw elements via jsPDF APIs
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // simple margin
      const marginX = 40;
      const marginY = 40;

      for (const el of elements) {
        const x = marginX + (el.x || 0);
        const y = marginY + (el.y || 0);

        if (el.type === "text") {
          // Defensive: ensure font size number and a string for text
          const fontSize = Number(el.fontSize) || 18;
          pdf.setFontSize(fontSize);

          // Try to set a sensible font — avoid calling deprecated/absent methods.
          // Use built-in fonts to minimize font-related code paths.
          try {
            // prefer 'helvetica' (builtin). If user selected monospace, map it.
            const family = (el.fontFamily || "system-ui").toLowerCase();
            if (family.includes("courier") || family.includes("mono")) {
              pdf.setFont("Courier");
            } else if (family.includes("times")) {
              pdf.setFont("Times");
            } else {
              pdf.setFont("Helvetica");
            }
          } catch (e) {
            // ignore font selection errors — continue with default font
          }

          // setTextColor accepts 3 numbers
          const hex = (el.color || "#000000").replace("#", "");
          const r = parseInt(hex.slice(0, 2) || "00", 16);
          const g = parseInt(hex.slice(2, 4) || "00", 16);
          const b = parseInt(hex.slice(4, 6) || "00", 16);
          pdf.setTextColor(r, g, b);

          // Use text() to write. If an error happens here (library internals),
          // we will be caught by outer try and fall back to image rendering.
          pdf.text(String(el.text || ""), x, y);
        }

        if (el.type === "image") {
          const w = el.width || 260;
          const h = el.height || 160;

          // keep inside page bounds
          const safeX = Math.min(x, pageWidth - marginX - w);
          const safeY = Math.min(y, pageHeight - marginY - h);

          // Try to detect image type from data URL (data:image/png;base64,...)
          let imgType = "PNG";
          if (typeof el.src === "string" && el.src.startsWith("data:")) {
            if (el.src.startsWith("data:image/jpeg")) imgType = "JPEG";
            else if (el.src.startsWith("data:image/jpg")) imgType = "JPEG";
            else imgType = "PNG";
          }

          // addImage may still throw on certain builds; let outer try catch handle it
          pdf.addImage(el.src, imgType, safeX, safeY, w, h);
        }
      }

      // Save if everything went well
      pdf.save("rovexai-design.pdf");
      return;
    } catch (err) {
      // Primary method failed — fall back to rendering the visible canvas to an image
      console.warn("Export via elements failed, falling back to canvas image export:", err);
      try {
        if (!canvasRef.current) throw new Error("Canvas not available for fallback export");

        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
        });

        const dataUrl = canvas.toDataURL("image/png");
        const pdf = await createPdfFromCanvasImage(dataUrl);
        pdf.save("rovexai-design.pdf");
        return;
      } catch (fallbackErr) {
        console.error("Fallback export also failed:", fallbackErr);
        alert(`Export failed: ${fallbackErr?.message || fallbackErr}`);
      }
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
  }, [elements, canvasRef.current]);

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