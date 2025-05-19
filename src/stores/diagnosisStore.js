// src/stores/diagnosisStore.js
import { create } from "zustand";
import {
  getDiagnosisCount,
  getDiagnoses,
  createDiagnosis,
  getDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
  getDiagnosesByPatient,
  fetchDiagnosesByPatient,
  getPatientsBySeverity,
  getDiagnosesBySeverity,
  getRecentDiagnoses,
  generateRecommendation,
} from "../api/diagnoses";
import { useUiStore } from "./uiStore";

export const useDiagnosisStore = create((set) => ({
  diagnoses: [],
  diagnosisCount: 0,
  totalDiagnoses: 0,
  currentPage: 1,
  totalPages: 1,
  selectedDiagnosis: null,
  patientsBySeverity: { normal: 0, low: 0, medium: 0, high: 0, severe: 0 },
  diagnosesBySeverity: { normal: 0, low: 0, medium: 0, high: 0, severe: 0 },
  recentDiagnoses: [],
  recommendations: [], // New state for recommendations

  getDiagnosisCount: async () => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getDiagnosisCount();
      set({ diagnosisCount: data.count });
    } catch (error) {
      showToast("Failed to fetch diagnosis count", "error");
    } finally {
      setLoading(false);
    }
  },

  getDiagnoses: async (page = 1, limit = 10, search = "", patientId = "", severity = "") => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getDiagnoses(page, limit, search, patientId, severity);
      set({
        diagnoses: data.data,
        totalDiagnoses: data.total,
        currentPage: data.page,
        totalPages: data.pages,
      });
    } catch (error) {
      showToast("Failed to fetch diagnoses", "error");
    } finally {
      setLoading(false);
    }
  },

  createDiagnosis: async (diagnosisData) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await createDiagnosis(diagnosisData);
      set((state) => ({
        diagnoses: [...state.diagnoses, data.data],
        diagnosisCount: state.diagnosisCount + 1,
      }));
      showToast("Diagnosis created successfully", "success");
      return data.data;
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to create diagnosis", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },

  getDiagnosis: async (id) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getDiagnosis(id);
      set({ selectedDiagnosis: data.data });
      return data.data;
    } catch (error) {
      showToast("Failed to fetch diagnosis", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },

  updateDiagnosis: async (id, diagnosisData) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await updateDiagnosis(id, diagnosisData);
      set((state) => ({
        diagnoses: state.diagnoses.map((d) => (d._id === id ? data.data : d)),
        selectedDiagnosis: data.data,
      }));
      showToast("Diagnosis updated successfully", "success");
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to update diagnosis", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },

  deleteDiagnosis: async (id) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      await deleteDiagnosis(id);
      set((state) => ({
        diagnoses: state.diagnoses.filter((d) => d._id !== id),
        diagnosisCount: state.diagnosisCount - 1,
        selectedDiagnosis: null,
      }));
      showToast("Diagnosis deleted successfully", "success");
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to delete diagnosis", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },

  getDiagnosesByPatient: async (patientId) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getDiagnosesByPatient(patientId);
      set({ diagnoses: data.data });
    } catch (error) {
      showToast("Failed to fetch diagnoses", "error");
    } finally {
      setLoading(false);
    }
  },

  fetchDiagnosesByPatient: async (patientId) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await fetchDiagnosesByPatient(patientId);
      set({ diagnoses: data.data });
      showToast("Diagnoses fetched successfully", "success");
    } catch (error) {
      showToast("Failed to fetch diagnoses", "error");
    } finally {
      setLoading(false);
    }
  },

  getPatientsBySeverity: async () => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getPatientsBySeverity();
      set({ patientsBySeverity: data });
    } catch (error) {
      showToast("Failed to fetch patients by severity", "error");
    } finally {
      setLoading(false);
    }
  },

  getDiagnosesBySeverity: async () => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getDiagnosesBySeverity();
      set({ diagnosesBySeverity: data });
    } catch (error) {
      showToast("Failed to fetch diagnoses by severity", "error");
    } finally {
      setLoading(false);
    }
  },

  getRecentDiagnoses: async (limit = 5) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getRecentDiagnoses(limit);
      set({ recentDiagnoses: data });
    } catch (error) {
      showToast("Failed to fetch recent diagnoses", "error");
    } finally {
      setLoading(false);
    }
  },

  generateRecommendation: async (diagnosisId) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await generateRecommendation(diagnosisId);
      set((state) => ({
        recommendations: [...state.recommendations, data.recommendation],
      }));
      showToast("Recommendation generated successfully", "success");
      return data.recommendation;
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to generate recommendation", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },

  setSelectedDiagnosis: (diagnosis) => set({ selectedDiagnosis: diagnosis }),
}));