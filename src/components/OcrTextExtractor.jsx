// src/components/OcrTextExtractor.jsx
import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import html2pdf from "html2pdf.js";
import "../styles/ocr-text-extractor.css"; // your CSS for this component

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function OcrTextExtractor() {
  const [currentFile, setCurrentFile] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [showFileInfo, setShowFileInfo] = useState(false);

  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Initializing OCR...");

  const [statusType, setStatusType] = useState(null); // "error" | "success" | null
  const [statusMessage, setStatusMessage] = useState("");

  const [resultsVisible, setResultsVisible] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [pageIndicator, setPageIndicator] = useState("");

  const fileInputRef = useRef(null);

  // --------- helpers ---------
  const showStatus = (type, message) => {
    setStatusType(type);
    setStatusMessage(message);
  };

  const updateProgress = (value, label) => {
    setProgress(value);
    setProgressLabel(label);
  };

  const clearSelection = () => {
    setCurrentFile(null);
    setCurrentFileName("");
    setFileType("");
    setFileSize("");
    setShowFileInfo(false);

    setProgressVisible(false);
    setProgress(0);
    setProgressLabel("Initializing OCR...");

    setResultsVisible(false);
    setExtractedText("");
    setCharCount(0);
    setPageIndicator("");

    setStatusType(null);
    setStatusMessage("");
  };

  const handleFileSelect = (file) => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!validTypes.includes(file.type)) {
      showStatus(
        "error",
        "❌ Invalid file type. Please upload a PDF or JPEG/JPG/PNG image."
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showStatus("error", "❌ File is too large. Maximum size is 50MB.");
      return;
    }

    setCurrentFile(file);
    setCurrentFileName(file.name);
    setFileType(file.type === "application/pdf" ? "PDF" : "IMAGE");
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");

    setShowFileInfo(true);
    setResultsVisible(false);
    setProgressVisible(false);
    setStatusType(null);
    setStatusMessage("");
  };

  // --------- OCR core functions ----------
  // 1) PDF -> text
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    const totalPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      updateProgress(
        (pageNum / totalPages) * 50,
        `Extracting PDF page ${pageNum} of ${totalPages}...`
      );
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((i) => i.str).join(" ");
      fullText += pageText + "\n\n";
    }

    return {
      text: fullText,
      info: `PDF: ${totalPages} page(s) processed`,
    };
  };

  // 2) IMAGE -> text (THIS is the extractTextFromImage you asked about)
  const extractTextFromImage = async (file) => {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

    // Use Tesseract.recognize directly – no worker.load()
    const result = await Tesseract.recognize(dataUrl, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const pct = m.progress || 0;
          const val = 50 + pct * 50; // 50–100%
          updateProgress(val, `OCR Processing: ${Math.round(pct * 100)}%`);
        }
      },
    });

    return {
      text: result.data.text,
      info: "Image: OCR processed",
    };
  };

  // --------- UI actions ----------
  const handleProcess = async () => {
    if (!currentFile) return;

    setProgressVisible(true);
    setResultsVisible(false);
    setStatusType(null);
    setStatusMessage("");
    updateProgress(0, "Initializing OCR worker...");

    try {
      let out;
      if (currentFile.type === "application/pdf") {
        out = await extractTextFromPDF(currentFile);
      } else {
        updateProgress(50, "Loading OCR engine...");
        out = await extractTextFromImage(currentFile);
      }

      setExtractedText(out.text);
      setCharCount(out.text.length);
      setPageIndicator(out.info || "");
      setResultsVisible(true);
      setProgressVisible(false);
      showStatus("success", "✅ OCR processing completed successfully!");
    } catch (err) {
      console.error(err);
      showStatus("error", `❌ Error processing file: ${err.message}`);
      setProgressVisible(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!extractedText) return;

    const element = document.createElement("div");
    element.style.whiteSpace = "pre-wrap";
    element.style.wordWrap = "break-word";
    element.style.padding = "20px";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.lineHeight = "1.6";
    element.innerHTML = extractedText
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    const opt = {
      margin: 10,
      filename: currentFileName.replace(/\.[^/.]+$/, "") + "_extracted.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
    showStatus("success", "✅ PDF downloaded successfully!");
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard
      .writeText(extractedText)
      .then(() => {
        showStatus("success", "📋 Text copied to clipboard!");
      })
      .catch(() => {
        showStatus("error", "❌ Failed to copy text.");
      });
  };

  // --------- JSX ---------
  return (
    <div className="ocr-root">
      <div className="ocr-header">
        <h2>📄 OCR Text Extractor</h2>
        <p>Convert images (JPEG/JPG/PNG) and PDFs to searchable text PDFs</p>
      </div>

      {/* Upload box */}
      <div
        className="ocr-upload-area"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("dragover");
        }}
        onDragLeave={(e) => e.currentTarget.classList.remove("dragover")}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("dragover");
          const files = e.dataTransfer.files;
          if (files.length > 0) handleFileSelect(files[0]);
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
        <div className="upload-icon">📤</div>
        <p className="upload-text">Click to upload or drag and drop</p>
        <p className="upload-subtext">
          Supported: PDF, JPEG, JPG, PNG (Max 50MB per file)
        </p>
      </div>

      {/* File info */}
      {showFileInfo && (
        <div className="file-info active">
          <div className="file-info-row">
            <span className="file-name">{currentFileName}</span>
            <span className="file-type">{fileType}</span>
          </div>
          <div className="file-info-row">
            <span>File Size:</span>
            <span>{fileSize}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        {currentFile && (
          <>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleProcess}
            >
              🚀 START OCR PROCESSING
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={clearSelection}
            >
              ✕ CLEAR
            </button>
          </>
        )}
      </div>

      {/* Status */}
      {statusType && (
        <div
          className={`status-message active ${
            statusType === "error"
              ? "status-error"
              : statusType === "success"
              ? "status-success"
              : "status-info"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Progress */}
      {progressVisible && (
        <div className="progress-section active">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">{progressLabel}</p>
        </div>
      )}

      {/* Results */}
      {resultsVisible && (
        <div className="results-section active">
          <div className="results-container">
            <div className="results-header">
              <h3 className="results-title">Extracted Text</h3>
              <span className="char-count">{charCount} characters</span>
            </div>
            <div className="extracted-text">{extractedText}</div>
            <div className="page-indicator">{pageIndicator}</div>

            <div className="download-buttons">
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleDownloadPdf}
              >
                ⬇ Download as Searchable PDF
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleCopy}
              >
                📋 Copy Text
              </button>
            </div>
          </div>

          <button
            className="btn btn-secondary reset-btn"
            type="button"
            onClick={clearSelection}
          >
            ↺ Process Another File
          </button>
        </div>
      )}
    </div>
  );
}