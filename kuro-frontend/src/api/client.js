// frontend/src/api/client.js
//
// Central API helper for talking to the FastAPI backend.
// Uses Clerk's useAuth() to attach the current user's session token
// as a Bearer token in the Authorization header.

import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

// 👇 Uses your HuggingFace URL from .env in production,
//    and localhost:8000 when running locally if env is missing
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// This hook returns functions that already handle auth and baseURL.
export function useApiClient() {
  const { getToken } = useAuth();

  // Create an axios instance with Authorization header for each call
  async function authAxios() {
    const token = await getToken(); // Clerk session token (JWT)
    return axios.create({
      baseURL: BASE_URL,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  // ------------- PDF MANAGEMENT -------------

  async function uploadPdf(files, sessionId) { // 🔥 ADDED: sessionId parameter
    const api = await authAxios();
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("session_id", sessionId); // 🔥 ADDED: session_id

    const res = await api.post("/api/pdf/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // { status, pdfs: [{pdf_id, filename}, ...] }
  }

  // ------------- CHAT -------------

  async function chatWithPdf(pdfId, query, mode = "detailed", sessionId) { // 🔥 ADDED: sessionId
    const api = await authAxios();
    const formData = new FormData();
    formData.append("pdf_id", pdfId);
    formData.append("query", query);
    formData.append("mode", mode);
    formData.append("session_id", sessionId); // 🔥 ADDED

    const res = await api.post("/api/pdf/chat", formData);
    return res.data; // { answer, sources }
  }

  // Ask across multiple PDFs (optional, if you wired /api/pdf/chat-multi)
  async function chatWithMultiplePdfs(pdfIds, query, mode = "detailed") {
    const api = await authAxios();
    const body = {
      pdf_ids: pdfIds,
      query,
      mode,
    };
    const res = await api.post("/api/pdf/chat-multi", body);
    return res.data; // { answer, sources }
  }

  // ------------- ANALYSIS (SUMMARY, MCQ, FLASHCARDS, etc.) -------------

  // 🔥 FIXED: Added sessionId parameter and send it to backend
  async function analysePdf(pdfId, task, mode = "detailed", sessionId) {
    const api = await authAxios();
    const formData = new FormData();
    formData.append("pdf_id", pdfId);
    formData.append("task", task); // "summary", "flashcards", "mcq", etc.
    formData.append("mode_raw", mode); // 🔥 FIXED: backend expects mode_raw, not mode
    formData.append("session_id", sessionId); // 🔥 CRITICAL: backend requires this!

    try {
      const res = await api.post("/api/pdf/analyse", formData);
      return res.data; // { result }
    } catch (err) {
      // try to extract server-provided error message
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message;
      throw new Error(serverMsg || "Analysis failed");
    }
  }

  // ------------- EDIT PDF -------------

  // 🔥 FIXED: Added sessionId parameter
  async function editPdfAddText({
    pdf_id,
    page_number,
    text,
    x = 50,
    y = 50,
    font_size = 12,
    sessionId, // 🔥 ADDED
  }) {
    const api = await authAxios();
    const formData = new FormData();
    formData.append("pdf_id", pdf_id);
    formData.append("page_number", page_number);
    formData.append("text", text);
    formData.append("x", x);
    formData.append("y", y);
    formData.append("font_size", font_size);
    formData.append("session_id", sessionId); // 🔥 ADDED

    const res = await api.post("/api/pdf/edit/add-text", formData);
    return res.data; // { status, edited_pdf }
  }

  // 🔥 FIXED: Added sessionId parameter
  async function editPdfAddImage({
    pdf_id,
    page_number,
    x = 50,
    y = 50,
    width,
    height,
    image, // File object
    sessionId, // 🔥 ADDED
  }) {
    const api = await authAxios();
    const formData = new FormData();
    formData.append("pdf_id", pdf_id);
    formData.append("page_number", page_number);
    formData.append("x", x);
    formData.append("y", y);
    if (width !== undefined && width !== null) {
      formData.append("width", width);
    }
    if (height !== undefined && height !== null) {
      formData.append("height", height);
    }
    formData.append("image", image);
    formData.append("session_id", sessionId); // 🔥 ADDED

    const res = await api.post("/api/pdf/edit/add-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // { status, edited_pdf }
  }

  // ------------- CREATE CUSTOM PDF -------------
  // (No sessionId needed for this one as it creates new PDFs, not editing existing)

  async function createCustomPdf({ title, body_text, images = [] }) {
    const api = await authAxios();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body_text", body_text);
    images.forEach((img) => {
      formData.append("images", img);
    });

    const res = await api.post("/api/pdf/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // { status, pdf }
  }

  // Helper to get a download URL for any generated file
  function getDownloadUrl(filename) {
    if (!filename) return "";
    return `${BASE_URL}/api/pdf/download/${encodeURIComponent(filename)}`;
  }

  return {
    uploadPdf,
    uploadPdfs: uploadPdf, // alias for older code
    chatWithPdf,
    chatWithMultiplePdfs,
    analysePdf,
    editPdfAddText,
    editPdfAddImage,
    createCustomPdf,
    getDownloadUrl,
  };
}