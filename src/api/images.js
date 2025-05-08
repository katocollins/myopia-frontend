// src/api/images.js
import api from "./axios";

export const getImageCount = () => api.get("/retinal-images/count");
export const uploadImage = (formData) => api.post("/retinal-images", formData);
export const getImages = (page = 1, limit = 10, search = "", patientId = "") =>
  api.get(`/retinal-images?page=${page}&limit=${limit}&search=${search}${patientId ? `&patientId=${patientId}` : ""}`);
export const getImage = (id) => api.get(`/retinal-images/${id}`);
export const deleteImage = (id) => api.delete(`/retinal-images/${id}`);
export const fetchImagesByPatient = (patientId) => api.get(`/retinal-images/patient/${patientId}`);