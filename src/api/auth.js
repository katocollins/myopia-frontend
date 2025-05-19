// src/api/auth.js
import api from "./axios";

export const login = (credentials) => api.post("/auth/login", credentials);
export const requestPasswordReset = (email) =>
  api.post("/auth/password-reset/request", { email });
export const resetPassword = (data) => api.post("/auth/password-reset", data);
export const registerDoctor = (data) => api.post("/auth/register", data);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const deleteProfile = () => api.delete("/auth/profile");
export const getUsers = (page = 1, limit = 10, search = "") =>
  api.get("/auth/users", { params: { page, limit, search } });
export const getUserCount = () => api.get("/auth/users/count");