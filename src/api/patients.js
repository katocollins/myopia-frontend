// src/api/patients.js
import api from "./axios";

export const createPatient = (data) => api.post("/patients", data);
export const getPatients = (page = 1, limit = 10, search = "") =>
  api.get(`/patients?page=${page}&limit=${limit}&search=${search}`);
export const getPatient = (id) => api.get(`/patients/${id}`);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);
export const getPatientCount = () => api.get("/patients/count");
export const getActivePatientCount = () => api.get("/patients/active-count");
export const getPatientsByGender = () => api.get("/patients/by-gender");
