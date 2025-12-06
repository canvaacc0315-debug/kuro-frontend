import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "../styles/mini-pdf-viewer.css";

// ✅ Vite-friendly worker config
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function MiniPdfViewer({ pdfFile }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function nextPage() {
    if (numPages && pageNumber < numPages) {
      setPageNumber((p) => p + 1);
    }
  }

  function prevPage() {
    if (pageNumber > 1) {
      setPageNumber((p) => p - 1);
    }
  }

  function handleScaleChange(e) {
    setScale(parseFloat(e.target.value));
  }

  return (
    <div className="pdf-viewer-container">
      {/* Controls */}
      <div className="pdf-controls">
        <div className="controls-group">
          <button
            onClick={prevPage}
            disabled={pageNumber <= 1}
            className="btn btn-prev"
            type="button"
          >
            ← Previous
          </button>

          <span className="page-counter">
            {pageNumber} / {numPages || "…"}
          </span>

          <button
            onClick={nextPage}
            disabled={numPages && pageNumber >= numPages}
            className="btn btn-next"
            type="button"
          >
            Next →
          </button>
        </div>

        <div className="controls-group">
          <label htmlFor="zoom">Zoom:</label>
          <select
            id="zoom"
            value={scale}
            onChange={handleScaleChange}
            className="zoom-select"
          >
            <option value={0.8}>80%</option>
            <option value={1}>100%</option>
            <option value={1.2}>120%</option>
            <option value={1.5}>150%</option>
            <option value={2}>200%</option>
          </select>
        </div>
      </div>

      {/* PDF display */}
      <div className="pdf-display">
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      <p className="page-info">
        Page {pageNumber} of {numPages || "Loading…"}
      </p>
    </div>
  );
}