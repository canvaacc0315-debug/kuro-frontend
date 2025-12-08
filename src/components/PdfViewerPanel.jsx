// src/components/PdfViewerPanel.jsx
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function PdfViewerPanel({ pdfId }) {
  const { getToken } = useAuth();
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!pdfId) {
      setSrc("");
      return;
    }

    let urlObject;
    let cancelled = false;

    async function loadPdf() {
      try {
        setSrc("");
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/pdf/view/${pdfId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const text = await res.text();
          console.error("Viewer error:", res.status, text);
          throw new Error("Failed to load PDF file.");
        }
        const blob = await res.blob();
        urlObject = URL.createObjectURL(blob);
        if (!cancelled) setSrc(urlObject);
      } catch (err) {
        console.error(err);
        if (!cancelled) setSrc("");
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (urlObject) URL.revokeObjectURL(urlObject);
    };
  }, [pdfId, getToken]);

  if (!pdfId) {
    return (
      <div className="pdf-viewer empty">
        <p className="pdf-viewer-empty-text">
          Select a PDF on Upload tab to preview it here.
        </p>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <iframe
        key={src} // force reload on pdf change
        src={src}
        title="PDF preview"
        className="pdf-viewer-frame"
      />
    </div>
  );
}