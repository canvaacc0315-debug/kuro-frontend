import React, { useState } from 'react';
import { pdfApi } from '../../services/pdfApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Combine, Scissors, FileOutput, FileSearch, Upload, Loader2, Download, Sparkles
} from 'lucide-react';
import './PDFTools.css';

const ILovePDFPanel = () => {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [mergeFile1, setMergeFile1] = useState(null);
  const [mergeFile2, setMergeFile2] = useState(null);
  const [ranges, setRanges] = useState('1-3');
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));
  const handleMergeFile1Change = (e) => setMergeFile1(e.target.files[0] || null);
  const handleMergeFile2Change = (e) => setMergeFile2(e.target.files[0] || null);

  const handleMerge = async () => {
    if (!mergeFile1 || !mergeFile2) return alert('Select both PDFs to merge');
    setLoading(true);
    try {
      const blob = await pdfApi.mergePDFs([mergeFile1, mergeFile2]);
      pdfApi.downloadBlob(blob, 'merged.pdf');
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  const handleSplit = async () => {
    if (files.length !== 1) return alert('Select exactly 1 PDF');
    setLoading(true);
    try {
      const blob = await pdfApi.splitPDF(files[0], ranges);
      pdfApi.downloadBlob(blob, 'split.pdf');
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  const handleConvert = async () => {
    if (files.length !== 1) return alert('Select 1 file');
    setLoading(true);
    try {
      const blob = await pdfApi.convertToPDF(files[0]);
      pdfApi.downloadBlob(blob, 'converted.pdf');
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  const handleExtract = async () => {
    if (files.length !== 1) return alert('Select 1 PDF');
    setLoading(true);
    try {
      const result = await pdfApi.extractText(files[0]);
      setExtractedText(result.text);
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  const tools = [
    { id: 'merge', icon: <Combine size={20} />, label: 'Merge', desc: 'Combine multiple PDFs into one', color: '#6366f1', handler: handleMerge },
    { id: 'split', icon: <Scissors size={20} />, label: 'Split', desc: 'Extract specific pages', color: '#f59e0b', handler: handleSplit },
    { id: 'convert', icon: <FileOutput size={20} />, label: 'Convert', desc: 'Convert files to PDF', color: '#10b981', handler: handleConvert },
    { id: 'extract', icon: <FileSearch size={20} />, label: 'Extract', desc: 'Pull text from PDF', color: '#8b5cf6', handler: handleExtract },
  ];

  const current = tools.find(t => t.id === activeTab);

  return (
    <div className="pdft-tools-section">
      {/* Tool Selector Grid */}
      <div className="pdft-tool-grid">
        {tools.map((tool, i) => (
          <motion.button
            key={tool.id}
            className={`pdft-tool-card ${activeTab === tool.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tool.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="pdft-tool-icon" style={{ color: tool.color, backgroundColor: `${tool.color}15` }}>
              {tool.icon}
            </div>
            <span className="pdft-tool-label">{tool.label}</span>
            <span className="pdft-tool-desc">{tool.desc}</span>
          </motion.button>
        ))}
      </div>

      {/* Active Tool Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="pdft-active-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="pdft-panel-header">
            <div className="pdft-panel-icon" style={{ color: current.color, backgroundColor: `${current.color}15` }}>
              {current.icon}
            </div>
            <div>
              <h3>{current.label} PDF</h3>
              <p>{current.desc}</p>
            </div>
          </div>

          <div className="pdft-panel-body">
            {activeTab === 'merge' ? (
              <div className="pdft-upload-group">
                <label className="pdft-file-label">
                  <Upload size={18} />
                  {mergeFile1 ? mergeFile1.name : 'Choose First PDF'}
                  <input type="file" accept=".pdf" onChange={handleMergeFile1Change} hidden />
                </label>
                <label className="pdft-file-label">
                  <Upload size={18} />
                  {mergeFile2 ? mergeFile2.name : 'Choose Second PDF'}
                  <input type="file" accept=".pdf" onChange={handleMergeFile2Change} hidden />
                </label>
              </div>
            ) : (
              <label className="pdft-file-label">
                <Upload size={18} />
                {files.length > 0 ? files.map(f => f.name).join(', ') : `Choose ${activeTab === 'convert' ? 'a file' : 'a PDF'}`}
                <input type="file" accept={activeTab === 'convert' ? '.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png' : '.pdf'} onChange={handleFileChange} hidden />
              </label>
            )}

            {activeTab === 'split' && (
              <input
                type="text"
                className="pdft-text-input"
                placeholder="Page ranges (e.g. 1-3, 5, 7-9)"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
              />
            )}

            <button
              className="pdft-action-btn"
              onClick={current.handler}
              disabled={loading || (activeTab === 'merge' ? (!mergeFile1 || !mergeFile2) : files.length === 0)}
              style={{ '--btn-color': current.color }}
            >
              {loading ? <><Loader2 size={18} className="pdft-spin" /> Processing…</> : <><Sparkles size={18} /> {current.label}</>}
            </button>
          </div>

          {extractedText && activeTab === 'extract' && (
            <motion.pre
              className="pdft-extracted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {extractedText}
            </motion.pre>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PDFWorkspace = () => {
  return (
    <div className="pdft-container">
      <motion.div
        className="pdft-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pdft-accent-badge"><Sparkles size={14} /> PDF Studio</div>
        <h1>PDF Tools</h1>
        <p>Merge, split, convert, and extract text from your PDFs with ease.</p>
      </motion.div>
      <ILovePDFPanel />
    </div>
  );
};

export default PDFWorkspace;