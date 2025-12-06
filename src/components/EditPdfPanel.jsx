// src/components/EditPdfPanel.jsx
import { useState } from "react";
import { useApiClient } from "../api/client";

export default function EditPdfPanel({ selectedPdfId }) {
  const { editPdfAddText, editPdfAddImage } = useApiClient();
  const [textForm, setTextForm] = useState({
    page_number: 0,
    text: "",
    x: 50,
    y: 50,
    font_size: 12,
  });

  const [imageForm, setImageForm] = useState({
    page_number: 0,
    x: 50,
    y: 50,
    width: 200,
    height: 200,
    image: null,
  });

  const [message, setMessage] = useState("");

  async function handleTextSubmit(e) {
    e.preventDefault();
    if (!selectedPdfId) return;
    try {
      const res = await editPdfAddText({
        pdf_id: selectedPdfId,
        ...textForm,
      });
      setMessage(`Text added. New file: ${res.edited_pdf}`);
    } catch (e) {
      console.error(e);
      setMessage("Error applying text to PDF.");
    }
  }

  async function handleImageSubmit(e) {
    e.preventDefault();
    if (!selectedPdfId || !imageForm.image) return;
    try {
      const res = await editPdfAddImage({
        pdf_id: selectedPdfId,
        ...imageForm,
        image: imageForm.image,
      });
      setMessage(`Image added. New file: ${res.edited_pdf}`);
    } catch (e) {
      console.error(e);
      setMessage("Error applying image to PDF.");
    }
  }

  return (
    <div className="space-y-4 text-xs h-full flex flex-col">
      <p className="text-slate-400">
        Editing PDF ID:{" "}
        <span className="font-semibold text-slate-200">
          {selectedPdfId || "None selected"}
        </span>
      </p>

      <div className="grid md:grid-cols-2 gap-4 flex-1">
        {/* Add Text */}
        <form
          onSubmit={handleTextSubmit}
          className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2"
        >
          <h3 className="font-semibold text-slate-200 mb-1">
            Add Text
          </h3>

          <input
            type="number"
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 mb-1"
            placeholder="Page number (0-based)"
            value={textForm.page_number}
            onChange={(e) =>
              setTextForm((f) => ({
                ...f,
                page_number: Number(e.target.value),
              }))
            }
          />

          <textarea
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 mb-1 h-16"
            placeholder="Text to add"
            value={textForm.text}
            onChange={(e) =>
              setTextForm((f) => ({ ...f, text: e.target.value }))
            }
          />

          <div className="flex gap-2 mb-1">
            <input
              type="number"
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1"
              placeholder="x"
              value={textForm.x}
              onChange={(e) =>
                setTextForm((f) => ({
                  ...f,
                  x: Number(e.target.value),
                }))
              }
            />
            <input
              type="number"
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1"
              placeholder="y"
              value={textForm.y}
              onChange={(e) =>
                setTextForm((f) => ({
                  ...f,
                  y: Number(e.target.value),
                }))
              }
            />
          </div>

          <input
            type="number"
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 mb-2"
            placeholder="Font size"
            value={textForm.font_size}
            onChange={(e) =>
              setTextForm((f) => ({
                ...f,
                font_size: Number(e.target.value),
              }))
            }
          />

          <button
            className="w-full bg-primary text-white rounded py-1 disabled:bg-slate-700"
            type="submit"
            disabled={!selectedPdfId}
          >
            Apply Text
          </button>
        </form>

        {/* Add Image */}
        <form
          onSubmit={handleImageSubmit}
          className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2"
        >
          <h3 className="font-semibold text-slate-200 mb-1">
            Add Image
          </h3>

          <input
            type="number"
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 mb-1"
            placeholder="Page number (0-based)"
            value={imageForm.page_number}
            onChange={(e) =>
              setImageForm((f) => ({
                ...f,
                page_number: Number(e.target.value),
              }))
            }
          />

          <div className="flex gap-2 mb-1">
            <input
              type="number"
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1"
              placeholder="x"
              value={imageForm.x}
              onChange={(e) =>
                setImageForm((f) => ({
                  ...f,
                  x: Number(e.target.value),
                }))
              }
            />
            <input
              type="number"
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1"
              placeholder="y"
              value={imageForm.y}
              onChange={(e) =>
                setImageForm((f) => ({
                  ...f,
                  y: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="flex gap-2 mb-1">
            <input
              type="number"
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1"
              placeholder="width"
              value={imageForm.width}
              onChange={(e) =>
                setImageForm((f) => ({
                  ...f,
                  width: Number(e.target.value),
                }))
              }
            />
            <input
              type="number"
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1"
              placeholder="height"
              value={imageForm.height}
              onChange={(e) =>
                setImageForm((f) => ({
                  ...f,
                  height: Number(e.target.value),
                }))
              }
            />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageForm((f) => ({ ...f, image: e.target.files[0] }))
            }
            className="w-full text-xs text-slate-300 mb-2"
          />

          <button
            className="w-full bg-primary text-white rounded py-1 disabled:bg-slate-700"
            type="submit"
            disabled={!selectedPdfId || !imageForm.image}
          >
            Apply Image
          </button>
        </form>
      </div>

      {message && (
        <p className="text-xs text-emerald-400 mt-1">{message}</p>
      )}
    </div>
  );
}