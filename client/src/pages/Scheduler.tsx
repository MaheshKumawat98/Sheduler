import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Image as ImageIcon,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import API from '../api/axios';

export interface Post {
  _id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed' | string;
  scheduledFor: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt?: string;
}

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
];

const getPlatformBadgeColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'linkedin':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'facebook':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'instagram':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    default:
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }
};

const Scheduler: React.FC = () => {
  // Form State
  const [content, setContent] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // List State
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'published'>('upcoming');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch all user posts
  const fetchPosts = useCallback(async () => {
    try {
      const res = await API.get('/posts');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle file selection
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit');
        return;
      }
      setMediaFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle platform selection
  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please write some post content');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one social platform');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Please set both scheduled date and time');
      return;
    }

    // Instagram rule: media file is mandatory
    if (selectedPlatforms.includes('instagram') && !mediaFile) {
      toast.error('Instagram requires an image or video to be uploaded');
      return;
    }

    const scheduledDateObj = new Date(`${scheduledDate}T${scheduledTime}`);
    if (isNaN(scheduledDateObj.getTime())) {
      toast.error('Invalid scheduled date or time');
      return;
    }

    const scheduledFor = scheduledDateObj.toISOString();

    const formData = new FormData();
    formData.append('content', content);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('scheduledFor', scheduledFor);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    setLoading(true);

    try {
      await API.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post scheduled successfully!');

      // Reset form state
      setContent('');
      setSelectedPlatforms([]);
      setScheduledDate('');
      setScheduledTime('');
      removeMedia();

      // Refresh post list
      fetchPosts();
    } catch (err: any) {
      console.error('Error scheduling post:', err);
      toast.error(err.response?.data?.message || 'Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
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

  const upcomingPosts = posts.filter((p) => p.status === 'scheduled');
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const displayedPosts = activeTab === 'upcoming' ? upcomingPosts : publishedPosts;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Post Scheduler
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Create, attach media, and schedule automated posts across multiple social channels.
        </p>
      </div>

      {/* Grid: Left Composer & Right Posts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE — Post composer form (5 cols on lg) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-md">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send className="h-4 w-4 text-purple-400" />
            Create Scheduled Post
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Content Textarea */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Post Content
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share? Add hashtags, mentions, or links..."
                className="w-full p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[11px] text-slate-500 font-mono">
                  {content.length} characters
                </span>
              </div>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Target Platforms
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((plat) => {
                  const isSelected = selectedPlatforms.includes(plat.id);
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => handlePlatformToggle(plat.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3" />}
                      <span>{plat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media Upload Section */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Media Attachment (Optional)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="hidden"
                id="media-file-input"
              />

              {!mediaPreview ? (
                <label
                  htmlFor="media-file-input"
                  className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-xl cursor-pointer bg-slate-950/40 hover:bg-purple-500/5 transition group"
                >
                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-400 group-hover:text-purple-400 group-hover:scale-110 transition">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 mt-2">
                    Click to upload image or video
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Supports PNG, JPG, GIF, MP4 (max 50MB)
                  </span>
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 p-2">
                  <div className="relative max-h-48 overflow-hidden rounded-lg flex items-center justify-center">
                    {mediaFile?.type.startsWith('video/') ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-h-48 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-48 w-full object-contain rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/90 text-white hover:bg-red-600 transition shadow-lg"
                      title="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-2 px-1">
                    {mediaFile?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Date and Time pickers side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-purple-400" />
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  <span>Scheduling Post...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Post</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE — Posts list (7 cols on lg) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'upcoming'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Upcoming</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 border border-white/10">
                  {upcomingPosts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('published')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'published'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Published</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 border border-white/10">
                  {publishedPosts.length}
                </span>
              </button>
            </div>
          </div>

          {/* Posts List Content */}
          {postsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500/20 border-t-purple-500" />
              <p className="mt-3 text-xs text-slate-400">Loading posts...</p>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl">
              <div className="p-3 bg-slate-900 rounded-full w-fit mx-auto text-slate-500 mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                {activeTab === 'upcoming'
                  ? 'No upcoming scheduled posts'
                  : 'No published posts yet'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {activeTab === 'upcoming'
                  ? 'Use the composer on the left to schedule your first multi-platform post.'
                  : 'Posts will move here automatically once published by the scheduler.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedPosts.map((post) => (
                <div
                  key={post._id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row items-start gap-4"
                >
                  {/* Media thumbnail if present */}
                  {post.mediaUrl && (
                    <div className="relative h-20 w-20 sm:h-20 sm:w-20 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                      {post.mediaType === 'video' ? (
                        <video
                          src={post.mediaUrl}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt="Post Media"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0 w-full">
                    <p className="text-sm text-slate-200 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3 pt-3 border-t border-slate-800/60">
                      {/* Platform badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {post.platforms.map((plat) => (
                          <span
                            key={plat}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPlatformBadgeColor(
                              plat
                            )}`}
                          >
                            {plat}
                          </span>
                        ))}
                      </div>

                      {/* Status & Date */}
                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        {post.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> Published
                          </span>
                        ) : post.status === 'scheduled' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" /> Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                            <AlertCircle className="h-3 w-3" /> {post.status}
                          </span>
                        )}

                        {/* Scheduled time */}
                        <span className="text-xs text-slate-400 font-medium">
                          {formatDate(post.scheduledFor)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
