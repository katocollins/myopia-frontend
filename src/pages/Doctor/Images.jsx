// src/pages/Doctor/Images.jsx
import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useImageStore } from "../../stores/imageStore";
import { usePatientStore } from "../../stores/patientStore";
import { useUiStore } from "../../stores/uiStore";

// Zod schema for image upload form
const imageSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  image: z
    .any()
    .refine((files) => files?.length === 1, "Please select an image")
    .refine(
      (files) => ["image/jpeg", "image/png"].includes(files?.[0]?.type),
      "Only JPEG or PNG files are allowed"
    )
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, "File size must be less than 5MB"),
});

// Format date
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "-";

// Generate pagination range (from Patients.jsx)
const getPaginationRange = (currentPage, totalPages) => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  range.push(1);

  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
    range.push(i);
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  let l;
  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

const Images = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [patientId, setPatientId] = useState("");

  const {
    images,
    imageCount,
    totalImages,
    currentPage,
    totalPages,
    getImages,
    getImageCount,
    uploadImage,
    getImage,
    deleteImage,
    setSelectedImage,
    selectedImage,
  } = useImageStore();
  const { patients, getPatients } = usePatientStore();
  const { showToast, isLoading } = useUiStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      patientId: "",
      image: null,
    },
  });

  // Fetch initial data
  useEffect(() => {
    getImageCount();
    getImages(currentPage, limit, search, patientId);
    getPatients(1, 100); // Fetch patients for dropdown
  }, [getImageCount, getImages, getPatients, currentPage, limit, search, patientId]);

  // Handle search input
  const handleSearch = (e) => {
    setSearch(e.target.value);
    getImages(1, limit, e.target.value, patientId); // Reset to page 1
  };

  // Handle entries per page
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
    getImages(1, e.target.value, search, patientId); // Reset to page 1
  };

  // Handle patient filter
  const handlePatientChange = (e) => {
    setPatientId(e.target.value);
    getImages(1, limit, search, e.target.value); // Reset to page 1
  };

  // Handle file input
  const handleFileChange = (e) => {
    setValue("image", e.target.files);
  };

  // Handle upload submission
  const onUploadSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("patientId", data.patientId);
      formData.append("image", data.image[0]);

      await uploadImage(formData);
      setIsUploadModalOpen(false);
      reset();
      getImages(currentPage, limit, search, patientId);
    } catch (error) {
      // Error handled by imageStore
    }
  };

  // Handle view image
  const handleView = async (id) => {
    try {
      await getImage(id);
      setIsViewModalOpen(true);
    } catch (error) {
      // Error handled by imageStore
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteImage(deleteImageId);
      setIsDeleteModalOpen(false);
      getImages(currentPage, limit, search, patientId);
    } catch (error) {
      // Error handled by imageStore
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header and Stats Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Image Management</h1>
          <p className="text-gray-500 mt-1">Manage retinal images for patients</p>
        </div>
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-indigo-500 bg-opacity-10 text-indigo-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Images</p>
              <h3 className="text-xl font-bold text-gray-800">{imageCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by patient name..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={patientId}
              onChange={handlePatientChange}
              className="px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full sm:w-48"
              disabled={isLoading}
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600">Show</label>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              disabled={isLoading}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center"
          disabled={isLoading}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Image</span>
        </button>
      </div>

      {/* Images Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Thumbnail</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Patient</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Upload Date</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Notes</th>
                <th className="py-3.5 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {images.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No images found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search or adding a new image</p>
                    </div>
                  </td>
                </tr>
              ) : (
                images.map((image) => (
                  <tr key={image._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-4">
                      <img
                        src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${image.originalImagePath}?t=${Date.now()}`}
                        alt="Retinal thumbnail"
                        className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        onError={(e) => (e.target.src = "/placeholder.png")}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <User size={16} />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{image.patientId.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="text-gray-400 mr-1.5" />
                        <span className="text-gray-700">{formatDate(image.uploadedAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">-</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(image._id)}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 focus:outline-none transition-all duration-200"
                          disabled={isLoading}
                          title="View Image"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteImageId(image._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none transition-all duration-200"
                          disabled={isLoading}
                          title="Delete Image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{(currentPage - 1) * limit + 1}</span> to{" "}
              <span className="font-medium text-gray-700">{Math.min(currentPage * limit, totalImages)}</span> of{" "}
              <span className="font-medium text-gray-700">{totalImages}</span> images
            </div>
            <div className="flex mt-3 sm:mt-0 items-center space-x-1">
              <button
                onClick={() => getImages(currentPage - 1, limit, search, patientId)}
                disabled={currentPage === 1 || isLoading}
                className="px-2 py-2 rounded-md bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationRange(currentPage, totalPages).map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === "number" && getImages(page, limit, search, patientId)}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    page === currentPage
                      ? "bg-indigo-600 text-white"
                      : page === "..."
                      ? "cursor-default bg-white text-gray-400"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  } transition-all duration-200`}
                  disabled={page === "..." || isLoading}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => getImages(currentPage + 1, limit, search, patientId)}
                disabled={currentPage === totalPages || isLoading}
                className="px-2 py-2 rounded-md bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Upload New Image</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit(onUploadSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("patientId")}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.patientId ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  disabled={isLoading}
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.patientId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.image ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  disabled={isLoading}
                />
                {errors.image && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.image.message}</p>
                )}
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 font-medium"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     {/* View Modal */}
{isViewModalOpen && selectedImage && (
  <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 w-full max-w-3xl animate-fade-in shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800">Image Details</h2>
        <button
          onClick={() => setIsViewModalOpen(false)}
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <img
            src={`http://localhost:5000/${selectedImage.originalImagePath.split("/").pop()}?t=${Date.now()}`}
            alt="Retinal image"
            className="w-full h-auto max-h-[60vh] object-contain rounded-lg border border-gray-200"
            onError={(e) => {
              console.error("Failed to load view image:", selectedImage.originalImagePath);
              e.target.src = "/placeholder.png";
            }}
          />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Patient</p>
            <p className="text-gray-800 font-medium">{selectedImage.patientId.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Upload Date</p>
            <p className="text-gray-800">{formatDate(selectedImage.uploadedAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="text-gray-800">No notes provided</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Diagnosis</p>
            <p className="text-gray-800 italic">No diagnosis available</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsViewModalOpen(false)}
          className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Images;