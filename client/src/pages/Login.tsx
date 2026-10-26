import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Calendar,
  Share2,
  Activity,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to /dashboard immediately
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const response = await API.post('/auth/login', {
          email,
          password,
        });

        const { _id, name: userName, email: userEmail, token } = response.data;
        login({ _id, name: userName, email: userEmail }, token);
        toast.success(`Welcome back, ${userName}!`);
        navigate('/dashboard');
      } else {
        // Register Flow
        const response = await API.post('/auth/register', {
          name,
          email,
          password,
        });

        const { _id, name: userName, email: userEmail, token } = response.data;
        login({ _id, name: userName, email: userEmail }, token);
        toast.success(`Account created successfully! Welcome, ${userName}!`);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage =
        error.response?.data?.message ||
        (isLogin ? 'Failed to sign in. Please check your credentials.' : 'Registration failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Left side: Hero & Features (hidden on mobile, visible on lg) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-r border-slate-800/80 overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/50">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              AutoPost
            </span>
          </div>
          <p className="mt-3 text-purple-300 font-medium text-base">
            Automate your social media presence with AI power.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Schedule smarter, create faster, publish everywhere.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Unify your channels, generate captivating posts with Google Gemini and Leonardo.ai, and let background automation handle publishing.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  AI-Powered Generation
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Generate posts with Gemini and creative 1024px visuals with Leonardo.ai in one click.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  Precision Background Scheduler
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Set post schedules down to the minute. Reliable cron jobs publish automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  Multi-Platform Social Sync
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Connect Twitter, Instagram, LinkedIn, and Facebook seamlessly with unified OAuth.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  Comprehensive Activity Feed
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Track live publication logs, scheduled queues, and engagement performance metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} AutoPost. All rights reserved.
        </div>
      </div>

      {/* Right side: Authentication Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/50">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              AutoPost
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {isLogin
                ? 'Sign in to access your social media dashboard.'
                : 'Get started with automated multi-channel publishing.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input (Register Only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:via-purple-400 hover:to-indigo-500 active:scale-[0.99] transition shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Free Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-sm text-slate-400">
              {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                className="ml-2 font-semibold text-purple-400 hover:text-purple-300 transition focus:outline-none underline"
              >
                {isLogin ? 'Create one now' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
