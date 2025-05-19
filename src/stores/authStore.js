// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
  registerDoctor,
  getUsers,
  getUserCount,
  updateProfile,
  deleteProfile,
} from "../api/auth";
import { useUiStore } from "./uiStore";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      users: [],
      userCount: 0,
      totalUsers: 0,
      currentPage: 1,
      totalPages: 0,
      selectedUser: null,

      // Login
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

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          users: [],
          userCount: 0,
          totalUsers: 0,
          currentPage: 1,
          totalPages: 0,
          selectedUser: null,
        });
        useUiStore.getState().showToast("Logged out", "success");
      },

      // Fetch user profile
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

      // Request password reset
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

      // Reset password
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

      // Register doctor
      registerDoctor: async (data) => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          await registerDoctor({ ...data, role: "doctor" });
          showToast("Doctor registered successfully", "success");
        } finally {
          setLoading(false);
        }
      },

      // Fetch users (paginated, with search)
      getUsers: async (page = 1, limit = 10, search = "") => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          const { data } = await getUsers(page, limit, search);
          set({
            users: data.users,
            totalUsers: data.totalUsers,
            currentPage: page,
            totalPages: data.totalPages,
          });
        } catch (error) {
          showToast(error.response?.data?.error || "Failed to fetch users", "error");
        } finally {
          setLoading(false);
        }
      },

      // Fetch total user count
      getUserCount: async () => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          const { data } = await getUserCount();
          set({ userCount: data.count });
        } catch (error) {
          showToast("Failed to fetch user count", "error");
        } finally {
          setLoading(false);
        }
      },

      // Update user
      updateUser: async (userId, data) => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          await updateProfile({ ...data, id: userId });
          showToast("Doctor updated successfully", "success");
        } catch (error) {
          showToast(error.response?.data?.error || "Failed to update doctor", "error");
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // Delete user
      deleteUser: async (userId) => {
        const { setLoading, showToast } = useUiStore.getState();
        setLoading(true);
        try {
          await deleteProfile({ id: userId });
          showToast("Doctor deleted successfully", "success");
        } catch (error) {
          showToast(error.response?.data?.error || "Failed to delete doctor", "error");
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // Set selected user for editing
      setSelectedUser: (user) => set({ selectedUser: user }),
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