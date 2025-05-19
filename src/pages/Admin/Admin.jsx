// src/pages/Admin/Admin.jsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../stores/authStore";
import { useUiStore } from "../../stores/uiStore";

// Zod schema for user form
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.literal("doctor"), // Enforce doctor role
});

const Admin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);

  const {
    users,
    userCount,
    totalUsers,
    currentPage,
    totalPages,
    getUsers,
    getUserCount,
    registerDoctor,
    updateUser,
    deleteUser,
    setSelectedUser,
    selectedUser,
  } = useAuthStore();
  const { showToast, isLoading } = useUiStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "doctor",
    },
  });

  // Fetch initial data
  useEffect(() => {
    getUserCount();
    getUsers(currentPage, limit, search);
  }, [getUserCount, getUsers, currentPage, limit, search]);

  // Handle search input
  const handleSearch = (e) => {
    setSearch(e.target.value);
    getUsers(1, limit, e.target.value); // Reset to page 1
  };

  // Handle entries per page
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
    getUsers(1, e.target.value, search); // Reset to page 1
  };

  // Open create/edit modal
  const openModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === "edit" && user) {
      setSelectedUser(user);
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("password", ""); // Password not pre-filled for security
      setValue("role", "doctor");
    } else {
      setSelectedUser(null);
      reset();
    }
    setIsModalOpen(true);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      if (modalMode === "create") {
        await registerDoctor(data);
      } else {
        await updateUser(selectedUser._id, data);
      }
      setIsModalOpen(false);
      reset();
      getUsers(currentPage, limit, search);
    } catch (error) {
      // Error handled by userStore
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteUser(deleteUserId);
      setIsDeleteModalOpen(false);
      getUsers(currentPage, limit, search);
    } catch (error) {
      // Error handled by userStore
    }
  };

  // Generate pagination range
  const getPaginationRange = () => {
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

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header and Stats Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">Manage doctor accounts</p>
        </div>
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-indigo-500 bg-opacity-10 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Doctors</p>
              <h3 className="text-xl font-bold text-gray-800">{userCount}</h3>
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
              placeholder="Search by name..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600">Show</label>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
          onClick={() => openModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center"
          disabled={isLoading}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Doctor</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Name
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Email
                </th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Role
                </th>
                <th className="py-3.5 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No doctors found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search or adding a new doctor</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <User size={16} />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <Mail size={12} className="mr-1.5" />
                        <span className="truncate max-w-xs">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal("edit", user)}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 focus:outline-none transition-all duration-200"
                          disabled={isLoading}
                          title="Edit Doctor"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteUserId(user._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none transition-all duration-200"
                          disabled={isLoading}
                          title="Delete Doctor"
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
              <span className="font-medium text-gray-700">{Math.min(currentPage * limit, totalUsers)}</span> of{" "}
              <span className="font-medium text-gray-700">{totalUsers}</span> doctors
            </div>
            <div className="flex mt-3 sm:mt-0 items-center space-x-1">
              <button
                onClick={() => getUsers(currentPage - 1, limit, search)}
                disabled={currentPage === 1 || isLoading}
                className="px-2 py-2 rounded-md bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationRange().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === "number" && getUsers(page, limit, search)}
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
                onClick={() => getUsers(currentPage + 1, limit, search)}
                disabled={currentPage === totalPages || isLoading}
                className="px-2 py-2 rounded-md bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === "create" ? "Add New Doctor" : "Edit Doctor Details"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    {...register("name")}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter doctor name"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    {...register("email")}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="doctor@example.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {modalMode === "create" && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4m0 0c0 1.1.9 2 2 2s2-.9 2-2m-6-2h8M8 9V7a4 4 0 018 0v2"
                    />
                  </svg>
                  <input
                    type="password"
                    {...register("password")}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder={modalMode === "create" ? "Enter password" : "Leave blank to keep unchanged"}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      {modalMode === "create" ? "Adding..." : "Updating..."}
                    </span>
                  ) : modalMode === "create" ? (
                    "Add Doctor"
                  ) : (
                    "Update Doctor"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this doctor? This action cannot be undone.
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

export default Admin;