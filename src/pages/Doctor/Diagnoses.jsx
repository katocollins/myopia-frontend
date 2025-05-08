// src/pages/Doctor/Diagnoses.jsx
import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Plus,
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDiagnosisStore } from "../../stores/diagnosisStore";
import { usePatientStore } from "../../stores/patientStore";
import { useImageStore } from "../../stores/imageStore";
import { useUiStore } from "../../stores/uiStore";

// Zod schema for diagnosis creation
const diagnosisSchema = z.object({
  retinalImageId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Please select a retinal image"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

// Format date
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "-";

// Generate pagination range (from Images.jsx)
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

const Diagnoses = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteDiagnosisId, setDeleteDiagnosisId] = useState(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [patientId, setPatientId] = useState("");
  const [severity, setSeverity] = useState("");

  const {
    diagnoses,
    diagnosisCount,
    totalDiagnoses,
    currentPage,
    totalPages,
    getDiagnoses,
    getDiagnosisCount,
    createDiagnosis,
    getDiagnosis,
    deleteDiagnosis,
    setSelectedDiagnosis,
    selectedDiagnosis,
  } = useDiagnosisStore();
  const { patients, getPatients } = usePatientStore();
  const { images, getImages } = useImageStore();
  const { showToast, isLoading } = useUiStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      retinalImageId: "",
      notes: "",
    },
  });

  // Fetch initial data
  useEffect(() => {
    getDiagnosisCount();
    getDiagnoses(currentPage, limit, search, patientId, severity);
    getPatients(1, 100); // For dropdown
    getImages(1, 100); // For retinal images
  }, [getDiagnosisCount, getDiagnoses, getPatients, getImages, currentPage, limit, search, patientId, severity]);

  // Handle search input
  const handleSearch = (e) => {
    setSearch(e.target.value);
    getDiagnoses(1, limit, e.target.value, patientId, severity);
  };

  // Handle entries per page
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
    getDiagnoses(1, e.target.value, search, patientId, severity);
  };

  // Handle patient filter
  const handlePatientChange = (e) => {
    setPatientId(e.target.value);
    getDiagnoses(1, limit, search, e.target.value, severity);
  };

  // Handle severity filter
  const handleSeverityChange = (e) => {
    setSeverity(e.target.value);
    getDiagnoses(1, limit, search, patientId, e.target.value);
  };

  // Handle create submission
  const onCreateSubmit = async (data) => {
    try {
      await createDiagnosis(data);
      setIsCreateModalOpen(false);
      reset();
      getDiagnoses(currentPage, limit, search, patientId, severity);
    } catch (error) {
      // Error handled by diagnosisStore
    }
  };

  // Handle view diagnosis
  const handleView = async (id) => {
    try {
      await getDiagnosis(id);
      setIsViewModalOpen(true);
    } catch (error) {
      // Error handled by diagnosisStore
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteDiagnosis(deleteDiagnosisId);
      setIsDeleteModalOpen(false);
      getDiagnoses(currentPage, limit, search, patientId, severity);
    } catch (error) {
      // Error handled by diagnosisStore
    }
  };

  // Filter images without diagnoses
  const availableImages = images.filter(
    (image) => !diagnoses.some((d) => d.retinalImageId.toString() === image._id.toString())
  );

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header and Stats Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Diagnosis Management</h1>
          <p className="text-gray-500 mt-1">Manage retinal image diagnoses</p>
        </div>
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-indigo-500 bg-opacity-10 text-indigo-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Diagnoses</p>
              <h3 className="text-xl font-bold text-gray-800">{diagnosisCount}</h3>
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
            <select
              value={severity}
              onChange={handleSeverityChange}
              className="px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full sm:w-48"
              disabled={isLoading}
            >
              <option value="">All Severities</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="severe">Severe</option>
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
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center"
          disabled={isLoading}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Diagnosis</span>
        </button>
      </div>

      {/* Diagnoses Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Thumbnail</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Patient</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Severity</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Diagnosed At</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Notes</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Detections</th>
                <th className="py-3.5 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {diagnoses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Stethoscope className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No diagnoses found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your filters or adding a new diagnosis</p>
                    </div>
                  </td>
                </tr>
              ) : (
                diagnoses.map((diagnosis) => (
                  <tr key={diagnosis._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-4">
                      <img
                        src={`http://localhost:5000/${diagnosis.retinalImageId.originalImagePath.split("/").pop()}?t=${Date.now()}`}
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
                          <p className="font-medium text-gray-900">{diagnosis.retinalImageId.patientId.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <AlertCircle size={14} className="text-gray-400 mr-1.5" />
                        <span className="text-gray-700 capitalize">{diagnosis.severityLevel}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="text-gray-400 mr-1.5" />
                        <span className="text-gray-700">{formatDate(diagnosis.diagnosedAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">
                        {diagnosis.notes
                          ? diagnosis.notes.length > 25
                            ? `${diagnosis.notes.substring(0, 25)}...`
                            : diagnosis.notes
                          : "-"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{diagnosis.yoloDetections.length} detections</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(diagnosis._id)}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 focus:outline-none transition-all duration-200"
                          disabled={isLoading}
                          title="View Diagnosis"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteDiagnosisId(diagnosis._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none transition-all duration-200"
                          disabled={isLoading}
                          title="Delete Diagnosis"
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
              <span className="font-medium text-gray-700">{Math.min(currentPage * limit, totalDiagnoses)}</span> of{" "}
              <span className="font-medium text-gray-700">{totalDiagnoses}</span> diagnoses
            </div>
            <div className="flex mt-3 sm:mt-0 items-center space-x-1">
              <button
                onClick={() => getDiagnoses(currentPage - 1, limit, search, patientId, severity)}
                disabled={currentPage === 1 || isLoading}
                className="px-2 py-2 rounded-md bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationRange(currentPage, totalPages).map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === "number" && getDiagnoses(page, limit, search, patientId, severity)}
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
                onClick={() => getDiagnoses(currentPage + 1, limit, search, patientId, severity)}
                disabled={currentPage === totalPages || isLoading}
                className="px-2 py-2 rounded-md bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Create New Diagnosis</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retinal Image <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("retinalImageId")}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.retinalImageId ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  disabled={isLoading}
                >
                  <option value="">Select an image</option>
                  {availableImages.map((image) => (
                    <option key={image._id} value={image._id}>
                      {image.patientId.name} - {formatDate(image.uploadedAt)}
                    </option>
                  ))}
                </select>
                {errors.retinalImageId && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.retinalImageId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  {...register("notes")}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.notes ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  placeholder="E.g., Observed hemorrhages"
                  rows={4}
                  disabled={isLoading}
                />
                {errors.notes && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                      Creating...
                    </span>
                  ) : (
                    "Create Diagnosis"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedDiagnosis && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl animate-fade-in shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Diagnosis Details</h2>
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
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Original Image</p>
                  <img
                    src={`http://localhost:5000/${selectedDiagnosis.retinalImageId.originalImagePath.split("/").pop()}?t=${Date.now()}`}
                    alt="Original retinal image"
                    className="w-full h-auto max-h-[40vh] object-contain rounded-lg border border-gray-200"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">YOLO Output Image</p>
                  {selectedDiagnosis.retinalImageId.yoloOutputPath ? (
                   <img
                   src={`https://collinz56-myopia-yolo.hf.space/static/${selectedDiagnosis.retinalImageId.yoloOutputPath.split("/").pop()}?t=${Date.now()}`}
                   alt="YOLO output image"
                   className="w-full h-auto max-h-[40vh] object-contain rounded-lg border border-gray-200"
                   onError={(e) => {
                     console.error("Failed to load YOLO output image:", {
                       yoloOutputPath: selectedDiagnosis.retinalImageId.yoloOutputPath,
                       attemptedUrl: e.target.src,
                     });
                     e.target.src = "/placeholder.png";
                     e.target.onerror = null; // Prevent retry loop
                   }}
                   onLoad={() => console.log("YOLO output image loaded successfully:", selectedDiagnosis.retinalImageId.yoloOutputPath)}
                 />
                  ) : (
                    <p className="text-gray-400 italic">No YOLO output available</p>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p className="text-gray-800 font-medium">{selectedDiagnosis.retinalImageId.patientId.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Severity Level</p>
                  <p className="text-gray-800 capitalize">{selectedDiagnosis.severityLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Diagnosed At</p>
                  <p className="text-gray-800">{formatDate(selectedDiagnosis.diagnosedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-gray-800">{selectedDiagnosis.notes || "No notes provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">YOLO Detections</p>
                  {selectedDiagnosis.yoloDetections.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="py-2 px-3 text-gray-600 font-semibold">Label</th>
                            <th className="py-2 px-3 text-gray-600 font-semibold">Confidence</th>
                            <th className="py-2 px-3 text-gray-600 font-semibold">Bounding Box</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDiagnosis.yoloDetections.map((detection, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2 px-3 text-gray-700">{detection.label}</td>
                              <td className="py-2 px-3 text-gray-700">{(detection.confidence * 100).toFixed(2)}%</td>
                              <td className="py-2 px-3 text-gray-700">
                                x: {detection.boundingBox.x}, y: {detection.boundingBox.y}, w: {detection.boundingBox.width}, h: {detection.boundingBox.height}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No detections available</p>
                  )}
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
              Are you sure you want to delete this diagnosis? This action cannot be undone.
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

export default Diagnoses;