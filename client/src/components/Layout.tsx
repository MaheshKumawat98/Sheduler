import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fd] text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#5c4ce9]/20 border-t-[#5c4ce9]" />
          <span className="text-sm font-semibold text-indigo-950">Loading workspace...</span>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-900 flex selection:bg-[#f97316] selection:text-white relative overflow-x-hidden">
      {/* Subtle brand ambient glow at the top matching Home page theme */}
      <div className="absolute top-0 right-0 left-0 h-96 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent pointer-events-none" />

      {/* Fixed Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
