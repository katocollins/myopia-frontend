// src/stores/imageStore.js
import { create } from "zustand";
import {
  getImageCount,
  uploadImage,
  getImages,
  getImage,
  deleteImage,
  fetchImagesByPatient,
} from "../api/images";
import { useUiStore } from "./uiStore";

export const useImageStore = create((set) => ({
  images: [],
  imageCount: 0,
  totalImages: 0,
  currentPage: 1,
  totalPages: 1,
  selectedImage: null,
  getImageCount: async () => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getImageCount();
      set({ imageCount: data.count });
    } catch (error) {
      showToast("Failed to fetch image count", "error");
    } finally {
      setLoading(false);
    }
  },
  getImages: async (page = 1, limit = 10, search = "", patientId = "") => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getImages(page, limit, search, patientId);
      set({
        images: data.data,
        totalImages: data.total,
        currentPage: data.page,
        totalPages: data.pages,
      });
    } catch (error) {
      showToast("Failed to fetch images", "error");
    } finally {
      setLoading(false);
    }
  },
  uploadImage: async (formData) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await uploadImage(formData);
      set((state) => ({
        images: [...state.images, data.data],
        imageCount: state.imageCount + 1,
      }));
      showToast("Image uploaded successfully", "success");
      return data.data;
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to upload image", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },
  getImage: async (id) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await getImage(id);
      set({ selectedImage: data.data });
      return data.data;
    } catch (error) {
      showToast("Failed to fetch image", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },
  deleteImage: async (id) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      await deleteImage(id);
      set((state) => ({
        images: state.images.filter((img) => img._id !== id),
        imageCount: state.imageCount - 1,
        selectedImage: null,
      }));
      showToast("Image deleted successfully", "success");
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to delete image", "error");
      throw error;
    } finally {
      setLoading(false);
    }
  },
  fetchImagesByPatient: async (patientId) => {
    const { setLoading, showToast } = useUiStore.getState();
    setLoading(true);
    try {
      const { data } = await fetchImagesByPatient(patientId);
      set({ images: data.data });
    } catch (error) {
      showToast("Failed to fetch images", "error");
    } finally {
      setLoading(false);
    }
  },
  setSelectedImage: (image) => set({ selectedImage: image }),
}));