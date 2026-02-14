// src/components/AnalysisPanel.jsx
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useApiClient } from "../api/client";
import "/src/styles/analysis.css";
// Note: Import the new CSS file in your parent component or via index.css
// e.g., import './analysis-panel.css';

const TASK_OPTIONS = [
  { id: "summary", label: "Summary" },
  { id: "key_points", label: "Key points" },
  { id: "definitions", label: "Definitions" },
  { id: "flashcards", label: "Flashcards" },
  { id: "mcq", label: "MCQs" },
  { id: "study_guide", label: "Study guide" },
];

const MODE_OPTIONS = [
  { id: "short", label: "Short" },
  { id: "detailed", label: "Detailed" },
  { id: "bullets", label: "Bullets" },
  { id: "examples", label: "Examples" },
  { id: "kid-friendly", label: "Explain like I'm 10" },
];

export default function AnalysisPanel({
  pdfs = [],           // from KuroWorkspacePage: uploadedFiles
  selectedPdfId = "",  // from workspace state
  onPdfChange,         // callback: setSelectedPdfId
}) {
  const { analysePdf } = useApiClient();
  const fileInputRef = useRef(null);

  const [task, setTask] = useState("summary");
  const [mode, setMode] = useState("detailed");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const safePdfs = Array.isArray(pdfs) ? pdfs : [];

  const selected = safePdfs.find(
    (p) => (p.id ?? p.pdf_id) === selectedPdfId
  );

  async function runAnalysis() {
    if (!selectedPdfId || loading) return;

    setLoading(true);
    setError("");
    setResult("");
    setSaveStatus("");

    try {
      const data = await analysePdf(selectedPdfId, task, mode);
      setResult(data?.result || "");
    } catch (err) {
      console.error(err);
      setError(
        err?.message || "Something went wrong. Check the backend logs."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleSaveAnalysis() {
    if (!result || !result.trim()) {
      setSaveStatus("Nothing to save – run an analysis first.");
      return;
    }

    try {
      const key = "kuroAnalysisHistory";
      const raw = window.localStorage.getItem(key);
      let history = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) history = parsed;
        } catch {
          // ignore parse errors, start fresh
        }
      }

      const entry = {
        id: `analysis-${Date.now()}`,
        pdfId: selectedPdfId || null,
        pdfName: selected?.name || selected?.filename || "",
        task,
        mode,
        result,
        createdAt: new Date().toISOString(),
      };

      history.unshift(entry);
      window.localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to save analysis to localStorage:", e);
    }

    const baseName = selected?.name || selected?.filename || "analysis";
    const safeName = baseName.replace(/[^\w.-]+/g, "_");
    downloadTextFile(
      result,
      `${safeName}-${task}-${Date.now()}.txt`
    );

    setSaveStatus("Analysis saved.");
  }

  function handleClearAnalysis() {
    setResult("");
    setError("");
    setSaveStatus("");
  }

  // TODO: Implement actual PDF upload logic here (e.g., call uploadPdf from useApiClient and update pdfs via parent callback)
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Example: const uploaded = await uploadPdf(file);
    // onPdfChange(uploaded.id);
    // Parent should update pdfs prop after upload.
    console.log("Uploading PDF:", file.name); // Placeholder
  }

  return (
    <motion.div
      className="page-canvas"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="analysis-card"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="analysis-title">ANALYSIS</div>
        <div className="analysis-subtitle">
          Select a PDF from chat or upload tab
        </div>

        <label className="form-label">PDF</label>
        <div className="pdf-input-group">
          <select
            className="pdf-select"
            value={selectedPdfId}
            onChange={(e) => onPdfChange && onPdfChange(e.target.value)}
            disabled={safePdfs.length === 0}
          >
            {safePdfs.length === 0 ? (
              <option>No PDFs uploaded yet</option>
            ) : (
              <>
                <option value="">Select PDF…</option>
                {safePdfs.map((pdf) => (
                  <option
                    key={pdf.id ?? pdf.pdf_id}
                    value={pdf.id ?? pdf.pdf_id}
                  >
                    {pdf.name || pdf.filename}
                  </option>
                ))}
              </>
            )}
          </select>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            hidden
            onChange={handleUpload}
          />
        </div>

        <div className="task-group">
          <label className="form-label">Task</label>
          <div className="task-selects">
            <select
              className="select"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            >
              {TASK_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="answer-style-group">
          <label className="form-label">Answer Style</label>
          <select
            className="select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {MODE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="action-buttons">
          <button
            type="button"
            className="button generate-btn"
            onClick={runAnalysis}
            disabled={!selectedPdfId || loading}
          >
            <span className="icon-lightbulb">💡</span>
            {loading ? "Running…" : "Generate"}
          </button>

          <button
            type="button"
            className="button save-btn"
            onClick={handleSaveAnalysis}
            disabled={!result || loading}
          >
            <span className="icon-save">B</span> Save Analysis
          </button>

          <button
            type="button"
            className="button clear-btn"
            onClick={handleClearAnalysis}
            disabled={(!result && !error) || loading}
          >
            <span className="icon-clear">🗑️</span> Clear
          </button>
        </div>

        <div className="analysis-result-card">
          <div className="analysis-result-inner">
            {saveStatus && (
              <div
                className={`analysis-save-status ${saveStatus.startsWith("Analysis") ? "success" : ""}`}
              >
                {saveStatus}
              </div>
            )}

            {error && <div className="analysis-error">{error}</div>}

            {!error && !result && !loading && (
              <div className="analysis-placeholder">
                Choose a task (summary, flashcards, MCQs, etc.) and click Generate to see AI analysis here.
              </div>
            )}

            <div className="analysis-result-scroll">
              <AnimateTextBlock text={result} loading={loading} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AnimateTextBlock({ text, loading }) {
  if (loading) {
    return (
      <div className="analysis-skeleton">
        <div />
        <div />
        <div />
        <div />
      </div>
    );
  }

  if (!text) return null;

  return (
    <motion.pre
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="analysis-result-text"
    >
      {text}
    </motion.pre>
  );
}