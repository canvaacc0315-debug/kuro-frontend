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

  // ----------------- helpers used by export -----------------

  // px -> pt conversion: 1px @96dpi = 0.75pt (72pt per inch)
  const pxToPt = (px) => Number(px) * 0.75;

  // parse hex color "#rrggbb" -> [r,g,b]
  const hexToRgb = (hex) => {
    if (!hex) return [0, 0, 0];
    const h = hex.replace("#", "");
    if (h.length === 3) {
      return [
        parseInt(h[0] + h[0], 16),
        parseInt(h[1] + h[1], 16),
        parseInt(h[2] + h[2], 16),
      ];
    }
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  // Ensure image src is a data URL (PNG). If already data:, return as-is.
  // Otherwise load image, draw to canvas and convert to dataURL.
  const ensureImageDataUrl = (src, targetWidth, targetHeight) =>
    new Promise((resolve, reject) => {
      if (!src) return reject(new Error("No image source"));
      if (String(src).startsWith("data:")) return resolve(src);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          // if width/height given, draw to that size; else use natural size
          const w = targetWidth || img.naturalWidth || 400;
          const h = targetHeight || img.naturalHeight || (w * img.naturalHeight) / (img.naturalWidth || 1);
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          const ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = c.toDataURL("image/png");
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(new Error("Failed to load image"));
      img.src = src;
    });

  // ----------------- Export to PDF (robust) -----------------
  async function exportToPdf() {
    console.log("Export PDF clicked");

    if (elements.length === 0) {
      alert("Nothing to export – add some text or an image first.");
      return;
    }

    try {
      // create PDF in points
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth(); // pts
      const pageHeight = pdf.internal.pageSize.getHeight(); // pts

      // margins in pts
      const marginX = 40;
      const marginY = 40;

      // If canvasRef exists, compute a scale factor between DOM px and PDF pts
      // We assume elements x/y/width/height are in px relative to the canvas.
      // Convert px->pt with pxToPt so things line up roughly.
      for (const el of elements) {
        const xPt = marginX + pxToPt(el.x || 0);
        const yPt = marginY + pxToPt(el.y || 0);

        if (el.type === "text") {
          const fontSize = el.fontSize || 18;
          pdf.setFontSize(fontSize);
          const [r, g, b] = hexToRgb(el.color || "#000000");
          pdf.setTextColor(r, g, b);
          // simple text placing; for long text we can split (keep minimal change)
          // convert fontSize px->pt? jsPDF fontSize is in pt already; we used el.fontSize as pts assumption.
          // If el.fontSize was px, this is an approximation; it still looks reasonable.
          // For multi-line text, split by '\n'
          const lines = String(el.text || "").split("\n");
          lines.forEach((line, idx) => {
            // if text goes beyond page bottom add a page
            if (yPt + idx * (fontSize + 4) > pageHeight - marginY) {
              pdf.addPage();
            }
            pdf.text(String(line), xPt, yPt + idx * (fontSize + 4));
          });
        }

        if (el.type === "image") {
          // target width/height in px -> convert to pts
          const wPx = el.width || 260;
          const hPx = el.height || 160;
          const wPt = pxToPt(wPx);
          const hPt = pxToPt(hPx);

          // keep inside page bounds
          const safeX = Math.min(xPt, pageWidth - marginX - wPt);
          const safeY = Math.min(yPt, pageHeight - marginY - hPt);

          // ensure we have a data URL (PNG)
          let imgData;
          try {
            imgData = await ensureImageDataUrl(el.src, wPx, hPx);
          } catch (err) {
            // fallback: try adding the src directly (jsPDF can accept data URLs only)
            console.warn("Image conversion failed, attempting to use src directly:", err);
            imgData = el.src;
          }

          // addImage expects image data (dataURL), format, x, y, w, h (units pts)
          // NOTE: jsPDF expects w/h in the same units as the pdf (pts here)
          // if addImage fails because src not dataURL, it will throw and be caught by outer try/catch
          pdf.addImage(imgData, "PNG", safeX, safeY, wPt, hPt);
        }
      }

      pdf.save("rovexai-design.pdf");
    } catch (err) {
      console.error("Export PDF error:", err);
      // show a helpful alert
      alert(`Export failed: ${err?.message || err}`);
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
  }, []);

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