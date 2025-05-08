// src/stores/uiStore.js
import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isLoading: false,
  toast: { message: '', type: '' },
  isSidebarCollapsed: false,
  isDropdownOpen: false,
  setLoading: (loading) => set({ isLoading: loading }),
  showToast: (message, type) => set({ toast: { message, type } }),
  clearToast: () => set({ toast: { message: '', type: '' } }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setDropdownOpen: (open) => set({ isDropdownOpen: open }),
}));