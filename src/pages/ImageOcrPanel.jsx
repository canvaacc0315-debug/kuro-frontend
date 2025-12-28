import { useState } from "react";
import jsPDF from "jspdf";
import "../styles/ocr-override.css";

export default function ImageOcrPanel() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- Upload ---------- */
  function handleImage(e) {
    const img = e.target.files?.[0];
    if (!img) return;

    if (!img.type.match(/image\/(png|jpg|jpeg)/)) {
      alert("Only PNG / JPG supported");
      return;
    }

    setFile(img);
    setPreview(URL.createObjectURL(img));
    setOcrText("");
  }

  /* ---------- OCR ---------- */
  async function startOcr() {
    if (!file) return;

    try {
      setLoading(true);
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
      setOcrText(data.text || "");
    } catch (e) {
      alert("Image OCR failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- EXPORTS ---------- */
  function downloadTxt() {
    const blob = new Blob([ocrText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image-ocr.txt";
    a.click();
  }

  function downloadCsv() {
    const blob = new Blob(["text\n" + ocrText], { type: "text/csv" });
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

    const lines = doc.splitTextToSize(ocrText, width);
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
    navigator.clipboard.writeText(ocrText);
  }

  function resetAll() {
    setFile(null);
    setPreview(null);
    setOcrText("");
    document.getElementById("imageOcrInput").value = "";
  }

  /* ---------- UI ---------- */
  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>
          OCR & <span>Images</span>
        </h2>
        <p>Extract text from PNG & JPG images</p>
      </div>

      <div className="ocr-output-layout">
        {/* LEFT */}
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
              onChange={handleImage}
            />
          </div>

          {preview && (
            <div className="ocr-preview">
              <div className="ocr-preview-header">
                <h4>Image Preview</h4>
              </div>

              <div className="ocr-image-preview">
                <img src={preview} alt="preview" />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="ocr-output-right">
          <h4>Actions</h4>

          <button onClick={startOcr} disabled={!file || loading}>
            {loading ? "Processing..." : "🚀 Start OCR"}
          </button>

          <button disabled={!ocrText} onClick={downloadTxt}>TXT</button>
          <button disabled={!ocrText} onClick={downloadCsv}>CSV</button>
          <button disabled={!ocrText} onClick={downloadPdf}>PDF</button>
          <button disabled={!ocrText} onClick={copyText}>Copy</button>

          <div className="ocr-result-preview">
            <h4>Extracted Text</h4>
            {ocrText ? (
              <pre>{ocrText}</pre>
            ) : (
              <div className="ocr-placeholder">
                OCR result will appear here
              </div>
            )}
          </div>

          {ocrText && (
            <button className="process-another-btn" onClick={resetAll}>
              🔁 Process Another Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}