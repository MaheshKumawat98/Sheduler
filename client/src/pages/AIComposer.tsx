import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  Wand2,
} from 'lucide-react';
import API from '../api/axios';

export interface GenerationResult {
  content: string;
  mediaUrl?: string;
  generationId: string;
}

const TONES = ['Professional', 'Creative', 'Funny', 'Minimalist', 'Excited'];

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
];

const LOADING_MESSAGES = [
  'Connecting to AI...',
  'Generating your content...',
  'Almost ready...',
];

const AIComposer: React.FC = () => {
  // Generation State
  const [prompt, setPrompt] = useState<string>('');
  const [tone, setTone] = useState<string>('Professional');
  const [generateImage, setGenerateImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState<number>(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Scheduling State
  const [scheduling, setScheduling] = useState<boolean>(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');

  // Rotating loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Generate Post Handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error('Please enter a topic or description for your post');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/posts/generate', {
        prompt: prompt.trim(),
        tone,
        generateImage,
      });

      setResult(response.data);
      toast.success('AI post created successfully!');
    } catch (err: any) {
      console.error('Error generating post:', err);
      toast.error(
        err.response?.data?.message ||
          'Failed to generate post. Please check your AI API keys and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Platform selection for scheduling
  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  // Schedule Generated Post
  const handleScheduleGenerated = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!result) return;

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one target platform');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Please specify both scheduled date and time');
      return;
    }

    if (selectedPlatforms.includes('instagram') && !result.mediaUrl) {
      toast.error('Instagram requires an image. Please generate with an image or choose other platforms.');
      return;
    }

    const scheduledDateObj = new Date(`${scheduledDate}T${scheduledTime}`);
    if (isNaN(scheduledDateObj.getTime())) {
      toast.error('Invalid scheduled date or time');
      return;
    }

    const scheduledFor = scheduledDateObj.toISOString();

    const formData = new FormData();
    formData.append('content', result.content);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('scheduledFor', scheduledFor);
    if (result.mediaUrl) {
      formData.append('mediaUrl', result.mediaUrl);
      formData.append('mediaType', 'image');
    }

    setScheduling(true);

    try {
      await API.post('/posts', formData);

      toast.success('Post scheduled successfully!');

      // Reset scheduling form and result
      setSelectedPlatforms([]);
      setScheduledDate('');
      setScheduledTime('');
      setResult(null);
      setPrompt('');
    } catch (err: any) {
      console.error('Error scheduling generated post:', err);
      toast.error(err.response?.data?.message || 'Failed to schedule post');
    } finally {
      setScheduling(false);
    }
  };

  // Copy content to clipboard
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    toast.success('Copied content to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      {/* SECTION 1 — AI Generation Form */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              AI Post Composer
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Generate engaging social media content with AI. Powered by Google Gemini and Leonardo.ai.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-6 space-y-6">
          {/* Prompt Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Topic or Instructions
            </label>
            <textarea
              rows={4}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to post about... (e.g. 'Announcing the launch of our new developer tools suite next Monday with early-bird discounts')"
              className="w-full p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition resize-none"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Select Tone of Voice
            </label>
            <div className="flex flex-wrap gap-2.5">
              {TONES.map((t) => {
                const isSelected = tone === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Generation Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Generate AI Image (Leonardo.ai)
                </span>
                <p className="text-xs text-amber-400/90 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" />
                  Image generation may take 1-2 minutes to render
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={generateImage}
                onChange={(e) => setGenerateImage(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </form>

        {/* Animated Loading Card during generation */}
        {loading && (
          <div className="mt-6 p-6 rounded-xl bg-purple-950/20 border border-purple-500/30 text-center animate-pulse">
            <div className="inline-flex p-3 rounded-full bg-purple-500/10 text-purple-400 mb-3 animate-spin">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-purple-200">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {generateImage
                ? 'Creating textual copy and rendering 1024x1024 artwork...'
                : 'Formulating optimal copy, tone, and hashtags...'}
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2 — Generation Result (only show if result exists) */}
      {result && (
        <section className="bg-slate-900/90 border border-slate-800 border-t-4 border-t-purple-500 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Generated Content</h2>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
            {/* Left side: Post content & image preview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {result.content}
                </p>
              </div>

              {result.mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-96 flex items-center justify-center">
                  <img
                    src={result.mediaUrl}
                    alt="AI Generated Artwork"
                    className="w-full h-auto max-h-96 object-cover rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Right side: Schedule Form */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Schedule this Post
              </h3>

              <form onSubmit={handleScheduleGenerated} className="space-y-4">
                {/* Platform Selector */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Select Platforms
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((plat) => {
                      const isSelected = selectedPlatforms.includes(plat.id);
                      return (
                        <button
                          key={plat.id}
                          type="button"
                          onClick={() => handlePlatformToggle(plat.id)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          <span>{plat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date and Time pickers */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-purple-400" />
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-purple-400" />
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Schedule Button */}
                <button
                  type="submit"
                  disabled={scheduling}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-md shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {scheduling ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Schedule Post</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AIComposer;
