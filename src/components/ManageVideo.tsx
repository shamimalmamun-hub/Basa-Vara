import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Video, Upload, Link as LinkIcon, Trash2, RotateCcw, AlertTriangle, Play, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getYouTubeId, uploadImageToFirebase } from '../lib/utils';

const DEFAULT_VIDEO_URL = 'https://assets.mixkit.co/videos/preview/mixkit-realtor-showing-apartment-to-couple-40332-large.mp4';

export default function ManageVideo() {
  const { heroVideoUrl, updateHeroVideoUrl } = useApp();
  const { language } = useLanguage();
  const [videoInputUrl, setVideoInputUrl] = useState(heroVideoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setVideoInputUrl(heroVideoUrl);
  }, [heroVideoUrl]);

  useEffect(() => {
    if (previewVideoRef.current) {
      previewVideoRef.current.muted = true;
      previewVideoRef.current.defaultMuted = true;
      const playPromise = previewVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Preview autoplay prevented: ", error);
        });
      }
    }
  }, [heroVideoUrl]);

  const handleUpdateUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoInputUrl.trim()) {
      toast.error(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ভিডিও লিংক প্রদান করুন!'
          : 'Please enter a valid video URL!'
      );
      return;
    }
    updateHeroVideoUrl(videoInputUrl.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's video or media
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      toast.error(
        language === 'bn'
          ? 'শুধুমাত্র ভিডিও অথবা ছবি ফরম্যাট আপলোড করা সম্ভব!'
          : 'Only video or image files are allowed!'
      );
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(language === 'bn' ? 'ফাইল Firebase Storage-এ আপলোড করা হচ্ছে...' : 'Uploading file to Firebase Storage...');
    try {
      const storageUrl = await uploadImageToFirebase(file, 'media');
      updateHeroVideoUrl(storageUrl);
      setVideoInputUrl(storageUrl);
      setIsUploading(false);
      toast.dismiss(toastId);
      toast.success(
        language === 'bn'
          ? 'ফাইলটি সফলভাবে Firebase Storage-এ আপলোড করা হয়েছে।'
          : 'File successfully uploaded to Firebase Storage.'
      );
    } catch (err) {
      setIsUploading(false);
      toast.dismiss(toastId);
      toast.error(language === 'bn' ? 'ফাইল আপলোডে সমস্যা হয়েছে!' : 'Error uploading file!');
    }
  };

  const handleResetToDefault = () => {
    updateHeroVideoUrl(DEFAULT_VIDEO_URL);
    setVideoInputUrl(DEFAULT_VIDEO_URL);
    toast.success(
      language === 'bn'
        ? 'ডিফল্ট অ্যাপার্টমেন্ট সম্পর্কিত ভিডিও পুনর্বহাল করা হয়েছে।'
        : 'Reverted to default apartment background video.'
    );
  };

  const handleDeleteVideo = () => {
    updateHeroVideoUrl('');
    setVideoInputUrl('');
    toast.success(
      language === 'bn'
        ? 'ব্যাকগ্রাউন্ড ভিডিও মুছে ফেলা হয়েছে! হোম পেইজে এখন ডিফল্ট ব্যানার ইমেজ প্রদর্শিত হবে।'
        : 'Background video removed! Home page will show default image banner.'
    );
  };

  return (
    <div id="manage-video-container" className="space-y-8 animate-fadeIn">
      {/* Title Check */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {language === 'bn' ? 'হোম পেইজ ব্যাকগ্রাউন্ড ভিডিও কন্ট্রোল' : 'Home Page Background Video Control'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'bn' 
              ? 'হোম পেইজের প্রথম সেকশনে আপনার প্ল্যাটফর্ম সম্পর্কিত ব্যাকগ্রাউন্ড ভিডিও পরিবর্তন করুন।' 
              : 'Modify the introductory background video displayed at the top section of the homepage.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Settings panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* URL Input card */}
          <div id="video-url-setting-card" className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {language === 'bn' ? 'ভিডিও লিঙ্ক (MP4 URL) ব্যবহার করুন' : 'Provide Video Stream Link (MP4 URL)'}
            </h3>
            
            <form onSubmit={handleUpdateUrl} className="space-y-4">
              <div>
                <label htmlFor="video-url-input" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  {language === 'bn' ? 'ভিডিওর সরাসরি ইউআরএল (MP4 বা ডাটা-লিঙ্ক)' : 'Direct Video URL Path (MP4 or Data Link)'}
                </label>
                <input
                  id="video-url-input"
                  type="text"
                  value={videoInputUrl.startsWith('data:video') ? 'Uploaded Base64 Video Data' : videoInputUrl}
                  onChange={(e) => setVideoInputUrl(e.target.value)}
                  placeholder="https://example.com/background-rentals.mp4"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-305 transition-all"
                  disabled={videoInputUrl.startsWith('data:video')}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  id="btn-update-video-url"
                  type="submit"
                  disabled={videoInputUrl.startsWith('data:video')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  {language === 'bn' ? 'লিঙ্ক আপডেট করুন' : 'Update Stream Link'}
                </button>
                
                {videoInputUrl.startsWith('data:video') && (
                  <button
                    id="btn-switch-to-url"
                    type="button"
                    onClick={() => setVideoInputUrl('')}
                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {language === 'bn' ? 'পুনরায় লিঙ্ক টাইপ করুন' : 'Reset to Type URL Instead'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* File upload card */}
          <div id="video-file-upload-card" className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {language === 'bn' ? 'নতুন ভিডিও ফাইল আপলোড করুন' : 'Upload Video File From Device'}
            </h3>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/40 rounded-xl p-4 flex gap-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="font-bold">
                  {language === 'bn' ? 'গুরুত্বপূর্ণ সীমাবদ্ধতা সতর্কতা:' : 'Important Size Limitation Notice:'}
                </p>
                <p>
                  {language === 'bn' 
                    ? 'ব্রাউজারের লোকালস্টোরেজ ৩.৫ মেগাবাইটের বেশি সামগ্রিক ডাটা সংরক্ষণ করতে দেয় না। সেহেতু আপনার আপলোডকৃত ভিডিওর ফাইল ফাইল সাইজ অবশ্যই ছোট (১-৩ MB এর নিচে) হতে হবে।' 
                    : 'A browser\'s localStorage cap matches around 3.5MB. For flawless saves, compress your files or select video clips that weigh no more than 1MB to 3MB total size.'}
                </p>
                <p className="font-medium text-indigo-600 dark:text-indigo-400">
                  {language === 'bn' 
                    ? '💡 সেরা পারফরম্যান্সের জন্য একটি ফ্রি হোস্টিং সাইটে ভিডিও আপলোড করে উপরে ডিরেক্ট MP4 লিঙ্ক ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।' 
                    : '💡 Recommendations: Host the clip online on free video hosts or CDNs and embed its absolute link path above directly.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                id="hidden-video-file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="video/*"
                className="hidden"
              />
              <button
                id="btn-trigger-upload-video"
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-705 text-white rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                {isUploading 
                  ? (language === 'bn' ? 'রিসোর্স লোড হচ্ছে...' : 'Uploading resource...') 
                  : (language === 'bn' ? 'ভিডিও ফাইল সিলেক্ট করুন' : 'Choose Video File')}
              </button>
            </div>
          </div>

          {/* Quick restore & delete actions */}
          <div id="video-danger-quick-actions" className="flex flex-wrap gap-4">
            <button
              id="btn-restore-default-video"
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200/50 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {language === 'bn' ? 'ডিফল্ট ভিডিওতে রিসেট করুন' : 'Restore Default Video'}
            </button>

            {heroVideoUrl && (
              <button
                id="btn-delete-video"
                type="button"
                onClick={handleDeleteVideo}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-150 dark:bg-red-950/20 dark:hover:bg-red-900/40 border border-red-200/40 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {language === 'bn' ? 'ভিডিও ডিলিট করুন (ফ্ল্যাট ইমেজ দেখান)' : 'Delete Background Video'}
              </button>
            )}
          </div>

        </div>

        {/* Live Preview panel */}
        <div className="lg:col-span-5">
          <div id="video-preview-bento" className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {language === 'bn' ? 'লাইভ প্রিভিউ স্ক্রিন' : 'Live Preview Screen'}
              </h3>
              <span className={`h-2.5 w-2.5 rounded-full ${heroVideoUrl ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-400'}`}></span>
            </div>

            <div className="relative flex-1 aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
              {heroVideoUrl ? (
                <>
                  {getYouTubeId(heroVideoUrl) ? (
                    <iframe
                      className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-[1.35] z-0"
                      src={`https://www.youtube.com/embed/${getYouTubeId(heroVideoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(heroVideoUrl)}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title="Preview YouTube Video"
                    />
                  ) : (
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      loop
                      muted
                      playsInline
                      id="preview-video-element"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      src={heroVideoUrl}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/45 z-10 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-white text-xs font-extrabold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded-full shadow-lg mb-2">
                      {language === 'bn' ? 'লাইভ ব্যাকগ্রাউন্ড' : 'Live BG Active'}
                    </p>
                    <p className="text-white text-sm font-semibold line-clamp-1 opacity-90 max-w-xs">
                      {heroVideoUrl.startsWith('data:video') ? 'Custom Uploaded Data' : heroVideoUrl}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2 z-10">
                  <div className="w-12 h-12 rounded-full bg-slate-800 dark:bg-slate-900 flex items-center justify-center text-slate-400 mx-auto">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-450 dark:text-slate-400">
                    {language === 'bn' ? 'কোনো ব্যাকগ্রাউন্ড ভিডিও নেই' : 'No Background Video Running'}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    {language === 'bn' 
                      ? 'হোম পেইজের মেইন ব্যানারে এখন স্ট্যাটিক আকর্ষণীয় ছবি প্রদর্শিত হবে' 
                      : 'A stylish static fallback image is showcased in your layout background.'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 dark:text-slate-400">
                {language === 'bn' ? 'কিভাবে কাজ করে?' : 'How does this operate?'}
              </p>
              <p className="leading-relaxed">
                {language === 'bn'
                  ? 'এখানে পরিবর্তন করার সাথে সাথেই অ্যাপ্লিকেশনের মূল হোম পেইজের প্রথম (Hero) সেকশনটির আবহ পরিবর্তন হবে। আপনার ভিডিওটি রিলেটেড টপিকের হওয়া উচিত (যেমন: সুন্দর কক্ষ, বাড়ি ভাড়া দেয়া, অথবা টিউটরিং সেশন)।'
                  : 'Modifying items here mutates the background in real-time. Make sure to choose clips that are relevant, e.g. lovely indoor designs, living room decors, or education scenes.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
