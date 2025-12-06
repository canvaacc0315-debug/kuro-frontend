// src/components/AnalysisPanel.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useApiClient } from "../api/client";

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

  const [task, setTask] = useState("summary");
  const [mode, setMode] = useState("detailed");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // ✅ status for save / clear

  const safePdfs = Array.isArray(pdfs) ? pdfs : [];

  // works with { id, name } or { pdf_id, filename }
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

  // small helper for file download
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

  // ✅ Save analysis (localStorage + download)
  function handleSaveAnalysis() {
    if (!result || !result.trim()) {
      setSaveStatus("Nothing to save – run an analysis first.");
      return;
    }

    // 1) Save to localStorage (simple history)
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
      // we still continue to file download
    }

    // 2) Trigger a .txt download so user sees it immediately
    const baseName = selected?.name || selected?.filename || "analysis";
    const safeName = baseName.replace(/[^\w.-]+/g, "_");
    downloadTextFile(
      result,
      `${safeName}-${task}-${Date.now()}.txt`
    );

    setSaveStatus("Analysis saved.");
  }

  // ✅ Clear current analysis
  function handleClearAnalysis() {
    setResult("");
    setError("");
    setSaveStatus("");
  }

  return (
    <div className="analysis-panel">
      {/* ---------- HEADER ---------- */}
      <div className="analysis-header">
        <div className="analysis-title-block">
          <div className="analysis-label">ANALYSIS</div>
          <div className="analysis-subtitle">
            {selected
              ? `Analysing: ${selected.name || selected.filename}`
              : "Select a PDF from chat or upload tab"}
          </div>
        </div>

        <div className="analysis-controls">
          {/* PDF DROPDOWN */}
          <div className="analysis-control-group">
            <label className="analysis-control-label">PDF</label>
            <select
              className="analysis-select"
              value={selectedPdfId}
              onChange={(e) => onPdfChange && onPdfChange(e.target.value)}
              disabled={safePdfs.length === 0}
            >
              {safePdfs.length === 0 ? (
                <option>No PDFs uploaded</option>
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
          </div>

          {/* TASK DROPDOWN */}
          <div className="analysis-control-group">
            <label className="analysis-control-label">Task</label>
            <select
              className="analysis-select"
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

          {/* ANSWER STYLE DROPDOWN */}
          <div className="analysis-control-group">
            <label className="analysis-control-label">Answer style</label>
            <select
              className="analysis-select"
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

          {/* BUTTONS: GENERATE / SAVE / CLEAR */}
          <button
            type="button"
            className="analysis-generate-btn"
            onClick={runAnalysis}
            disabled={!selectedPdfId || loading}
          >
            {loading ? "Running…" : "Generate"}
          </button>

          <button
            type="button"
            className="analysis-generate-btn"
            onClick={handleSaveAnalysis}
            disabled={!result || loading}
          >
            💾 Save Analysis
          </button>

          <button
            type="button"
            className="analysis-generate-btn"
            onClick={handleClearAnalysis}
            disabled={(!result && !error) || loading}
          >
            🗑 Clear
          </button>
        </div>
      </div>

      {/* ---------- RESULT CARD ---------- */}
      <div className="analysis-result-card">
        <div className="analysis-result-inner">
          {/* small inline status for save/clear */}
          {saveStatus && (
            <div
              style={{
                fontSize: 12,
                marginBottom: 8,
                color: saveStatus.startsWith("Analysis")
                  ? "#9be7ff"
                  : "#ffb3b3",
              }}
            >
              {saveStatus}
            </div>
          )}

          {error && <div className="analysis-error">{error}</div>}

          {!error && !result && !loading && (
            <div className="analysis-placeholder">
              Choose a task (summary, flashcards, MCQs, etc.) and click{" "}
              <span>Generate</span> to see AI analysis here.
            </div>
          )}

          <div className="analysis-result-scroll">
            <AnimateTextBlock text={result} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Animated result ---------- */
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