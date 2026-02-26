// src/services/studyApi.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const studyApi = {
    async generateFlashcards(pdfId, count = 10) {
        const response = await fetch(`${API_BASE}/api/study/flashcards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ pdf_id: pdfId, count })
        });
        if (!response.ok) throw new Error('Failed to generate flashcards');
        return response.json();
    },

    async generateQuiz(pdfId, count = 5) {
        const response = await fetch(`${API_BASE}/api/study/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ pdf_id: pdfId, count })
        });
        if (!response.ok) throw new Error('Failed to generate quiz');
        return response.json();
    }
};
