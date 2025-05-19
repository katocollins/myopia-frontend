// src/api/diagnoses.js
import api from "./axios";

export const createDiagnosis = (data) => api.post("/diagnoses", data);
export const fetchDiagnosesByPatient = (patientId) =>
  api.get(`/diagnoses/patient/${patientId}`);
export const getDiagnosis = (id) => api.get(`/diagnoses/${id}`);
export const updateDiagnosis = (id, data) => api.put(`/diagnoses/${id}`, data);
export const deleteDiagnosis = (id) => api.delete(`/diagnoses/${id}`);
export const getDiagnosisCount = () => api.get("/diagnoses/count");
export const getPatientsBySeverity = () => api.get("/diagnoses/patients-by-severity");
export const getDiagnosesBySeverity = () => api.get("/diagnoses/by-severity");
export const getRecentDiagnoses = (limit) =>
  api.get("/diagnoses/recent", { params: { limit } });
export const getDiagnoses = (page = 1, limit = 10, search = "", patientId = "", severity = "") =>
  api.get(
    `/diagnoses?page=${page}&limit=${limit}&search=${search}${
      patientId ? `&patientId=${patientId}` : ""
    }${severity ? `&severity=${severity}` : ""}`
  );
export const getDiagnosesByPatient = (patientId) => api.get(`/diagnoses/patient/${patientId}`);
export const generateRecommendation = (diagnosisId) =>
  api.post("/recommendations", { diagnosisId });