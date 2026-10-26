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
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-500/20 border-t-purple-500" />
        <p className="mt-4 text-sm font-medium text-slate-400">Loading your dashboard...</p>
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700/80 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Total Posts</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {totalPosts}
              </span>
            </div>
          </div>

          {/* Scheduled Posts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700/80 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Scheduled</span>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {scheduledCount}
              </span>
            </div>
          </div>

          {/* Published Posts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700/80 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Published</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {publishedCount}
              </span>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700/80 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Connected Accounts</span>
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {connectedAccountsCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Connected Accounts row */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Connected Accounts</h2>
            <p className="text-xs text-slate-400">Social channels linked to your workspace</p>
          </div>
          <Link
            to="/accounts"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
          >
            Manage Accounts <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <div className="p-3 bg-slate-900 rounded-full w-fit mx-auto text-slate-500 mb-3">
              <Share2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No accounts connected</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Connect your social profiles (Twitter, Instagram, LinkedIn, etc.) to start publishing.
            </p>
            <Link
              to="/accounts"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-900/30"
            >
              <Plus className="h-3.5 w-3.5" /> Connect First Account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                {/* Avatar / Icon */}
                {acc.avatarUrl ? (
                  <img
                    src={acc.avatarUrl}
                    alt={acc.handle}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/20"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold text-white text-sm uppercase">
                    {acc.platform.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 truncate">
                      {acc.platform}
                    </span>
                    {/* Status dot */}
                    <span
                      title="Connected"
                      className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-200 truncate mt-0.5">
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
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Upcoming Scheduled Posts</h2>
                <p className="text-xs text-slate-400">Queue awaiting publication</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/ai-composer"
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI Composer
                </Link>
                <Link
                  to="/scheduler"
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition"
                >
                  View All <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {upcomingPosts.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                <div className="p-3 bg-slate-900 rounded-full w-fit mx-auto text-slate-500 mb-3">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-300">No upcoming posts</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Your publishing queue is currently clear. Schedule a manual or AI-generated post.
                </p>
                <Link
                  to="/scheduler"
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-md shadow-purple-900/30"
                >
                  <Plus className="h-3.5 w-3.5" /> Schedule a Post
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {upcomingPosts.map((post) => (
                  <div
                    key={post._id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-3.5"
                  >
                    {/* Media thumbnail if present */}
                    {post.mediaUrl && (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="h-12 w-12 rounded-lg object-cover shrink-0 border border-slate-800"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">
                        {post.content.length > 100
                          ? `${post.content.slice(0, 100)}...`
                          : post.content}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/60">
                        {/* Platform badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {post.platforms.map((plat) => (
                            <span
                              key={plat}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            >
                              {plat}
                            </span>
                          ))}
                        </div>

                        {/* Scheduled time */}
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-purple-400" />
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
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <p className="text-xs text-slate-400">Latest platform events and logs</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/50 text-slate-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <div className="p-3 bg-slate-900 rounded-full w-fit mx-auto text-slate-500 mb-3">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No recent activity</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Activities such as publishing posts and AI replies will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((act) => (
                <div
                  key={act._id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                      {act.actionType.replace('_', ' ')}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 truncate">
                      {act.description}
                    </p>
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 shrink-0">
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
