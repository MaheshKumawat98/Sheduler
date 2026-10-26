import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider, { useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Placeholder Pages
const HomePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-purple-400 mb-2">Social Media Platform</h1>
        <p className="text-slate-400 mb-6">Automate, create, and schedule posts across all your social channels.</p>
        {isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">Welcome, <span className="text-purple-300 font-semibold">{user?.name}</span></p>
            <div className="flex justify-center gap-3">
              <Link to="/dashboard" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition">
                Go to Dashboard
              </Link>
              <button onClick={logout} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition">
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            <Link to="/login" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition">
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-4">Dashboard</h1>
      <p className="text-slate-400">Welcome to your social media automation dashboard.</p>
    </div>
  );
};

const AccountsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-4">Connected Accounts</h1>
      <p className="text-slate-400">Manage your connected social networks.</p>
    </div>
  );
};

const SchedulerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-4">Post Scheduler</h1>
      <p className="text-slate-400">Schedule posts across multiple platforms.</p>
    </div>
  );
};

const AIComposerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-4">AI Composer</h1>
      <p className="text-slate-400">Generate creative posts and images using AI.</p>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-sm text-slate-400">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <AccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scheduler"
            element={
              <ProtectedRoute>
                <SchedulerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-composer"
            element={
              <ProtectedRoute>
                <AIComposerPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
