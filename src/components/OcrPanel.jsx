import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import "../styles/ocr-override.css";

export default function OcrPanel() {
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");
  const [txtPreview, setTxtPreview] = useState("");

  const selectedFile = useMemo(() => {
    if (selectedFileIndex === null) return null;
    return files[selectedFileIndex] || null;
  }, [files, selectedFileIndex]);

  /* ================= FILE UPLOAD ================= */
  async function handleFiles(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type.includes("pdf");
    const isImage = file.type.includes("image");
    const isTxt = file.type === "text/plain";

    if (!isPdf && !isImage && !isTxt) {
      alert("Only PDF, PNG, JPG or TXT files are supported");
      return;
    }

    setFiles([file]);
    setSelectedFileIndex(0);
    setOcrResult("");
    setTxtPreview("");

    // TXT → read directly (NO OCR)
    if (isTxt) {
      const reader = new FileReader();
      reader.onload = () => {
        setOcrResult(reader.result);
        setTxtPreview(reader.result);
      };
      reader.readAsText(file);
      return;
    }

    // PDF → upload first (existing flow)
    if (isPdf) {
      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch(
        "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/pdf/upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();
      file.pdf_id = data.pdfs[0].pdf_id;
    }
  }

  /* ================= OCR ================= */
  async function startOcr() {
    if (!selectedFile) return;

    const isPdf = selectedFile.type.includes("pdf");
    const isImage = selectedFile.type.includes("image");

    setIsRunning(true);
    setProgress(20);
    setOcrResult("");

    try {
      // PDF OCR
      if (isPdf) {
        const formData = new FormData();
        formData.append("pdf_id", selectedFile.pdf_id);

        const res = await fetch(
          "https://canvaacc0315-debug-canvaacc0315-debug.hf.space/api/pdf/ocr",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        const data = await res.json();
        setOcrResult(data.text || "");
      }

      // IMAGE OCR
      if (isImage) {
        const formData = new FormData();
        formData.append("file", selectedFile);

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
      }

      setProgress(100);
    } catch (e) {
      alert("OCR failed");
    } finally {
      setIsRunning(false);
    }
  }

  /* ================= EXPORT ACTIONS ================= */
  function downloadTxt() {
    const blob = new Blob([ocrResult], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr.txt";
    a.click();
  }

  function downloadCsv() {
    const blob = new Blob(["text\n" + ocrResult], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr.csv";
    a.click();
  }

  function downloadPdf() {
    const doc = new jsPDF("p", "mm", "a4");
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const lines = doc.splitTextToSize(
      ocrResult,
      pageWidth - margin * 2
    );

    let y = margin;
    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save("ocr-result.pdf");
  }

  function copyText() {
    navigator.clipboard.writeText(ocrResult);
    alert("Copied to clipboard");
  }

  function resetOcr() {
    setFiles([]);
    setSelectedFileIndex(null);
    setOcrResult("");
    setTxtPreview("");
    setProgress(0);
    setIsRunning(false);
    document.getElementById("ocrFileInput").value = "";
  }

  /* ================= UI ================= */
  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>OCR & <span>Recognition</span></h2>
        <p>Extract text from PDF, Images & TXT</p>
      </div>

      <div className="ocr-output-layout">
        {/* LEFT */}
        <div className="ocr-output-left">
          <div
            className="ocr-upload"
            onClick={() => document.getElementById("ocrFileInput").click()}
          >
            <div className="ocr-upload-icon">📄</div>
            <div className="ocr-upload-title">Upload File</div>
            <button className="ocr-upload-btn">Select File</button>
            <input
              id="ocrFileInput"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              hidden
              onChange={handleFiles}
            />
          </div>

          {/* PREVIEW */}
          {selectedFile && selectedFile.type.includes("pdf") && (
            <iframe
              src={URL.createObjectURL(selectedFile)}
              className="ocr-preview-frame"
              title="preview"
            />
          )}

          {selectedFile && selectedFile.type.includes("image") && (
            <div className="ocr-image-preview">
              <img src={URL.createObjectURL(selectedFile)} alt="preview" />
            </div>
          )}

          {selectedFile && selectedFile.type === "text/plain" && (
            <pre className="ocr-result-preview">{txtPreview}</pre>
          )}
        </div>

        {/* RIGHT */}
        <div className="ocr-output-right">
          <h4>Actions</h4>

          <button
            onClick={startOcr}
            disabled={
              !selectedFile ||
              selectedFile.type === "text/plain" ||
              isRunning
            }
          >
            {isRunning ? "Processing..." : "🚀 Start OCR"}
          </button>

          <button disabled={!ocrResult} onClick={downloadTxt}>Save as TXT</button>
          <button disabled={!ocrResult} onClick={downloadCsv}>Save as CSV</button>
          <button disabled={!ocrResult} onClick={downloadPdf}>Save as PDF</button>
          <button disabled={!ocrResult} onClick={copyText}>Copy To Clipboard</button>

          <div className="ocr-result-preview">
            <h5>Extracted Text</h5>
            {ocrResult ? (
              <pre>{ocrResult}</pre>
            ) : (
              <div className="ocr-placeholder">
                OCR result will appear here
              </div>
            )}
          </div>

          <button
            className="process-another-btn"
            disabled={!ocrResult}
            onClick={resetOcr}
          >
            🔁 Process Another File
          </button>

          {isRunning && (
            <div className="ocr-progress-wrapper">
              <div className="ocr-progress-bar">
                <div
                  className="ocr-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="ocr-progress-text">{progress}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}