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
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'linkedin':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'facebook':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'instagram':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    default:
      return 'bg-purple-50 text-purple-700 border-purple-200';
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

    // Combine date and time
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

      // Reset form
      setContent('');
      setSelectedPlatforms([]);
      setScheduledDate('');
      setScheduledTime('');
      removeMedia();

      // Refresh list
      fetchPosts();
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast.error(err.response?.data?.message || 'Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

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

  const upcomingPosts = posts.filter((p) => p.status === 'scheduled');
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const displayedPosts = activeTab === 'upcoming' ? upcomingPosts : publishedPosts;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
          Post Scheduler
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create, attach media, and schedule automated posts across multiple social channels.
        </p>
      </div>

      {/* Grid: Left Composer & Right Posts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE — Post composer form (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-indigo-100/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-indigo-950/5">
          <h2 className="text-lg font-black text-indigo-950 mb-4 flex items-center gap-2">
            <Send className="h-4 w-4 text-[#5c4ce9]" />
            Create Scheduled Post
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Content Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Post Content
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share? Add hashtags, mentions, or links..."
                className="w-full p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[11px] text-slate-400 font-mono">
                  {content.length} characters
                </span>
              </div>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#5c4ce9] to-[#5143e2] text-white border-transparent shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50/50 hover:text-indigo-950 hover:border-indigo-200'
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                  className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 hover:border-[#f97316]/60 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-orange-50/20 transition group"
                >
                  <div className="p-2.5 rounded-xl bg-white text-slate-400 group-hover:text-[#f97316] group-hover:scale-110 shadow-xs transition">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-2">
                    Click to upload image or video
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Supports PNG, JPG, GIF, MP4 (max 50MB)
                  </span>
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-indigo-100 bg-indigo-50/30 p-2">
                  <div className="relative max-h-48 overflow-hidden rounded-xl flex items-center justify-center bg-white">
                    {mediaFile?.type.startsWith('video/') ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-h-48 w-full object-cover rounded-xl"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-48 w-full object-contain rounded-xl"
                      />
                    )}
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition shadow-lg cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 truncate mt-2 px-1">
                    {mediaFile?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Date and Time pickers side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#5c4ce9]" />
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#f97316]" />
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white btn-primary-orange flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
        <div className="lg:col-span-7 bg-white border border-indigo-100/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-indigo-950/5">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-indigo-100/70 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'upcoming'
                    ? 'bg-gradient-to-r from-[#5c4ce9] to-[#5143e2] text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-500 hover:text-indigo-950 hover:bg-indigo-50/60'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Upcoming</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {upcomingPosts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('published')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'published'
                    ? 'bg-gradient-to-r from-[#5c4ce9] to-[#5143e2] text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-500 hover:text-indigo-950 hover:bg-indigo-50/60'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Published</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'published' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {publishedPosts.length}
                </span>
              </button>
            </div>
          </div>

          {/* Posts List Content */}
          {postsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5c4ce9]/20 border-t-[#5c4ce9]" />
              <p className="mt-3 text-xs font-semibold text-slate-500">Loading posts...</p>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-indigo-50/20 border-2 border-dashed border-indigo-200/80 rounded-2xl">
              <div className="p-3 bg-white shadow-xs rounded-full w-fit mx-auto text-[#5c4ce9] mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-indigo-950">
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
                  className="p-4.5 rounded-2xl bg-indigo-50/30 border border-indigo-100/80 hover:border-indigo-300 hover:bg-white transition flex flex-col sm:flex-row items-start gap-4 shadow-xs"
                >
                  {/* Media thumbnail if present */}
                  {post.mediaUrl && (
                    <div className="relative h-20 w-20 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 border border-indigo-100 bg-white">
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
                    <p className="text-sm font-medium text-slate-800 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3 pt-3 border-t border-indigo-100/70">
                      {/* Platform badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {post.platforms.map((plat) => (
                          <span
                            key={plat}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getPlatformBadgeColor(
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Published
                          </span>
                        ) : post.status === 'scheduled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-orange-50 text-orange-700 border border-orange-200">
                            <Clock className="h-3 w-3" /> Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="h-3 w-3" /> {post.status}
                          </span>
                        )}

                        {/* Scheduled time */}
                        <span className="text-xs text-slate-500 font-semibold">
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
