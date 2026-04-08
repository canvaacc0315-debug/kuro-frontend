import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApiClient } from "../api/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  FileText, 
  List, 
  HelpCircle, 
  BookOpen, 
  Zap, 
  Clock, 
  AlignCenter, 
  AlignLeft, 
  MessageSquare,
  Lightbulb,
  Save,
  Trash2,
  ChevronDown,
  Upload,
  Sparkles,
  Download
} from "lucide-react";
import "/src/styles/analysis.css";

const TASK_OPTIONS = [
  { id: "summary", label: "Summary", icon: <FileText size={18} /> },
  { id: "key_points", label: "Key points", icon: <List size={18} /> },
  { id: "definitions", label: "Definitions", icon: <BookOpen size={18} /> },
  { id: "flashcards", label: "Flashcards", icon: <Zap size={18} /> },
  { id: "mcq", label: "MCQs", icon: <HelpCircle size={18} /> },
  { id: "study_guide", label: "Study guide", icon: <AlignLeft size={18} /> },
];

const MODE_OPTIONS = [
  { id: "short", label: "Short", desc: "Brief highlights" },
  { id: "detailed", label: "Detailed", desc: "Deep analysis" },
  { id: "bullets", label: "Bullets", desc: "Scan-ready points" },
  { id: "examples", label: "Examples", desc: "Practical cases" },
  { id: "kid-friendly", label: "Explain like I'm 10", desc: "Simpler concepts" },
];

export default function AnalysisPanel({
  pdfs = [],
  selectedPdfId = "",
  onPdfChange,
  sessionId = "", 
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
    (p) => (p.id ?? p.pdf_id ?? p.backendId) === selectedPdfId
  );

  async function runAnalysis() {
    if (!selectedPdfId || loading) return;

    if (!sessionId) {
      setError("No active session. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setSaveStatus("");

    try {
      const data = await analysePdf(selectedPdfId, task, mode, sessionId);
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
          // ignore
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

  return (
    <div className="analysis-container-modern">
      <motion.div
        className="analysis-header-premium"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="title-section">
          <div className="accent-badge">AI Analysis</div>
          <h1>Transform Your Documents</h1>
          <p>Extract insights, generate flashcards, or simplify complex topics in seconds.</p>
        </div>
      </motion.div>

      <div className="analysis-layout-grid">
        {/* Settings Panel */}
        <motion.div 
          className="settings-panel-glass"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="panel-section">
            <label className="section-label">Target Document</label>
            <div className="custom-select-wrapper">
              <select
                className="modern-select"
                value={selectedPdfId}
                onChange={(e) => onPdfChange && onPdfChange(e.target.value)}
                disabled={safePdfs.length === 0}
              >
                {safePdfs.length === 0 ? (
                  <option>No PDFs uploaded yet</option>
                ) : (
                  <>
                    <option value="">Select a PDF...</option>
                    {safePdfs.map((pdf) => (
                      <option
                        key={pdf.id ?? pdf.pdf_id ?? pdf.backendId}
                        value={pdf.id ?? pdf.pdf_id ?? pdf.backendId}
                      >
                        {pdf.name || pdf.filename}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="select-arrow" size={16} />
            </div>
          </div>

          <div className="panel-section">
            <label className="section-label">Analysis Task</label>
            <div className="task-grid-input">
              {TASK_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`task-pill ${task === opt.id ? "active" : ""}`}
                  onClick={() => setTask(opt.id)}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <label className="section-label">Output Style</label>
            <div className="mode-stack-input">
              {MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`mode-item ${mode === opt.id ? "active" : ""}`}
                  onClick={() => setMode(opt.id)}
                >
                  <div className="mode-info">
                    <span className="mode-label">{opt.label}</span>
                    <span className="mode-desc">{opt.desc}</span>
                  </div>
                  <div className="radio-dot" />
                </button>
              ))}
            </div>
          </div>

          <div className="panel-actions-modern">
            <button
              className={`action-btn-primary ${loading ? 'loading' : ''}`}
              onClick={runAnalysis}
              disabled={!selectedPdfId || !sessionId || loading}
            >
              <Sparkles size={18} />
              {loading ? "Analyzing..." : "Generate Analysis"}
            </button>
            <div className="secondary-actions">
              <button
                className="action-btn-outline"
                onClick={handleSaveAnalysis}
                disabled={!result || loading}
                title="Save & Download"
              >
                <Save size={18} />
              </button>
              <button
                className="action-btn-outline delete"
                onClick={handleClearAnalysis}
                disabled={(!result && !error) || loading}
                title="Clear Result"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Result Area */}
        <motion.div 
          className="result-panel-glass"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="result-header">
            <h3>Investigation Report</h3>
            {result && (
              <button className="copy-btn-minimal" onClick={() => downloadTextFile(result, 'analysis.txt')}>
                <Download size={14} />
                TXT
              </button>
            )}
          </div>

          <div className="result-content-container">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="analysis-loading-state"
                >
                  <div className="skeleton-strip long" />
                  <div className="skeleton-strip medium" />
                  <div className="skeleton-strip short" />
                  <div className="skeleton-strip long" />
                  <div className="skeleton-pulse-block" />
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="analysis-error-banner"
                >
                  <HelpCircle size={24} />
                  <p>{error}</p>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="analysis-rich-text"
                >
                  {saveStatus && <div className="toast-subtle">{saveStatus}</div>}
                  <div className="markdown-content analysis-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  className="analysis-empty-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                >
                  <Lightbulb size={48} />
                  <p>Configuration complete. Ready to analyze.</p>
                  <span>Select document options to begin extraction.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}