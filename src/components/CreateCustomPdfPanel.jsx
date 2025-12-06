// src/components/CreateCustomPdfPanel.jsx
import { useState } from "react";
import { useApiClient } from "../api/client";

export default function CreateCustomPdfPanel() {
  const { createCustomPdf } = useApiClient();
  const [title, setTitle] = useState("My Custom PDF");
  const [bodyText, setBodyText] = useState("");
  const [images, setImages] = useState([]);
  const [resultFile, setResultFile] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFiles(e) {
    setImages(Array.from(e.target.files || []));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResultFile("");

    try {
      const data = await createCustomPdf({
        title,
        body_text: bodyText,
        images,
      });
      setResultFile(data.pdf);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-xs space-y-3 h-full flex flex-col">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1"
          placeholder="PDF Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 h-28"
          placeholder="Body text"
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
        />

        <div>
          <p className="text-[11px] text-slate-400 mb-1">
            Images (optional)
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFiles}
            className="w-full text-slate-300"
          />
          {images.length > 0 && (
            <p className="text-[11px] text-slate-500 mt-1">
              {images.length} image(s) selected
            </p>
          )}
        </div>

        <button
          className="px-3 py-2 rounded bg-primary text-white"
          type="submit"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </form>

      {resultFile && (
        <div className="mt-3">
          <a
            href={`http://localhost:8000/api/pdf/download/${resultFile}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-emerald-400 underline"
          >
            Download generated PDF
          </a>
        </div>
      )}
    </div>
  );
}