import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider, { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

// Placeholder Pages for remaining views
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

const AccountsPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Connected Accounts</h2>
      <p className="text-slate-400">Manage your connected social networks.</p>
    </div>
  );
};

const SchedulerPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Post Scheduler</h2>
      <p className="text-slate-400">Schedule posts across multiple platforms.</p>
    </div>
  );
};

const AIComposerPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">AI Composer</h2>
      <p className="text-slate-400">Generate creative posts and images using AI.</p>
    </div>
  );
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

          {/* Protected Routes wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/scheduler" element={<SchedulerPage />} />
            <Route path="/ai-composer" element={<AIComposerPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
