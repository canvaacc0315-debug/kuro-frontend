/* PDF TOOLS ONLY - Scoped to not affect rest of website */
.pdf-workspace {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: inherit;
  color: #1a1a1a;
  background: #ffffff;
  min-height: calc(100vh - 200px);
}

.pdf-workspace h1 {
  text-align: center;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.pdf-workspace h1::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: #e53935;
  margin: 12px auto 0;
  border-radius: 2px;
}

.pdf-workspace > p {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
  font-size: 14px;
}

/* Grid layout */
.panels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

/* Panels */
.craftmypdf-panel, 
.ilovepdf-panel {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.craftmypdf-panel:hover, 
.ilovepdf-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e53935;
}

.craftmypdf-panel h2,
.ilovepdf-panel h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

/* Tabs */
.ilovepdf-panel .tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 8px;
}

.ilovepdf-panel .tabs button {
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  font-size: 13px;
  transition: all 0.2s ease;
}

.ilovepdf-panel .tabs button:hover {
  background: rgba(229, 57, 53, 0.1);
  color: #e53935;
}

.ilovepdf-panel .tabs button.active {
  background: #e53935;
  color: white;
  box-shadow: 0 2px 8px rgba(229, 57, 53, 0.3);
}

/* Form elements - scoped to panels only */
.craftmypdf-panel input,
.craftmypdf-panel select,
.craftmypdf-panel textarea,
.ilovepdf-panel input,
.ilovepdf-panel select,
.ilovepdf-panel textarea {
  width: 100%;
  margin: 8px 0;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  color: #1a1a1a;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.craftmypdf-panel input:focus,
.craftmypdf-panel select:focus,
.craftmypdf-panel textarea:focus,
.ilovepdf-panel input:focus,
.ilovepdf-panel select:focus,
.ilovepdf-panel textarea:focus {
  outline: none;
  border-color: #e53935;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

.craftmypdf-panel textarea,
.ilovepdf-panel textarea {
  min-height: 120px;
  resize: vertical;
  font-family: monospace;
}

/* Buttons - scoped to panels only */
.craftmypdf-panel button,
.ilovepdf-panel button:not(.tabs button) {
  width: 100%;
  padding: 14px 24px;
  background: #e53935;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.25);
}

.craftmypdf-panel button:hover,
.ilovepdf-panel button:not(.tabs button):hover {
  background: #c62828;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 57, 53, 0.35);
}

.craftmypdf-panel button:disabled,
.ilovepdf-panel button:disabled {
  opacity: 0.5;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
  background: #ccc;
}

/* Links */
.craftmypdf-panel a {
  display: inline-block;
  margin-top: 16px;
  color: #e53935;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
}

.craftmypdf-panel a:hover {
  text-decoration: underline;
}

/* Preformatted text for extracted content */
.ilovepdf-panel pre {
  background: #1a1a1a;
  color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
  font-size: 13px;
  line-height: 1.6;
  font-family: monospace;
}

/* Scrollbar styling */
.ilovepdf-panel pre::-webkit-scrollbar {
  width: 8px;
}

.ilovepdf-panel pre::-webkit-scrollbar-track {
  background: #333;
  border-radius: 4px;
}

.ilovepdf-panel pre::-webkit-scrollbar-thumb {
  background: #e53935;
  border-radius: 4px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .pdf-workspace {
    padding: 16px;
  }
  
  .panels-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .craftmypdf-panel,
  .ilovepdf-panel {
    padding: 20px;
  }
  
  .ilovepdf-panel .tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  
  .ilovepdf-panel .tabs button {
    white-space: nowrap;
    font-size: 12px;
    padding: 8px 12px;
  }
}