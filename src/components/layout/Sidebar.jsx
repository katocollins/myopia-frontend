// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Image,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useUiStore } from "../../stores/uiStore";
import Logo from "../../assets/logo.png";

const navItems = [
  { path: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/doctor/patients", label: "Patients", icon: Users },
  { path: "/doctor/images", label: "Images", icon: Image },
  { path: "/doctor/diagnoses", label: "Diagnoses", icon: Stethoscope },
  { path: "/doctor/articles", label: "Articles", icon: BookOpen },

];

const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <aside
      className={`
        h-screen bg-white shadow-lg fixed top-0 left-0 z-50 flex flex-col
        transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo and App Name */}
      <div className="flex items-center p-4 border-b">
        <img
          src={Logo}
          alt="Myopia Detection Logo"
          className={`w-8 h-8 ${isSidebarCollapsed ? "mx-auto" : ""}`}
        />
        {!isSidebarCollapsed && (
          <h1 className="ml-2 text-lg font-semibold text-blue-500">
            Myopia Detection
          </h1>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 transition-colors duration-200 ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
            aria-label={item.label}
          >
            <item.icon
              className={`h-5 w-5 ${isSidebarCollapsed ? "mx-auto" : "mr-3"}`}
            />
            {!isSidebarCollapsed && (
              <span className="text-lg font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className={`
          absolute top-10 -right-3 z-50 bg-white rounded-full p-1 border shadow-md hidden md:block
        `}
        aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;

