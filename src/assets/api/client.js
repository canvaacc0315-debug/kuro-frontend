import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export async function uploadPdf(files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const res = await api.post("/api/pdf/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function chatWithPdf(pdfId, query) {
  const formData = new FormData();
  formData.append("pdf_id", pdfId);
  formData.append("query", query);

  const res = await api.post("/api/pdf/chat", formData);
  return res.data;
}

export async function editPdfAddText(data) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const res = await api.post("/api/pdf/edit/add-text", formData);
  return res.data;
}

export async function editPdfAddImage(data) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const res = await api.post("/api/pdf/edit/add-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function createCustomPdf(data) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("body_text", data.body_text);
  (data.images || []).forEach((img) => {
    formData.append("images", img);
  });

  const res = await api.post("/api/pdf/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
