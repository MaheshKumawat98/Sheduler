import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Calendar,
  Share2,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { AutoPostLogo } from '../components/AutoPostLogo';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
    <div className="min-h-screen xl:h-screen xl:max-h-screen bg-gradient-to-br from-[#5c4ce9] via-[#5143e2] to-[#4534cf] relative overflow-hidden flex flex-col justify-between selection:bg-[#f97316] selection:text-white w-full max-w-full">
      {/* Background Decorative Shapes - strictly contained to prevent any viewport expansion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top curved wave banner overlay */}
        <svg
          className="absolute top-0 right-0 w-full h-[540px] pointer-events-none"
          viewBox="0 0 1440 540"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 0 L 1440 0 L 1440 180 C 1220 280, 940 90, 680 200 C 440 300, 220 180, 0 250 Z"
            fill="#3e31be"
            fillOpacity="0.4"
          />
        </svg>

        {/* Top-Right Corner Orange Accent Blob */}
        <div className="absolute -top-20 -right-16 w-44 h-44 sm:w-56 sm:h-56 bg-gradient-to-bl from-[#fb923c] to-[#f97316] rounded-full opacity-95 shadow-lg" />

        {/* Bottom-Right Corner Orange Accent Blob */}
        <div className="absolute -bottom-24 -right-16 w-60 h-60 sm:w-72 sm:h-72 bg-gradient-to-tl from-[#ea580c] to-[#fb923c] rounded-[45%_55%_40%_60%] opacity-90 shadow-xl" />

        {/* Bottom-Left Organic Blob with White Brush Doodle Accents */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-[#ea580c] to-[#fb923c] rounded-[55%_45%_65%_35%] opacity-95 shadow-2xl overflow-hidden">
          <svg
            className="absolute top-1/3 right-1/4 w-28 h-28 pointer-events-none"
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M 18 55 Q 24 32 35 46 T 44 72"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M 42 38 Q 48 18 58 32 T 68 56"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-4 sm:py-6 flex items-center justify-between shrink-0">
        {/* Static AutoPost Logo */}
        <AutoPostLogo variant="light" size="md" />

        {/* Top-Right "Grow your social presence" Handwritten Note & Curved Arrow */}
        <div className="hidden lg:flex items-center gap-2 select-none pr-6">
          <span className="font-caveat text-xl text-white/95 leading-none rotate-[-4deg] tracking-wide text-right">
            Grow your<br />social presence
          </span>
          <svg
            className="w-10 h-10 text-white fill-none -mt-1 -rotate-6"
            viewBox="0 0 50 50"
            stroke="currentColor"
          >
            <path
              d="M 8 16 C 18 4, 38 8, 40 30"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 32 24 L 40 30 L 46 22"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </header>

      {/* Main Hero & Content Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-2 sm:py-4 xl:py-6 flex-1 flex items-center min-w-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center min-w-0">
          {/* Left Column: Hero Headline & Feature Cards */}
          <div className="lg:col-span-7 flex flex-col justify-center min-w-0 w-full">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold tracking-wide shadow-sm w-fit mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#fbbf24] fill-[#fbbf24]/30" />
              <span>AI-Powered Social Media Automation</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[2.9rem] xl:text-[3.25rem] font-black text-white tracking-tight leading-tight sm:leading-[1.12]">
              Schedule smarter,<br />
              create faster,<br />
              <span className="relative inline-block text-[#ffb020] pr-7 sm:pr-8">
                publish everywhere.
                {/* 3 Radiating Orange Accent Lines */}
                <span className="absolute right-0 top-0 select-none pointer-events-none">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 36 36" fill="none">
                    <line x1="6" y1="18" x2="22" y2="8" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="8" y1="26" x2="26" y2="20" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="8" y1="31" x2="22" y2="31" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="mt-3.5 sm:mt-4 text-indigo-100/90 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
              Unify your channels, generate captivating posts with AI power, and let AutoPost handle publishing — so you can focus on what really matters.
            </p>

            {/* 4 Feature Cards (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-7 max-w-2xl w-full">
              {/* Card 1: AI-Powered Generation */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4.5 shadow-xl shadow-indigo-950/15 border border-white/80 flex items-start gap-3.5 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-950/20 cursor-default min-w-0 will-change-transform">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fbbf24] to-[#f97316] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    AI-Powered Generation
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-1">
                    Generate posts with AI, tailored to your brand and audience. No more writer&apos;s block.
                  </p>
                </div>
              </div>

              {/* Card 2: Precision Background Scheduler */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4.5 shadow-xl shadow-indigo-950/15 border border-white/80 flex items-start gap-3.5 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-950/20 cursor-default min-w-0 will-change-transform">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fbbf24] to-[#f97316] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Precision Background Scheduler
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-1">
                    Set post schedules down to the minute. Reliable cron jobs publish automatically.
                  </p>
                </div>
              </div>

              {/* Card 3: Multi-Platform Social Sync */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4.5 shadow-xl shadow-indigo-950/15 border border-white/80 flex items-start gap-3.5 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-950/20 cursor-default min-w-0 will-change-transform">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fbbf24] to-[#f97316] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Multi-Platform Social Sync
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-1">
                    Connect Twitter, Instagram, LinkedIn, and Facebook seamlessly with unified OAuth.
                  </p>
                </div>
              </div>

              {/* Card 4: Comprehensive Activity Feed */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4.5 shadow-xl shadow-indigo-950/15 border border-white/80 flex items-start gap-3.5 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-950/20 cursor-default min-w-0 will-change-transform">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fbbf24] to-[#f97316] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <rect x="4" y="13" width="3.5" height="7" rx="1.5" />
                    <rect x="10.25" y="8" width="3.5" height="12" rx="1.5" />
                    <rect x="16.5" y="4" width="3.5" height="16" rx="1.5" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Comprehensive Activity Feed
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-1">
                    Track live publication logs, scheduled queues, and engagement performance metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating White Login Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full min-w-0">
            <div className="relative w-full max-w-full sm:max-w-md">
              {/* Top-Right Decorative Sunburst Rays */}
              <div className="absolute -top-3.5 right-0 pointer-events-none select-none z-20">
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                  <line x1="8" y1="22" x2="20" y2="10" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                  <line x1="16" y1="28" x2="30" y2="20" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                  <line x1="22" y1="36" x2="36" y2="30" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Bottom-Right Decorative Sunburst Rays */}
              <div className="absolute -bottom-3.5 right-0 pointer-events-none select-none z-20">
                <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none">
                  <line x1="8" y1="12" x2="24" y2="24" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="18" y1="8" x2="30" y2="18" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* White Floating Form Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-9 shadow-2xl shadow-indigo-950/25 border border-white/60 relative z-10 w-full">
                {/* Static AutoPost Logo inside Card */}
                <AutoPostLogo variant="dark" size="md" />

                {/* Card Title & Subtitle */}
                <div className="mt-4 mb-5">
                  <h2 className="text-2xl sm:text-[1.75rem] font-black text-indigo-950 tracking-tight">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                  </h2>
                  <p className="mt-1 text-slate-500 text-xs sm:text-sm font-normal">
                    {isLogin
                      ? 'Sign in to access your social media dashboard'
                      : 'Get started with automated multi-channel publishing.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                  {/* Name Input (Register Only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Full Name
                      </label>
                      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-[#f97316] focus-within:ring-2 focus-within:ring-[#f97316]/20 transition">
                        <div className="p-1.5 rounded-lg bg-orange-50 text-[#f97316] shrink-0">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          required={!isLogin}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          autoComplete="name"
                          className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-[#f97316] focus-within:ring-2 focus-within:ring-[#f97316]/20 transition">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        autoComplete="email"
                        className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Password
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-[#f97316] focus-within:ring-2 focus-within:ring-[#f97316]/20 transition">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 shrink-0">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-[#f97316] focus:outline-none p-1 shrink-0 cursor-pointer transition"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button (Vibrant Orange CTA) */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 sm:mt-3 py-3 px-5 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#fb923c] via-[#f97316] to-[#ea580c] hover:from-[#f97316] hover:to-[#c2410c] active:scale-[0.99] transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

                {/* OR Divider */}
                <div className="relative my-4 sm:my-5 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
                    OR
                  </span>
                </div>

                {/* Toggle between Login and Register */}
                <div className="text-center text-xs sm:text-sm text-slate-500">
                  <span>{isLogin ? "Don't have an account yet?" : 'Already have an account?'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setName('');
                      setEmail('');
                      setPassword('');
                    }}
                    className="ml-1.5 font-bold text-[#f97316] hover:text-[#ea580c] transition focus:outline-none underline underline-offset-2 cursor-pointer"
                  >
                    {isLogin ? 'Create one now' : 'Sign in here'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle bottom spacing to frame the corner accents */}
      <div className="h-2 sm:h-4 shrink-0" />
    </div>
  );
};

export default Login;
