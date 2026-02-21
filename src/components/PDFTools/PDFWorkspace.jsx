import React from 'react';
import CraftMyPDFPanel from './CraftMyPDFPanel';
import ILovePDFPanel from './ILovePDFPanel';
import './PDFTools.css';

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