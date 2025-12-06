import { motion } from "framer-motion";
import { useState } from "react";
import { useApiClient } from "../api/client";

export default function PdfUploadPanel({ onUploaded }) {
  const { uploadPdf } = useApiClient();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length || isUploading) return;

    try {
      setError("");
      setIsUploading(true);
      const data = await uploadPdf(files);
      onUploaded?.(data.pdfs);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Upload failed. Check backend logs.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative flex flex-col items-start gap-2 border border-stroke rounded-xl2 bg-panelSoft/80 px-4 py-3 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-white/5 via-transparent to-white/5" />
      <span className="text-[11px] text-inkSoft uppercase tracking-[0.18em]">
        Drop PDFs here
      </span>
      <span className="text-xs text-inkSoft">
        or <span className="underline">browse</span> from your system
      </span>
      <input
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <span className="mt-1 text-[10px] text-inkSoft/70">
        {isUploading ? "Uploading & indexing…" : "Supports multiple files"}
      </span>
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </motion.label>
  );
}