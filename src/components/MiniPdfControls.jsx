import React from "react";

export default function MiniPdfControls({
  pageNumber,
  numPages,
  scale,
  onNextPage,
  onPrevPage,
  onScaleChange,
}) {
  return (
    <div className="mini-pdf-controls">
      <div className="mini-pdf-controls-group">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={pageNumber <= 1}
          className="mini-pdf-btn"
        >
          ← Previous
        </button>

        <span className="mini-pdf-page-counter">
          {pageNumber} / {numPages || "-"}
        </span>

        <button
          type="button"
          onClick={onNextPage}
          disabled={!numPages || pageNumber >= numPages}
          className="mini-pdf-btn"
        >
          Next →
        </button>
      </div>

      <div className="mini-pdf-controls-group">
        <label htmlFor="miniPdfZoom" style={{ fontSize: 13 }}>
          Zoom:
        </label>
        <select
          id="miniPdfZoom"
          value={scale}
          onChange={onScaleChange}
          className="mini-pdf-zoom-select"
        >
          <option value={0.8}>80%</option>
          <option value={1}>100%</option>
          <option value={1.2}>120%</option>
          <option value={1.5}>150%</option>
          <option value={2}>200%</option>
        </select>
      </div>
    </div>
  );
}