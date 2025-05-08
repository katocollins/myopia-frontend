// src/stores/patientStore.js
import { create } from "zustand";
import {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getPatientCount,
  getActivePatientCount,
  getPatientsByGender,
} from "../api/patients";
import { useUiStore } from "./uiStore";

export const usePatientStore = create((set) => ({
  patients: [],
  patientCount: 0,
  activePatientCount: 0,
  patientsByGender: { male: 0, female: 0, other: 0 },
  totalPatients: 0,
  currentPage: 1,
  totalPages: 1,
  selectedPatient: null,
  createPatient: async (patientData) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await createPatient(patientData);
      set((state) => ({
        patients: [...state.patients, data.data],
        patientCount: state.patientCount + 1,
      }));
      showToast("Patient created successfully", "success");
      return data.data;
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to create patient",
        "error"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  },
  getPatients: async (page = 1, limit = 10, search = "") => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getPatients(page, limit, search);
      set({
        patients: data.data,
        totalPatients: data.total,
        currentPage: data.page,
        totalPages: data.pages,
      });
    } catch (error) {
      showToast("Failed to fetch patients", "error");
    } finally {
      setLoading(false);
    }
  },
  getPatient: async (id) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getPatient(id);
      set({ selectedPatient: data.data });
      return data.data;
    } catch (error) {
      showToast("Failed to fetch patient", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },
  updatePatient: async (id, patientData) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await updatePatient(id, patientData);
      set((state) => ({
        patients: state.patients.map((p) => (p._id === id ? data.data : p)),
        selectedPatient: data.data,
      }));
      showToast("Patient updated successfully", "success");
      return data.data;
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to update patient",
        "error"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  },
  deletePatient: async (id) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      await deletePatient(id);
      set((state) => ({
        patients: state.patients.filter((p) => p._id !== id),
        patientCount: state.patientCount - 1,
        selectedPatient: null,
      }));
      showToast("Patient deleted successfully", "success");
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to delete patient",
        "error"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  },
  getPatientCount: async () => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getPatientCount();
      set({ patientCount: data.count });
    } catch (error) {
      showToast("Failed to fetch patient count", "error");
    } finally {
      setLoading(false);
    }
  },
  getActivePatientCount: async () => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getActivePatientCount();
      set({ activePatientCount: data.count });
    } catch (error) {
      showToast("Failed to fetch active patient count", "error");
    } finally {
      setLoading(false);
    }
  },
  getPatientsByGender: async () => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getPatientsByGender();
      set({ patientsByGender: data });
    } catch (error) {
      showToast("Failed to fetch patients by gender", "error");
    } finally {
      setLoading(false);
    }
  },
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}));
