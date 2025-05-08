// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { useUiStore } = await import("../stores/uiStore");
    const { showToast } = useUiStore.getState();
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        const { useAuthStore } = await import("../stores/authStore");
        useAuthStore.getState().logout();
        showToast("Session expired. Please log in again.", "error");
        window.location.href = "/login";
      } else if (status === 400 && data.errors) {
        showToast(data.errors.map((err) => err.msg).join(", "), "error");
      } else {
        showToast(data.error || "An error occurred.", "error");
      }
    } else {
      showToast("Network error. Please try again.", "error");
    }
    return Promise.reject(error);
  }
);

export default api;