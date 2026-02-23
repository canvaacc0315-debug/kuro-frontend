import React, { useState, useEffect } from 'react';
import { pdfApi } from '../../services/pdfApi';
import './PDFTools.css';

// CraftMyPDFPanel component
const CraftMyPDFPanel = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateData, setTemplateData] = useState('{"name": "John Doe", "amount": 100}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await pdfApi.getTemplates();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = JSON.parse(templateData);
      const response = await pdfApi.generateFromTemplate(selectedTemplate, data);
      setResult(response);
      if (response.download_url) {
        window.open(response.download_url, '_blank');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="craftmypdf-panel">
      <h2>📄 Generate PDF from Template</h2>
      <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
        <option value="">Select Template...</option>
        {templates.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <textarea value={templateData} onChange={(e) => setTemplateData(e.target.value)} rows={6} />
      <button onClick={handleGenerate} disabled={loading || !selectedTemplate}>
        {loading ? 'Generating...' : 'Generate PDF'}
      </button>
      {result?.download_url && <a href={result.download_url} target="_blank" rel="noreferrer">Download PDF</a>}
    </div>
  );
};

// ILovePDFPanel component
const ILovePDFPanel = () => {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [ranges, setRanges] = useState('1-3');
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const handleMerge = async () => {
    if (files.length < 2) return alert('Select at least 2 PDFs');
    setLoading(true);
    try {
      const blob = await pdfApi.mergePDFs(files);
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
      <input type="file" multiple={current.multi} accept={activeTab === 'convert' ? '.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png' : '.pdf'} onChange={handleFileChange} />
      {activeTab === 'split' && <input type="text" placeholder="Page ranges" value={ranges} onChange={(e) => setRanges(e.target.value)} />}
      <button onClick={current.handler} disabled={loading || files.length === 0}>{loading ? 'Processing...' : current.label}</button>
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
        <CraftMyPDFPanel />
        <ILovePDFPanel />
      </div>
    </div>
  );
};

export default PDFWorkspace;