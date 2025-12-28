import { useState } from "react";
import jsPDF from "jspdf";
import "../styles/ocr-override.css";

export default function ImageOcrPanel() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ocrResult, setOcrResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  /* ================= UPLOAD ================= */
  function handleFile(e) {
    const img = e.target.files?.[0];
    if (!img) return;

    if (!img.type.match(/image\/(png|jpeg|jpg)/)) {
      alert("Only PNG or JPG images are supported");
      return;
    }

    setFile(img);
    setPreviewUrl(URL.createObjectURL(img));
    setOcrResult("");
  }

  /* ================= OCR ================= */
  async function startOcr() {
    if (!file) return;

    try {
      setIsRunning(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/image/ocr",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();
      setOcrResult(data.text || "");
    } catch (err) {
      console.error(err);
      alert("Image OCR failed");
    } finally {
      setIsRunning(false);
    }
  }

  /* ================= EXPORTS ================= */
  function downloadTxt() {
    const blob = new Blob([ocrResult], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image-ocr.txt";
    a.click();
  }

  function downloadCsv() {
    const blob = new Blob(["text\n" + ocrResult], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image-ocr.csv";
    a.click();
  }

  function downloadPdf() {
    const doc = new jsPDF("p", "mm", "a4");
    const margin = 15;
    const pageHeight = doc.internal.pageSize.height;
    const width = doc.internal.pageSize.width - margin * 2;

    const lines = doc.splitTextToSize(ocrResult, width);
    let y = margin;

    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save("image-ocr.pdf");
  }

  function copyText() {
    navigator.clipboard.writeText(ocrResult);
    alert("Copied to clipboard");
  }

  function resetAll() {
    setFile(null);
    setPreviewUrl(null);
    setOcrResult("");
    document.getElementById("imageOcrInput").value = "";
  }

  /* ================= UI ================= */
  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>
          OCR & <span>Images</span>
        </h2>
        <p>Extract text from PNG and JPG images</p>
      </div>

      <div className="ocr-output-layout">
        {/* ================= LEFT ================= */}
        <div className="ocr-output-left">
          <div
            className="ocr-upload"
            onClick={() =>
              document.getElementById("imageOcrInput").click()
            }
          >
            <div className="ocr-upload-icon">🖼️</div>
            <div className="ocr-upload-title">Upload Image</div>
            <button className="ocr-upload-btn">Select Image</button>

            <input
              id="imageOcrInput"
              type="file"
              accept=".png,.jpg,.jpeg"
              hidden
              onChange={handleFile}
            />
          </div>

          {previewUrl && (
            <div className="ocr-preview">
              <div className="ocr-preview-header">
                <h4>Image Preview</h4>
              </div>

              <div className="ocr-image-preview">
                <img src={previewUrl} alt="preview" />
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div className="ocr-output-right">
          <h4>Actions</h4>

          <button onClick={startOcr} disabled={!file || isRunning}>
            {isRunning ? "Processing..." : "🚀 Start OCR"}
          </button>

          <button disabled={!ocrResult} onClick={downloadTxt}>
            TXT
          </button>
          <button disabled={!ocrResult} onClick={downloadCsv}>
            CSV
          </button>
          <button disabled={!ocrResult} onClick={downloadPdf}>
            PDF
          </button>
          <button disabled={!ocrResult} onClick={copyText}>
            Copy
          </button>

          <div className="ocr-result-preview">
            <h4>Extracted Text</h4>
            {ocrResult ? (
              <pre>{ocrResult}</pre>
            ) : (
              <div className="ocr-placeholder">
                OCR result will appear here
              </div>
            )}
          </div>

          {ocrResult && (
            <button
              className="process-another-btn"
              onClick={resetAll}
            >
              🔁 Process Another Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}