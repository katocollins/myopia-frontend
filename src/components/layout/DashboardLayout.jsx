import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUiStore } from '../../stores/uiStore';

const DashboardLayout = ({ children }) => {
  const { isSidebarCollapsed } = useUiStore();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content (Topbar + Page Content) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page content area */}
        <main className="flex-1 p-6 bg-white overflow-y-auto pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

