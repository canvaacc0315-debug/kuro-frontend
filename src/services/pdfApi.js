  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://your-huggingface-space.hf.space';

  export const pdfApi = {
    // CraftMyPDF: Get templates
    async getTemplates() {
      const response = await fetch(`${API_BASE}/api/pdf/craftmypdf/templates`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },

    // CraftMyPDF: Generate PDF from template
    async generateFromTemplate(templateId, data, outputName = 'document.pdf') {
      const response = await fetch(`${API_BASE}/api/pdf/craftmypdf/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ template_id: templateId, data, output_name: outputName })
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      return response.json();
    },

    // iLovePDF: Merge PDFs
    async mergePDFs(files) {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch(`${API_BASE}/api/pdf/ilovepdf/merge`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to merge PDFs');
      return response.blob();
    },

    // iLovePDF: Split PDF
    async splitPDF(file, ranges) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ranges', ranges);

      const response = await fetch(`${API_BASE}/api/pdf/ilovepdf/split`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to split PDF');
      return response.blob();
    },

    // iLovePDF: Convert to PDF
    async convertToPDF(file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/pdf/ilovepdf/convert`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to convert file');
      return response.blob();
    },

    // iLovePDF: Extract text
    async extractText(file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/pdf/ilovepdf/extract-text`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to extract text');
      return response.json();
    },

    // iLovePDF: Add page numbers
    async addPageNumbers(file, options = {}) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      const response = await fetch(`${API_BASE}/api/pdf/ilovepdf/page-numbers`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to add page numbers');
      return response.blob();
    },

    // Helper: Download blob as file
    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };