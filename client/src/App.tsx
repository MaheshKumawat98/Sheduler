import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider, { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Scheduler from './pages/Scheduler';
import AIComposer from './pages/AIComposer';
import Layout from './components/Layout';

// Root redirect handler
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fd] text-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#5c4ce9]/20 border-t-[#5c4ce9]" />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e1b4b',
            boxShadow: '0 10px 30px -5px rgba(30, 27, 75, 0.1)',
            borderRadius: '1rem',
            border: '1px solid #e0e7ff',
            fontSize: '13px',
            fontWeight: '600',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/ai-composer" element={<AIComposer />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
