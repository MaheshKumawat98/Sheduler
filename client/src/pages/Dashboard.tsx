import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  Share2,
  Plus,
  Activity,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import API from '../api/axios';

export interface Post {
  _id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledFor: string;
  mediaUrl?: string;
  createdAt?: string;
}

export interface Account {
  _id: string;
  platform: string;
  handle: string;
  status: string;
  avatarUrl?: string;
}

export interface ActivityLog {
  _id: string;
  actionType: 'post_published' | 'ai_reply' | string;
  description: string;
  platform?: string;
  createdAt: string;
  relatedPost?: {
    _id: string;
    content: string;
    platforms: string[];
    status: string;
  };
}

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [postsRes, accountsRes, activityRes] = await Promise.all([
          API.get('/posts'),
          API.get('/accounts'),
          API.get('/activity'),
        ]);

        setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
        setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
        setActivity(Array.isArray(activityRes.data) ? activityRes.data : []);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#5c4ce9]/20 border-t-[#5c4ce9]" />
        <p className="mt-4 text-sm font-semibold text-indigo-950">Loading your dashboard...</p>
      </div>
    );
  }

  // Calculated stats
  const totalPosts = posts.length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const connectedAccountsCount = accounts.length;

  const upcomingPosts = posts
    .filter((p) => p.status === 'scheduled')
    .slice(0, 6);

  // Helper to format date
  const formatDate = (dateString: string): string => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SECTION 1 — Stats cards row */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Posts */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-indigo-950/5 border border-indigo-100/70 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-950/10 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Posts
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5c4ce9] to-[#7c3aed] text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
                {totalPosts}
              </span>
            </div>
          </div>

          {/* Scheduled Posts */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-indigo-950/5 border border-indigo-100/70 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-950/10 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scheduled
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fbbf24] to-[#f97316] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
                {scheduledCount}
              </span>
            </div>
          </div>

          {/* Published Posts */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-indigo-950/5 border border-indigo-100/70 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-950/10 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Published
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
                {publishedCount}
              </span>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-indigo-950/5 border border-indigo-100/70 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-950/10 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Connected Accounts
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/25">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
                {connectedAccountsCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Connected Accounts row */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/5 border border-indigo-100/70">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-indigo-950 tracking-tight">
              Connected Accounts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Social channels linked to your workspace
            </p>
          </div>
          <Link
            to="/accounts"
            className="text-xs sm:text-sm font-bold text-[#f97316] hover:text-[#ea580c] flex items-center gap-1 transition"
          >
            Manage Accounts <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-indigo-200/80 rounded-2xl bg-indigo-50/20">
            <div className="p-3 bg-orange-50 rounded-full w-fit mx-auto text-[#f97316] mb-3">
              <Share2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-indigo-950">No accounts connected yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Connect your social profiles (Twitter, Instagram, LinkedIn, etc.) to start publishing.
            </p>
            <Link
              to="/accounts"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white btn-primary-orange"
            >
              <Plus className="h-3.5 w-3.5" /> Connect First Account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 hover:border-indigo-300 hover:bg-white transition-all shadow-xs"
              >
                {/* Avatar / Icon */}
                {acc.avatarUrl ? (
                  <img
                    src={acc.avatarUrl}
                    alt={acc.handle}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-200"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#5c4ce9] to-[#7c3aed] flex items-center justify-center font-bold text-white text-sm uppercase shadow-sm">
                    {acc.platform.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#5c4ce9] truncate">
                      {acc.platform}
                    </span>
                    {/* Status dot */}
                    <span
                      title="Connected"
                      className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"
                    />
                  </div>
                  <p className="text-sm font-bold text-indigo-950 truncate mt-0.5">
                    @{acc.handle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2-Column Grid: Upcoming Scheduled Posts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 3 — Upcoming Scheduled Posts */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/5 border border-indigo-100/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-indigo-950 tracking-tight">
                  Upcoming Scheduled Posts
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Queue awaiting automated publication
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/ai-composer"
                  className="text-xs font-bold text-[#f97316] hover:text-[#ea580c] flex items-center gap-1 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI Composer
                </Link>
                <Link
                  to="/scheduler"
                  className="text-xs font-bold text-[#5c4ce9] hover:text-[#4534cf] flex items-center gap-1 transition"
                >
                  View All <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {upcomingPosts.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-indigo-200/80 rounded-2xl bg-indigo-50/20">
                <div className="p-3 bg-indigo-50 rounded-full w-fit mx-auto text-[#5c4ce9] mb-3">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-indigo-950">No upcoming posts</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Your publishing queue is currently clear. Schedule a manual or AI-generated post.
                </p>
                <Link
                  to="/scheduler"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white btn-primary-orange"
                >
                  <Plus className="h-3.5 w-3.5" /> Schedule a Post
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {upcomingPosts.map((post) => (
                  <div
                    key={post._id}
                    className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/80 hover:border-indigo-300 hover:bg-white transition flex items-start gap-3.5 shadow-xs"
                  >
                    {/* Media thumbnail if present */}
                    {post.mediaUrl && (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="h-12 w-12 rounded-xl object-cover shrink-0 border border-indigo-100 shadow-xs"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed">
                        {post.content.length > 100
                          ? `${post.content.slice(0, 100)}...`
                          : post.content}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-indigo-100/60">
                        {/* Platform badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {post.platforms.map((plat) => (
                            <span
                              key={plat}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-100/70 text-indigo-800 border border-indigo-200"
                            >
                              {plat}
                            </span>
                          ))}
                        </div>

                        {/* Scheduled time */}
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#f97316]" />
                          {formatDate(post.scheduledFor)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4 — Recent Activity */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/5 border border-indigo-100/70">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-indigo-950 tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Latest platform events and logs
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#f97316]">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-indigo-200/80 rounded-2xl bg-indigo-50/20">
              <div className="p-3 bg-indigo-50 rounded-full w-fit mx-auto text-[#5c4ce9] mb-3">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-indigo-950">No recent activity</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Activities such as publishing posts and AI replies will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((act) => (
                <div
                  key={act._id}
                  className="p-3.5 rounded-2xl bg-indigo-50/30 border border-indigo-100/80 flex items-center justify-between gap-3 hover:border-indigo-200 hover:bg-white transition shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#ea580c] border border-orange-200/70 shrink-0">
                      {act.actionType.replace('_', ' ')}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                      {act.description}
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {formatTimeAgo(act.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
