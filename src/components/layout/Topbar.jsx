// src/components/layout/Topbar.jsx
import React from "react";
import { Menu, ChevronDown, ChevronUp, User, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useUiStore } from "../../stores/uiStore";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const { user, logout } = useAuthStore();
  const { isDropdownOpen, setDropdownOpen, toggleSidebar, isSidebarCollapsed } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Define dropdown items based on user role
  const dropdownItems = user?.role === "admin" ? [
    { label: "Profile", icon: User, action: () => navigate("/admin/profile") },
    { label: "Logout", icon: LogOut, action: handleLogout },
  ] : [
    { label: "Profile", icon: User, action: () => navigate("/doctor/profile") },
    { label: "Logout", icon: LogOut, action: handleLogout },
  ];

  return (
    <header
      className={`fixed top-0 right-0 z-40 h-16 bg-white shadow-md flex items-center justify-between p-4 transition-all duration-300 ${
        isSidebarCollapsed ? "left-16" : "left-64"
      }`}
    >
      {/* Mobile Menu Button */}
      <button
        className="md:hidden focus:outline-none"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <Menu className="w-6 h-6 text-gray-800" />
      </button>

      {/* Spacer for Desktop */}
      <div className="flex-1"></div>

      {/* User Dropdown */}
      <div className="relative">
        <button
          className="flex items-center space-x-2 text-gray-800 focus:outline-none"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
          aria-label="User Menu"
        >
          <span className="text-sm font-medium">
            {user?.role === "admin" ? `Admin ${user?.name || "User"}` : `Dr. ${user?.name || "User"}`}
          </span>
          {isDropdownOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-slide-down z-50">
            {dropdownItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                <item.icon className="w-5 h-5 mr-2" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;