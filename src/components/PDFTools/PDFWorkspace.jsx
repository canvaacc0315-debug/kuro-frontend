import React, { useState, useEffect } from 'react';
import { pdfApi } from '../../services/pdfApi';
import './PDFTools.css';

// CraftMyPDFPanel component has been removed (pending new PDF Tool selection)
const ComingSoonPanel = () => {
  return (
    <div className="craftmypdf-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✨</div>
      <h3 style={{ color: '#334155', marginBottom: '10px' }}>New Tool Coming Soon</h3>
      <p style={{ color: '#64748b' }}>We are building a brand new PDF utility to replace the template generator.</p>
    </div>
  );
};

// ILovePDFPanel component
const ILovePDFPanel = () => {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);         // Used for non-merge tabs
  const [mergeFile1, setMergeFile1] = useState(null); // Explicit merge file 1
  const [mergeFile2, setMergeFile2] = useState(null); // Explicit merge file 2
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
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSplit = async () => {
    if (files.length !== 1) return alert('Select exactly 1 PDF');
    setLoading(true);
    try {
      const blob = await pdfApi.splitPDF(files[0], ranges);
      pdfApi.downloadBlob(blob, 'split.pdf');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (files.length !== 1) return alert('Select 1 file');
    setLoading(true);
    try {
      const blob = await pdfApi.convertToPDF(files[0]);
      pdfApi.downloadBlob(blob, 'converted.pdf');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (files.length !== 1) return alert('Select 1 PDF');
    setLoading(true);
    try {
      const result = await pdfApi.extractText(files[0]);
      setExtractedText(result.text);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = {
    merge: { label: 'Merge PDFs', handler: handleMerge, multi: true },
    split: { label: 'Split PDF', handler: handleSplit, multi: false },
    convert: { label: 'Convert to PDF', handler: handleConvert, multi: false },
    extract: { label: 'Extract Text', handler: handleExtract, multi: false }
  };

  const current = tabs[activeTab];

  return (
    <div className="ilovepdf-panel">
      <h2>🛠️ PDF Tools</h2>
      <div className="tabs">
        {Object.keys(tabs).map(key => (
          <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
            {tabs[key].label}
          </button>
        ))}
      </div>
      {activeTab === 'merge' ? (
        <div className="merge-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>First PDF:</label>
            <input type="file" accept=".pdf" onChange={handleMergeFile1Change} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Second PDF:</label>
            <input type="file" accept=".pdf" onChange={handleMergeFile2Change} />
          </div>
        </div>
      ) : (
        <input type="file" multiple={current.multi} accept={activeTab === 'convert' ? '.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png' : '.pdf'} onChange={handleFileChange} />
      )}

      {activeTab === 'split' && <input type="text" placeholder="Page ranges" value={ranges} onChange={(e) => setRanges(e.target.value)} />}
      <button
        onClick={current.handler}
        disabled={loading || (activeTab === 'merge' ? (!mergeFile1 || !mergeFile2) : files.length === 0)}
      >
        {loading ? 'Processing...' : current.label}
      </button>
      {extractedText && activeTab === 'extract' && <pre>{extractedText}</pre>}
    </div>
  );
};

// Main PDFWorkspace component
const PDFWorkspace = () => {
  return (
    <div className="pdf-workspace">
      <h1>RovexAI PDF Studio</h1>
      <div className="panels-grid">
        <ILovePDFPanel />
        <ComingSoonPanel />
      </div>
    </div>
  );
};

export default PDFWorkspace;
//done