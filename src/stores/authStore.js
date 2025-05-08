// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
  registerDoctor,
} from "../api/auth";
import { useUiStore } from "./uiStore";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (credentials) => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          const { data } = await login(credentials);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          showToast("Login successful", "success");
        } catch (error) {
          throw error; // Handled by axios interceptor
        } finally {
          setLoading(false);
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        useUiStore.getState().showToast("Logged out", "success");
      },
      fetchProfile: async () => {
        const { setLoading } = useUiStore.getState();
        setLoading(true);
        try {
          const { data } = await getProfile();
          set({ user: data.data, isAuthenticated: true });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          setLoading(false);
        }
      },
      requestPasswordReset: async (email) => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          await requestPasswordReset(email);
          showToast("Password reset link sent", "success");
        } finally {
          setLoading(false);
        }
      },
      resetPassword: async (data) => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          await resetPassword(data);
          showToast("Password reset successful", "success");
        } finally {
          setLoading(false);
        }
      },
      registerDoctor: async (data) => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          await registerDoctor(data);
          showToast("Doctor registered successfully", "success");
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: "auth-storage", // Persist in localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
