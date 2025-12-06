import { useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
        text: "Double‑click to edit",
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
          width: 220,
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
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...props } : el)));
  }

  function deleteSelected() {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  }

  function onDrag(id, e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateElement(id, { x, y });
  }

  async function exportToPdf() {
    if (!canvasRef.current) return;

    const canvasEl = canvasRef.current;

    const canvas = await html2canvas(canvasEl, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("kuro-design.pdf");
  }

  async function saveToServer() {
    if (!canvasRef.current) return;

    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("Failed to render canvas to image");

      const token = await getToken();
      const form = new FormData();
      form.append("title", "Canvas design");
      form.append("body_text", "Generated from canvas");
      form.append("images", new File([blob], "canvas.png", { type: "image/png" }));

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
      // Call parent callback so the newly-created PDF can be added to the list
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
          <button type="button" className="kuro-btn primary" onClick={exportToPdf}>
            📄 Export as PDF
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
              onChange={(e) => updateElement(selected.id, { text: e.target.value })}
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
                updateElement(selected.id, { fontSize: Number(e.target.value) || 12 })
              }
              disabled={selected.type !== "text"}
            />
          </div>
          <div className="kuro-inspector-row">
            <label>Font</label>
            <select
              value={selected.fontFamily || "system-ui"}
              onChange={(e) => updateElement(selected.id, { fontFamily: e.target.value })}
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
              onChange={(e) => updateElement(selected.id, { color: e.target.value })}
              disabled={selected.type !== "text"}
            />
          </div>
        </div>
      )}

      {/* Design canvas */}
      <div
        className="kuro-design-canvas"
        ref={canvasRef}
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
            return (
              <img
                key={el.id}
                src={el.src}
                alt=""
                className={
                  "kuro-canvas-image" + (el.id === selectedId ? " selected" : "")
                }
                style={{
                  top: el.y,
                  left: el.x,
                  width: el.width || 220,
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
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
