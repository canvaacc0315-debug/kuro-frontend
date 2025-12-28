import { useState, useMemo } from "react";
import "../styles/ocr-override.css";
import jsPDF from "jspdf";

export default function OcrPanel() {
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [ocrResult, setOcrResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  /* ---------- UPLOAD ---------- */
  async function handleFiles(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles([file]);
    setSelectedFileIndex(0);
    setOcrResult("");

    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch(
      "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/pdf/upload",
      { method: "POST", credentials: "include", body: formData }
    );

    const data = await res.json();
    file.pdf_id = data.pdfs[0].pdf_id;
  }

  /* ---------- OCR ---------- */
  async function startOcr() {
    if (!selectedFile?.pdf_id) return;

    setIsRunning(true);
    setProgress(10);

    const formData = new FormData();
    formData.append("pdf_id", selectedFile.pdf_id);

    const res = await fetch(
      "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/pdf/ocr",
      { method: "POST", credentials: "include", body: formData }
    );

    const data = await res.json();
    setOcrResult(data.text || "");
    setProgress(100);
    setIsRunning(false);
  }

  /* ---------- ACTIONS ---------- */
  const downloadTxt = () => {
    const blob = new Blob([ocrResult], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr.txt";
    a.click();
  };

  const downloadCsv = () => {
    const blob = new Blob(["text\n" + ocrResult], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr.csv";
    a.click();
  };

  const downloadPdf = () => {
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

    doc.save("ocr.pdf");
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(ocrResult);
    alert("Copied!");
  };

  const reset = () => {
    setFiles([]);
    setSelectedFileIndex(null);
    setOcrResult("");
    setProgress(0);
  };

  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>
          OCR & <span>Recognition</span>
        </h2>
        <p>Extract text from PDFs</p>
      </div>

      <div className="ocr-content">
        {/* LEFT */}
        <div>
          {/* UPLOAD */}
          <div
            className="ocr-upload"
            onClick={() => document.getElementById("ocrFileInput").click()}
          >
            <div className="ocr-upload-icon">📄</div>
            <div className="ocr-upload-title">Upload PDF</div>
            <button className="ocr-upload-btn">Select PDF</button>
            <input
              id="ocrFileInput"
              type="file"
              accept=".pdf"
              hidden
              onChange={handleFiles}
            />
          </div>

          {/* PREVIEW A4 */}
          {selectedFile && (
            <div className="ocr-preview a4-preview">
              <iframe
                src={URL.createObjectURL(selectedFile)}
                title="preview"
              />
            </div>
          )}

          {/* START */}
          {selectedFile && !ocrResult && (
            <button className="ocr-start-btn" onClick={startOcr}>
              🚀 Start OCR
            </button>
          )}
        </div>

        {/* RIGHT */}
        <div className="ocr-output-right">
          <h4>Actions</h4>

          <button onClick={downloadTxt}>TXT</button>
          <button onClick={downloadCsv}>CSV</button>
          <button onClick={downloadPdf}>PDF</button>
          <button onClick={copyText}>Copy</button>

          {ocrResult && (
            <button className="process-another-btn" onClick={reset}>
              🔁 Process Another File
            </button>
          )}
        </div>
      </div>

      {/* OCR TEXT */}
      {ocrResult && (
        <div className="ocr-result-preview">
          <pre>{ocrResult}</pre>
        </div>
      )}
    </div>
  );
}