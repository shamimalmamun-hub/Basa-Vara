import React, { useState } from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { FileCode2, Image, Save, RotateCcw, Layout, Compass, Type, Eye, Sparkles, Copy, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage } from '../lib/utils';

export default function ManageHomepage() {
  const { overrides, updateOverrides, language } = useLanguage();
  const { 
    properties, 
    tutors, 
    banners, 
    heroVideoUrl,
    isScrollingTextEnabled,
    scrollingTextBn,
    scrollingTextEn,
    updateScrollingTextSettings,
    popupImageUrl,
    isPopupEnabled,
    updatePopupSettings
  } = useApp();
  
  const [activeSubTab, setActiveSubTab] = useState<'logo' | 'menu' | 'hero' | 'sections' | 'scrolling' | 'popup' | 'sync'>('logo');

  const [tempScrollingEnabled, setTempScrollingEnabled] = useState(isScrollingTextEnabled);
  const [tempScrollingTextBn, setTempScrollingTextBn] = useState(scrollingTextBn);
  const [tempScrollingTextEn, setTempScrollingTextEn] = useState(scrollingTextEn);

  const [tempPopupEnabled, setTempPopupEnabled] = useState(isPopupEnabled || false);
  const [tempPopupImageUrl, setTempPopupImageUrl] = useState(popupImageUrl || '');

  React.useEffect(() => {
    setTempScrollingEnabled(isScrollingTextEnabled);
  }, [isScrollingTextEnabled]);

  React.useEffect(() => {
    setTempScrollingTextBn(scrollingTextBn);
  }, [scrollingTextBn]);

  React.useEffect(() => {
    setTempScrollingTextEn(scrollingTextEn);
  }, [scrollingTextEn]);

  React.useEffect(() => {
    setTempPopupEnabled(isPopupEnabled || false);
  }, [isPopupEnabled]);

  React.useEffect(() => {
    setTempPopupImageUrl(popupImageUrl || '');
  }, [popupImageUrl]);

  // Copy overrides to local state
  const [tempOverrides, setTempOverrides] = useState<Record<Language, Record<string, string>>>(() => {
    return {
      bn: { ...(overrides.bn || {}) },
      en: { ...(overrides.en || {}) },
    };
  });

  const handleTextChange = (lang: Language, key: string, value: string) => {
    setTempOverrides(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [key]: value
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setTempOverrides(prev => ({
          ...prev,
          bn: { ...prev.bn, customLogoImage: compressed },
          en: { ...prev.en, customLogoImage: compressed }
        }));
        toast.success(language === 'bn' ? 'লোগো কম্প্রেসড ও লোড করা হয়েছে, পরিবর্তন সেভ করতে নিচে বাটন চাপুন।' : 'Logo loaded and compressed, press save below to submit.');
      } catch (err) {
        console.error("Logo compression failed:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setTempOverrides(prev => ({
            ...prev,
            bn: { ...prev.bn, customLogoImage: base64 },
            en: { ...prev.en, customLogoImage: base64 }
          }));
          toast.success('লোগো লোড করা হয়েছে, পরিবর্তন সেভ করতে নিচে বাটন চাপুন।');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const clearLogoImage = () => {
    setTempOverrides(prev => {
      const bnCopy = { ...prev.bn };
      const enCopy = { ...prev.en };
      delete bnCopy.customLogoImage;
      delete enCopy.customLogoImage;
      return { bn: bnCopy, en: enCopy };
    });
    toast.success('কাস্টম লোগো সরানো হয়েছে (Reverted to default Home Icon)');
  };

  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setTempPopupImageUrl(compressed);
        toast.success(language === 'bn' ? 'পপআপ ছবি সফলভাবে লোড করা হয়েছে! পরিবর্তন সেভ করতে নিচের সেভ বাটনে চাপুন।' : 'Popup image loaded successfully! Press save below to submit.');
      } catch (err) {
        console.error("Popup image compression failed, reading raw file:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setTempPopupImageUrl(reader.result as string);
          toast.success(language === 'bn' ? 'পপআপ ছবি লোড করা হয়েছে! পরিবর্তন সেভ করতে নিচের সেভ বাটনে চাপুন।' : 'Popup image loaded! Press save below to submit.');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePopupImage = () => {
    setTempPopupImageUrl('');
    toast.success(language === 'bn' ? 'পপআপ ছবি সরানো হয়েছে! পরিবর্তন সেভ করতে নিচের সেভ বাটনে চাপুন।' : 'Popup image removed! Press save below to submit.');
  };

  const handleSave = async () => {
    try {
      updateOverrides(tempOverrides);
      await updateScrollingTextSettings(tempScrollingEnabled, tempScrollingTextBn, tempScrollingTextEn);
      await updatePopupSettings(tempPopupEnabled, tempPopupImageUrl);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আসল টেক্সট পুনরুদ্ধার করতে চান? কাস্টম সকল পরিবর্তন মুছে যাবে।')) {
      const resetState = { bn: {}, en: {} };
      setTempOverrides(resetState);
      updateOverrides(resetState);
      toast.success('ডিফল্ট সিস্টেমে ফেরত যাওয়া হয়েছে।');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Layout className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          হোমপেইজ টেক্সট, মেনু ও লোগো এডিটর
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-400">
          প্রশাসক প্যানেল থেকে ওয়েবসাইটের লোগো, নেভিগেশন লিংক এবং হোম পেইজের হিরো হেডিংসহ সব লেখা পরিবর্তন করুন।
        </p>
      </div>

      {/* Editor Sub-Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
        <button
          onClick={() => setActiveSubTab('logo')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'logo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'}`}
        >
          <Image className="w-3.5 h-3.5" /> ব্র্যান্ড ও লোগো
        </button>
        <button
          onClick={() => setActiveSubTab('menu')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'menu' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'}`}
        >
          <Compass className="w-3.5 h-3.5" /> মেনু লিংকসমূহ
        </button>
        <button
          onClick={() => setActiveSubTab('hero')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'hero' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'}`}
        >
          <Type className="w-3.5 h-3.5" /> হিরো সেকশন
        </button>
        <button
          onClick={() => setActiveSubTab('sections')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'sections' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'}`}
        >
          <FileCode2 className="w-3.5 h-3.5" /> বিজ্ঞাপন ও টিউটর সেকশন
        </button>
        <button
          onClick={() => setActiveSubTab('scrolling')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'scrolling' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'}`}
        >
          <Megaphone className="w-3.5 h-3.5" /> স্ক্রলিং টেক্সট হেডার
        </button>
        <button
          onClick={() => setActiveSubTab('popup')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'popup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'}`}
        >
          <Image className="w-3.5 h-3.5" /> প্রবেশকালীন পপআপ
        </button>
        <button
          onClick={() => setActiveSubTab('sync')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'sync' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'}`}
        >
          <Sparkles className="w-3.5 h-3.5" /> ক্লাউডফ্লেয়ার প্রোডাকশন সিঙ্ক (Sync Code)
        </button>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-6">
        
        {/* TAB 1: Logo & Brand Name */}
        {activeSubTab === 'logo' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" /> লোগো এবং ব্র্যান্ড টেক্সট কাস্টমাইজেশন
            </h3>
            
            {/* Logo Image Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400">কাস্টম লোগো ছবি (Custom Logo Image)</label>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                  {tempOverrides.bn.customLogoImage ? (
                    <img src={tempOverrides.bn.customLogoImage} alt="Custom logo preview" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xs text-slate-400 text-center px-1 font-medium">No Logo</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-650 dark:text-indigo-400 rounded-xl text-xs font-black transition-colors border border-indigo-150 dark:border-indigo-900">
                    আপলোড করুন
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {tempOverrides.bn.customLogoImage && (
                    <button
                      type="button"
                      onClick={clearLogoImage}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-650 dark:text-red-400 rounded-xl text-xs font-black transition-colors border border-red-150 dark:border-red-900"
                    >
                      লোগো সরান
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500">
                লোগোটি আপলোড করলে ডিফল্ট হোম আইকনের জায়গায় এটি প্রদর্শিত হবে।
              </p>
            </div>

            {/* Brand Logo Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1.5">ব্র্যান্ড নাম (বাংলা)</label>
                <input
                  type="text"
                  placeholder="ডিফল্ট: বাসা ভাড়া ও হোম টিউটর"
                  value={tempOverrides.bn.brandName || ''}
                  onChange={(e) => handleTextChange('bn', 'brandName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs text-slate-855 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1.5">Brand Name (English)</label>
                <input
                  type="text"
                  placeholder="Default: BasaVara & Tutor"
                  value={tempOverrides.en.brandName || ''}
                  onChange={(e) => handleTextChange('en', 'brandName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs text-slate-855 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Menu / Nav Labels */}
        {activeSubTab === 'menu' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
              নেভিগেশন মেনু লিঙ্ক সমূহের নাম
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Properties Menus */}
              <div className="p-4 bg-white dark:bg-[#0c1222] border border-slate-200/50 dark:border-slate-800/60 rounded-2xl space-y-4">
                <span className="text-[10px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">মেস/বাসা মেনু (Rentals Link)</span>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">বাংলা কাস্টম টেক্সট</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: প্রপার্টিসমূহ"
                    value={tempOverrides.bn.navProperties || ''}
                    onChange={(e) => handleTextChange('bn', 'navProperties', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-transparent dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">English Custom Text</label>
                  <input
                    type="text"
                    placeholder="Default: Properties"
                    value={tempOverrides.en.navProperties || ''}
                    onChange={(e) => handleTextChange('en', 'navProperties', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-transparent dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Tutors Menus */}
              <div className="p-4 bg-white dark:bg-[#0c1222] border border-slate-200/50 dark:border-slate-800/60 rounded-2xl space-y-4">
                <span className="text-[10px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">হোম টিউটর লিংক (Tutors Link)</span>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">বাংলা কাস্টম টেক্সট</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: হোম টিউটর"
                    value={tempOverrides.bn.navTutors || ''}
                    onChange={(e) => handleTextChange('bn', 'navTutors', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-transparent dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">English Custom Text</label>
                  <input
                    type="text"
                    placeholder="Default: Home Tutors"
                    value={tempOverrides.en.navTutors || ''}
                    onChange={(e) => handleTextChange('en', 'navTutors', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-transparent dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Dashboard Menus */}
              <div className="p-4 bg-white dark:bg-[#0c1222] border border-slate-200/50 dark:border-slate-800/60 rounded-2xl space-y-4">
                <span className="text-[10px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">ড্যাশবোর্ড লিংক (Dashboard Link)</span>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">বাংলা কাস্টম টেক্সট</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: ড্যাশবোর্ড"
                    value={tempOverrides.bn.navDashboard || ''}
                    onChange={(e) => handleTextChange('bn', 'navDashboard', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-transparent dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">English Custom Text</label>
                  <input
                    type="text"
                    placeholder="Default: Dashboard"
                    value={tempOverrides.en.navDashboard || ''}
                    onChange={(e) => handleTextChange('en', 'navDashboard', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-transparent dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Login Menus */}
              <div className="p-4 bg-white dark:bg-[#0c1222] border border-slate-200/50 dark:border-slate-800/60 rounded-2xl space-y-4">
                <span className="text-[10px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">লগইন বাটন (Login Target)</span>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">বাংলা কাস্টม টেক্সট</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: লগইন / রেজিস্টার"
                    value={tempOverrides.bn.navLogin || ''}
                    onChange={(e) => handleTextChange('bn', 'navLogin', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-transparent dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">English Custom Text</label>
                  <input
                    type="text"
                    placeholder="Default: Login / Register"
                    value={tempOverrides.en.navLogin || ''}
                    onChange={(e) => handleTextChange('en', 'navLogin', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-transparent dark:border-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Hero Area Content */}
        {activeSubTab === 'hero' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
              হিরো সেকশন টেক্সট কাস্টমাইজেশন
            </h3>

            {/* Tagline / Badge Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <label className="block text-xs font-bold text-slate-705 dark:text-slate-300 mb-1.5">শীর্ষ সার্ভিস ব্যাজ লেখা (বাংলা)</label>
                <input
                  type="text"
                  placeholder="ডিফল্ট: ময়মনসিংহ বিভাগের এক নম্বর সার্ভিস প্ল্যাটফর্ম"
                  value={tempOverrides.bn.heroBadgeText || ''}
                  onChange={(e) => handleTextChange('bn', 'heroBadgeText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-705 dark:text-slate-300 mb-1.5">Top Banner Badge (English)</label>
                <input
                  type="text"
                  placeholder="Default: Mymensingh's Unified Rental & Tutor Platform"
                  value={tempOverrides.en.heroBadgeText || ''}
                  onChange={(e) => handleTextChange('en', 'heroBadgeText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Hero Main Lines */}
            <div className="grid grid-cols-1 gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-705 dark:text-slate-300 mb-1.5">প্রথম শিরোনাম (বাংলা)</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: খুঁজে নিন আপনার স্বপ্নের"
                    value={tempOverrides.bn.heroTitle1 || ''}
                    onChange={(e) => handleTextChange('bn', 'heroTitle1', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-705 dark:text-slate-300 mb-1.5">First Header (English)</label>
                  <input
                    type="text"
                    placeholder="Default: Find Your Dream"
                    value={tempOverrides.en.heroTitle1 || ''}
                    onChange={(e) => handleTextChange('en', 'heroTitle1', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-705 dark:text-slate-300 mb-1.5 font-sans">হাইলাইটেড ফ্রেজ (বাংলা)</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: বাসা ও টিউটর"
                    value={tempOverrides.bn.heroTitleAccent || ''}
                    onChange={(e) => handleTextChange('bn', 'heroTitleAccent', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-705 dark:text-slate-300 mb-1.5">Highlighted Accent (English)</label>
                  <input
                    type="text"
                    placeholder="Default: Home & Tutor"
                    value={tempOverrides.en.heroTitleAccent || ''}
                    onChange={(e) => handleTextChange('en', 'heroTitleAccent', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Subtitle Lines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <label className="block text-xs font-bold text-slate-705 dark:text-slate-300 mb-1.5">বর্ণনা / সাবটাইটেল (বাংলা)</label>
                <textarea
                  rows={3}
                  placeholder="ডিফল্ট: ময়মনসিংহ ও মধুপুরের সর্ববৃহৎ প্ল্যাটফর্ম, যেখানে পাচ্ছেন..."
                  value={tempOverrides.bn.heroSubtitle || ''}
                  onChange={(e) => handleTextChange('bn', 'heroSubtitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-705 dark:text-slate-300 mb-1.5">Introduction / Subtitle (English)</label>
                <textarea
                  rows={3}
                  placeholder="Default: The largest platform in Mymensingh..."
                  value={tempOverrides.en.heroSubtitle || ''}
                  onChange={(e) => handleTextChange('en', 'heroSubtitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Under Video Search Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-100/40 dark:bg-slate-900/60 rounded-2xl space-y-4 border border-slate-200/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">বাসা খোঁজার বাটন (Find Home Button)</span>
                <div>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: বাসা/মেস খুঁজুন"
                    value={tempOverrides.bn.heroFindHomeButton || ''}
                    onChange={(e) => handleTextChange('bn', 'heroFindHomeButton', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Default: Find Home/Mess"
                    value={tempOverrides.en.heroFindHomeButton || ''}
                    onChange={(e) => handleTextChange('en', 'heroFindHomeButton', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-100/40 dark:bg-slate-900/60 rounded-2xl space-y-4 border border-slate-200/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">টিউটর খোঁজার বাটন (Find Tutor Button)</span>
                <div>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: টিউটর খুঁজুন"
                    value={tempOverrides.bn.heroFindTutorButton || ''}
                    onChange={(e) => handleTextChange('bn', 'heroFindTutorButton', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Default: Find Tutor"
                    value={tempOverrides.en.heroFindTutorButton || ''}
                    onChange={(e) => handleTextChange('en', 'heroFindTutorButton', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Sections Labels */}
        {activeSubTab === 'sections' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
              নতুন বিজ্ঞাপন ও টিউটর সেকশনের লেখা কাস্টমাইজ করুন
            </h3>

            {/* New Property Rentals Section Label */}
            <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-2xl space-y-4 border border-indigo-100/50 dark:border-indigo-900/40">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">🏠 বাসা ভাড়া বিজ্ঞাপনসমূহ কন্টেইনার</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">বাংলা টাইটেল</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: নতুন বিজ্ঞাপনসমূহ"
                    value={tempOverrides.bn.homeNewAds || ''}
                    onChange={(e) => handleTextChange('bn', 'homeNewAds', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">English Title</label>
                  <input
                    type="text"
                    placeholder="Default: Recent Listings"
                    value={tempOverrides.en.homeNewAds || ''}
                    onChange={(e) => handleTextChange('en', 'homeNewAds', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">বাংলা সাবটাইটেল</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: সর্বশেষ আপলোড করা ফ্ল্যাট, মেস ও সিট।"
                    value={tempOverrides.bn.homeAdsSubtitle || ''}
                    onChange={(e) => handleTextChange('bn', 'homeAdsSubtitle', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">English Subtitle</label>
                  <input
                    type="text"
                    placeholder="Default: Latest uploaded flats, messes, and seats."
                    value={tempOverrides.en.homeAdsSubtitle || ''}
                    onChange={(e) => handleTextChange('en', 'homeAdsSubtitle', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* New Registered Tutors Section Label */}
            <div className="p-4 bg-pink-50/20 dark:bg-pink-950/10 rounded-2xl space-y-4 border border-pink-100/50 dark:border-pink-900/10">
              <span className="text-xs font-bold text-pink-700 dark:text-pink-400 flex items-center gap-1.5">🎓 হোম টিউটর বিজ্ঞাপনসমূহ কন্টেইনার</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">বাংলা টাইটেল</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: নতুন টিউটরসমূহ"
                    value={tempOverrides.bn.homeNewTutors || ''}
                    onChange={(e) => handleTextChange('bn', 'homeNewTutors', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">English Title</label>
                  <input
                    type="text"
                    placeholder="Default: Recent Tutors"
                    value={tempOverrides.en.homeNewTutors || ''}
                    onChange={(e) => handleTextChange('en', 'homeNewTutors', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">বাংলা সাবটাইটেল</label>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: সর্বশেষ নিবন্ধিত শিক্ষক ও টিউটরগণ।"
                    value={tempOverrides.bn.homeTutorsSubtitle || ''}
                    onChange={(e) => handleTextChange('bn', 'homeTutorsSubtitle', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">English Subtitle</label>
                  <input
                    type="text"
                    placeholder="Default: Latest registered teachers and tutors."
                    value={tempOverrides.en.homeTutorsSubtitle || ''}
                    onChange={(e) => handleTextChange('en', 'homeTutorsSubtitle', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* General Buttons e.g See All */}
            <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 rounded-2xl space-y-4 border border-slate-200/50">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400">সব দেখুন লিঙ্ক (See All Button Label)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="ডিফল্ট: সবগুলো দেখুন →"
                    value={tempOverrides.bn.homeSeeAll || ''}
                    onChange={(e) => handleTextChange('bn', 'homeSeeAll', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Default: See All →"
                    value={tempOverrides.en.homeSeeAll || ''}
                    onChange={(e) => handleTextChange('en', 'homeSeeAll', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Scrolling Text Settings */}
        {activeSubTab === 'scrolling' && (
          <div className="space-y-6 animate-fade-in text-left">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-500 animate-pulse" /> স্ক্রলিং টেক্সট এবং ঘোষণা সেটিংস (Scrolling Announcement Bar)
            </h3>

            {/* Toggle switch for Enabling/Disabling */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0c1222] border border-slate-200/50 dark:border-slate-800/60 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">স্ক্রলিং টেক্সট অন/অফ করুন (Toggle Announcement Bar)</p>
                <p className="text-[10px] text-slate-400 mt-1">হেডারের নিচে অফার ও নোটিশ দেখানোর স্ক্রলিং বারটি বন্ধ বা চালু করতে পারবেন।</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={tempScrollingEnabled} 
                  onChange={(e) => setTempScrollingEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-250 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-650 peer-checked:bg-indigo-650"></div>
              </label>
            </div>

            {/* Bengali scroll text input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400">স্ক্রলিং টেক্সট (বাংলা - Bengali Text)</label>
              <textarea
                rows={3}
                placeholder="বাসাভাড়া ও টিউটর রিলেটেড অফার, সাবস্ক্রিপশন এবং ঘোষণা বাংলাতে লিখুন..."
                value={tempScrollingTextBn}
                onChange={(e) => setTempScrollingTextBn(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white leading-relaxed font-medium"
              />
              <p className="text-[10px] text-slate-400">
                যেমন: নতুন অফার! বাসাভাড়া ও হোম টিউটর সাবস্ক্রিপশনে পাচ্ছেন ২৫% পর্যন্ত ছাড়! লিমিটেড সময়ের জন্য ফ্যামিলি ফ্ল্যাট এবং ছাত্র মেসে আকর্ষণীয় অফার চলছে।
              </p>
            </div>

            {/* English scroll text input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400">Scrolling Text (English - ইংরেজি টেক্সট)</label>
              <textarea
                rows={3}
                placeholder="Enter the rental or tutor subscription offers and updates in English..."
                value={tempScrollingTextEn}
                onChange={(e) => setTempScrollingTextEn(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white leading-relaxed font-medium"
              />
              <p className="text-[10px] text-slate-400">
                Example: Special Offer! Get up to 25% off on rentals and tutor subscriptions! Limited time offer is running for family flats and male/female student messes.
              </p>
            </div>
          </div>
        )}

        {/* TAB: Entry Popup Image Settings */}
        {activeSubTab === 'popup' && (
          <div className="space-y-6 animate-fade-in text-left">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-500 animate-pulse" /> প্রবেশকালীন ইমেজ পপআপ বিজ্ঞাপন (Entry Image Popup Advertisement)
            </h3>

            {/* Toggle switch for Popup Enabling/Disabling */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0c1222] border border-slate-200/50 dark:border-slate-800/60 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">পপআপ অন/অফ করুন (Toggle Popup)</p>
                <p className="text-[10px] text-slate-400 mt-1">ব্যবহারকারী ওয়েবসাইটটিতে ঢোকার ১ সেকেন্ড পরে এই বিজ্ঞাপন পপআপটি দেখতে পারবে কি না তা চালু বা বন্ধ করুন।</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={tempPopupEnabled} 
                  onChange={(e) => setTempPopupEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-250 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-650 peer-checked:bg-indigo-650"></div>
              </label>
            </div>

            {/* Popup Image Upload */}
            <div className="space-y-3 p-4 bg-white dark:bg-[#0c1222] border border-slate-200/50 dark:border-slate-800/60 rounded-2xl">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400">পপআপ বিজ্ঞাপন ছবি (Popup Image Asset)</label>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-40 aspect-[4/5] sm:aspect-[3/4] rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                  {tempPopupImageUrl ? (
                    <img src={tempPopupImageUrl} alt="Popup image preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xs text-slate-400 text-center px-1 font-medium">কোনো ছবি নেই (No Image Selected)</span>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md max-w-fit">কন্ট্রোল প্যানেল (Control Options)</span>
                  <div className="flex gap-2 flex-wrap">
                    <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors shadow-sm">
                      নতুন ছবি আপলোড করুন
                      <input type="file" accept="image/*" className="hidden" onChange={handlePopupImageUpload} />
                    </label>
                    {tempPopupImageUrl && (
                      <button
                        type="button"
                        onClick={removePopupImage}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-650 dark:text-red-400 rounded-xl text-xs font-black transition-colors border border-red-150 dark:border-red-900 cursor-pointer"
                      >
                        ছবি মুছে ফেলুন
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                    পপআপের জন্য আকর্ষণীয় ৪:৫ বা ৩:৪ সাইজের ইমেজ (অফার পোস্টার, নোটিশ বা লোগো ব্যানার) আপলোড করুন। সাইট লোড হওয়ার ১ সেকেন্ড পর এটি সুন্দর অ্যানিমেশনের মাধ্যমে ভিজিটরের সামনে ভেসে উঠবে।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Production Sync */}
        {activeSubTab === 'sync' && (
          <div className="space-y-6 animate-fade-in text-left">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-505" /> ক্লাউডফ্লেয়ার প্রোডাকশন সিঙ্ক (Production Sync Panel)
            </h3>

            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded-2xl p-5 text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
              <p className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
                📢 কেন ড্যাশবোর্ড আপডেট করার পরে পাবলিক লিংকে চেঞ্জ দেখা যাচ্ছে না?
              </p>
              <p>
                আপনার ওয়েবসাইটটি সম্পূর্ণ <strong>Static Single Page App (SPA)</strong> হিসেবে ক্লাউডফ্লেয়ার পেজেস (Cloudflare Pages)-এ হোস্ট করা আছে। 
                এর কোনো ডাইনামিক ক্লাউড ডাটাবেস নেই; ফলে ড্যাশবোর্ড থেকে আপনারা যে লোগো, হোমপেজ টেক্সট, ব্যানার, ভিডিও অথবা প্রপার্টি পরিবর্তন করছেন, তা সাময়িকভাবে শুধুমাত্র <strong>আপনার নিজের ব্রাউজারের লোকাল মেমোরি (localStorage)-তে</strong> সংরক্ষিত হচ্ছে।
              </p>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                অন্যান্য সাধারণ ভিজিটরদের ব্রাউজারে এই লোকাল মেমোরি খালি থাকার কারণে তারা নতুন পরিবর্তনগুলো দেখতে পান না।
              </p>
              <hr className="border-slate-200 dark:border-slate-800" />
              <p>
                <strong>চিরস্থায়ী করার সমাধান (Permanent Solution):</strong> 
                নিচের টেক্সটবক্স থেকে সম্পূর্ণ কোডটি কপি করে নিয়ে সরাসরি এই <strong>AI Assistant চ্যাটে মেসেজ পাঠিয়ে আমাদের বলুন "এই কনফিগারেশনটি আমার কোডবেইজে সেভ করে দাও"</strong>। 
                আমি কোডটি চিরদিনের জন্য সিস্টেমের সোর্স ফাইলের ভেতর ডিফল্ট হিসেবে সেভ করে নতুন ডিস্ট্রিবিউশন বিল্ড প্রিপেয়ার করে দেব, যার ফলে পৃথিবীর যেকোনো ডিভাইস থেকে সবাই প্রথমবারেই আপনার কাস্টমাইজড হোমপেইজ দেখতে পারবে!
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  const syncPayload = {
                    overrides: tempOverrides,
                    heroVideoUrl: heroVideoUrl || '',
                    banners: banners || [],
                    properties: properties || [],
                    tutors: tutors || [],
                    scrollingTextSettings: {
                      isScrollingTextEnabled: tempScrollingEnabled,
                      scrollingTextBn: tempScrollingTextBn,
                      scrollingTextEn: tempScrollingTextEn
                    },
                    popupSettings: {
                      isPopupEnabled: tempPopupEnabled,
                      popupImageUrl: tempPopupImageUrl
                    }
                  };
                  
                  const formattedJSON = JSON.stringify(syncPayload, null, 2);
                  navigator.clipboard.writeText(formattedJSON)
                    .then(() => {
                      toast.success('কনফিগারেশন কোড সফলভাবে কপি করা হয়েছে! চ্যাটে পেস্ট করুন।');
                    })
                    .catch(() => {
                      toast.error('কোডটি অটোমেটিক কপি করা যায়নি। অনুগ্রহ করে নিচের বক্স থেকে সিলেক্ট করে কপি করুন।');
                    });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/10 cursor-pointer transition-all active:scale-95"
              >
                <Copy className="w-4 h-4" /> কাস্টমাইজেশন কোড সরাসরি কপি করুন (Copy Code to Clipboard)
              </button>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500">আপনার সম্পূর্ণ কাস্টমাইজেশন কোড (নীচের বক্সে ক্লিক করে কপি করুন):</label>
                <textarea
                  readOnly
                  rows={8}
                  value={JSON.stringify({
                    overrides: tempOverrides,
                    heroVideoUrl: heroVideoUrl || '',
                    banners: banners || [],
                    properties: properties || [],
                    tutors: tutors || [],
                    scrollingTextSettings: {
                      isScrollingTextEnabled: tempScrollingEnabled,
                      scrollingTextBn: tempScrollingTextBn,
                      scrollingTextEn: tempScrollingTextEn
                    },
                    popupSettings: {
                      isPopupEnabled: tempPopupEnabled,
                      popupImageUrl: tempPopupImageUrl
                    }
                  }, null, 2)}
                  className="w-full text-xs font-mono p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-550"
                  onClick={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.select();
                  }}
                />
                <span className="text-[10px] text-slate-400 block font-mono">
                  💡 বক্সে ক্লিক করলেই সব লেখা একসাথে সিলেক্ট হয়ে যাবে। মাউসের রাইট ক্লিক করে অথবা Ctrl+C চেপে কপি করতে পারেন।
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Save / Reset Footer Triggers */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
        <button
          onClick={handleSave}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <Save className="w-5 h-5 animate-pulse" /> কাস্টমাইজেশন সেভ করুন
        </button>
        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-650 dark:border-slate-800 dark:hover:border-red-950 dark:text-slate-400 dark:hover:text-red-400 font-bold rounded-2xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> রিসেট করে ডিফল্ট করুন
        </button>
      </div>

    </div>
  );
}
