import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AdBanner } from '../types';
import { Trash2, Plus, Upload, Link as LinkIcon, Edit, Eye, Sparkles, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageBanners() {
  const { banners, updateBanner, addBanner, deleteBanner } = useApp();
  const { language } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Banner state template
  const initialNewBannerState: Omit<AdBanner, 'id'> = {
    badgeBn: 'নতুন স্পন্সর',
    badgeEn: 'Sponsored Banner',
    titleBn: 'আপনার আকর্ষণীয় শিরোনাম এখানে লিখুন',
    titleEn: 'Enter Your Eye-Catching Title Here',
    descBn: 'বিজ্ঞাপনের আকর্ষণীয় বিবরণ ও অফারের বিবরণ এখানে লিখুন।',
    descEn: 'Write your exciting promotional offer details and description here.',
    buttonTextBn: 'বিস্তারিত দেখুন',
    buttonTextEn: 'Learn More',
    link: 'https://',
    image: '',
    gradientFrom: 'indigo-500',
    gradientTo: 'purple-600',
    iconEmoji: '🎁',
    secondaryEmoji: '⚡'
  };

  const [newBanner, setNewBanner] = useState<Omit<AdBanner, 'id'>>(initialNewBannerState);

  // Start editing a banner
  const startEditing = (banner: AdBanner) => {
    setEditingId(banner.id);
    setEditingBanner({ ...banner });
  };

  // Update draft editing field
  const updateEditingField = (data: Partial<AdBanner>) => {
    setEditingBanner(prev => prev ? { ...prev, ...data } : null);
  };

  // File upload reader function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        language === 'bn' 
          ? 'শুধুমাত্র PNG, JPEG, JPG এবং GIF ফরম্যাটের ছবি আপলোড করা সম্ভব!' 
          : 'Only PNG, JPEG, JPG, and GIF images are allowed!'
      );
      return;
    }

    const maxSizeBytes = 3 * 1024 * 1024; // 3MB limit
    if (file.size > maxSizeBytes) {
      toast.error(
        language === 'bn' 
          ? 'ছবিটি ৩ মেগাবাইটের চেয়ে ছোট হতে হবে!' 
          : 'Image size must be less than 3MB!'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      if (isNew) {
        setNewBanner(prev => ({ ...prev, image: base64String }));
      } else {
        setEditingBanner(prev => prev ? { ...prev, image: base64String } : null);
      }
    };
    reader.onerror = () => {
      toast.error('Error reading file!');
    };
    reader.readAsDataURL(file);
  };

  // Pre-configured elegant gradients
  const GRADIENTS = [
    { from: 'teal-500', to: 'emerald-600', name: 'Teal & Emerald' },
    { from: 'rose-500', to: 'pink-600', name: 'Rose & Pink' },
    { from: 'indigo-500', to: 'purple-600', name: 'Indigo & Purple' },
    { from: 'amber-500', to: 'orange-600', name: 'Amber & Orange' },
    { from: 'slate-700', to: 'slate-900', name: 'Slate Dark' },
  ];

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.link || newBanner.link === 'https://') {
      toast.error(language === 'bn' ? 'দয়া করে একটি সঠিক রিডাইরেক্ট লিংক লিখুন' : 'Please provide a valid redirect link');
      return;
    }

    const id = 'banner_' + Date.now();
    addBanner({
      id,
      ...newBanner
    });

    toast.success(language === 'bn' ? 'নতুন ব্যানার সফলভাবে তৈরি করা হয়েছে!' : 'New banner created successfully!');
    setNewBanner(initialNewBannerState);
    setShowAddNew(false);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    if (!editingBanner.link || editingBanner.link === 'https://') {
      toast.error(language === 'bn' ? 'দয়া করে একটি সঠিক রিডাইরেক্ট লিংক লিখুন' : 'Please provide a valid redirect link');
      return;
    }

    updateBanner(editingBanner.id, editingBanner);
    setEditingId(null);
    setEditingBanner(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            {language === 'bn' ? 'বিজ্ঞাপন ও স্পন্সরড ব্যানার সেটিংস' : 'Ad & Sponsored Banner Settings'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn' 
              ? 'হোমপেজে প্রদর্শিত আকর্ষণীয় স্লাইড বিজ্ঞাপন, পার্টনার লিংক এবং অফার ব্যানারগুলি পরিচালনা করুন।' 
              : 'Manage eye-catching slider ads, sponsor links, and promo banners shown on the homepage.'}
          </p>
        </div>
        
        <button
          onClick={() => setShowAddNew(!showAddNew)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all w-fit cursor-pointer"
        >
          {showAddNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddNew ? (language === 'bn' ? 'বন্ধ করুন' : 'Cancel') : (language === 'bn' ? 'নতুন ব্যানার যোগ করুন' : 'Add New Banner')}
        </button>
      </div>

      {/* New Banner Form */}
      {showAddNew && (
        <form onSubmit={handleAddNewSubmit} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            ✨ {language === 'bn' ? 'নতুন বিজ্ঞাপনের তথ্য' : 'New Advertisement Info'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Badge Bangla & English */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ব্যাজ (বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={newBanner.badgeBn}
                    onChange={e => setNewBanner(prev => ({ ...prev, badgeBn: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Badge (English)</label>
                  <input
                    type="text"
                    required
                    value={newBanner.badgeEn}
                    onChange={e => setNewBanner(prev => ({ ...prev, badgeEn: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Title Bangla & English */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">শিরোনাম (বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={newBanner.titleBn}
                    onChange={e => setNewBanner(prev => ({ ...prev, titleBn: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={newBanner.titleEn}
                    onChange={e => setNewBanner(prev => ({ ...prev, titleEn: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Description Bangla & English */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">বিবরণ (বাংলা)</label>
                  <textarea
                    rows={2}
                    required
                    value={newBanner.descBn}
                    onChange={e => setNewBanner(prev => ({ ...prev, descBn: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description (English)</label>
                  <textarea
                    rows={2}
                    required
                    value={newBanner.descEn}
                    onChange={e => setNewBanner(prev => ({ ...prev, descEn: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Button Text & Links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">বোতামের লেখা (বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={newBanner.buttonTextBn}
                    onChange={e => setNewBanner(prev => ({ ...prev, buttonTextBn: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Button Text (English)</label>
                  <input
                    type="text"
                    required
                    value={newBanner.buttonTextEn}
                    onChange={e => setNewBanner(prev => ({ ...prev, buttonTextEn: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Redirect URL Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-slate-400" /> রিডাইরেক্ট লিংক (Link)
                </label>
                <input
                  type="text"
                  required
                  value={newBanner.link}
                  onChange={e => setNewBanner(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="https://example.com/promo or /rentals"
                />
              </div>

              {/* Image Upload Supporting png, jpeg, jpg, gif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-slate-400" /> বিজ্ঞাপন ব্যানার ছবি (png, jpeg, jpg, gif)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-4 bg-white dark:bg-slate-800 transition-all">
                    <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                      {newBanner.image ? (language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Image') : (language === 'bn' ? 'ছবি আপলোড করুন (৩ মেগাবাইট সর্বোচ্চ)' : 'Upload Image (Max 3MB)')}
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/gif"
                      className="sr-only"
                      onChange={e => handleFileUpload(e, true)}
                    />
                  </label>
                  
                  {newBanner.image && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0">
                      <img src={newBanner.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewBanner(prev => ({ ...prev, image: '' }))}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Gradients, emojis, etc. (Fallback if there is no uploaded image) */}
              {!newBanner.image && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold mb-1">ইমোজি ১</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newBanner.iconEmoji}
                      onChange={e => setNewBanner(prev => ({ ...prev, iconEmoji: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold mb-1">ইমোজি ২</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newBanner.secondaryEmoji}
                      onChange={e => setNewBanner(prev => ({ ...prev, secondaryEmoji: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold mb-1">ব্যাকগ্রাউন্ড গ্রাডিয়েন্ট</label>
                    <select
                      value={`${newBanner.gradientFrom}:${newBanner.gradientTo}`}
                      onChange={e => {
                        const [from, to] = e.target.value.split(':');
                        setNewBanner(prev => ({ ...prev, gradientFrom: from, gradientTo: to }));
                      }}
                      className="w-full text-xs px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border"
                    >
                      {GRADIENTS.map(g => (
                        <option key={g.name} value={`${g.from}:${g.to}`}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setNewBanner(initialNewBannerState);
                setShowAddNew(false);
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-600/10 cursor-pointer"
            >
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Banner'}
            </button>
          </div>
        </form>
      )}

      {/* List / Edit Screen containing Real-Time Interactive Previews */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {language === 'bn' ? 'সক্রিয় ব্যানার সমূহের তালিকা' : 'Active Banners List'} ({banners?.length || 0})
        </h3>

        <div className="grid grid-cols-1 gap-8">
          {(banners && banners.length > 0 ? banners : []).map((banner, index) => {
            const isEditing = editingId === banner.id;
            const currentEditingData = isEditing && editingBanner ? editingBanner : banner;
            const hasImage = !!currentEditingData.image;
            const previewBadge = language === 'bn' ? currentEditingData.badgeBn : currentEditingData.badgeEn;
            const previewTitle = language === 'bn' ? currentEditingData.titleBn : currentEditingData.titleEn;
            const previewDesc = language === 'bn' ? currentEditingData.descBn : currentEditingData.descEn;
            const previewBtnText = language === 'bn' ? currentEditingData.buttonTextBn : currentEditingData.buttonTextEn;

            return (
              <div 
                key={banner.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 hover:shadow-lg transition-transform duration-300"
              >
                {/* Visual Preview Side (ব্যানার কেমন দেখাবে) */}
                <div className="w-full lg:w-[45%] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {language === 'bn' ? 'হোমপেজ লাইভ প্রিভিউ' : 'Homepage Live Preview'}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-full font-mono font-bold">
                      Banner ID: {banner.id}
                    </span>
                  </div>

                  {/* Simulated rendered real banner widget */}
                  <div 
                    style={hasImage ? { backgroundImage: `url(${currentEditingData.image})` } : {}}
                    className={`relative rounded-3xl p-5 text-white overflow-hidden shadow-md flex flex-col justify-end min-h-[190px] w-full ${
                      hasImage 
                        ? 'bg-cover bg-center' 
                        : currentEditingData.gradientFrom && currentEditingData.gradientTo
                          ? `bg-gradient-to-r from-${currentEditingData.gradientFrom} to-${currentEditingData.gradientTo}`
                          : 'bg-gradient-to-r from-teal-500 to-emerald-600'
                    }`}
                  >
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    {hasImage && (
                      <div className="absolute inset-x-0 inset-y-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${currentEditingData.image})` }}></div>
                    )}
                    {hasImage && (
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/10 z-0"></div>
                    )}
                    
                    <div className="absolute top-2 right-3 bg-black/40 backdrop-blur-md text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full text-white/90 select-none border border-white/10">
                      {language === 'bn' ? 'বিজ্ঞাপন' : 'Ad'}
                    </div>

                    <div className="relative z-10">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded mb-1.5 inline-block">
                        {currentEditingData.iconEmoji || '🏡'} {previewBadge}
                      </span>
                      <h4 className="text-sm font-bold leading-tight mb-1 line-clamp-1">
                        {previewTitle}
                      </h4>
                      <p className="text-[10px] text-white/90 mb-3 leading-snug line-clamp-2 font-light">
                        {previewDesc}
                      </p>
                      <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white text-slate-900 pointer-events-none hover:translate-x-1 duration-200">
                        {previewBtnText} &rarr;
                      </button>
                    </div>

                    {!hasImage && (
                      <span className="absolute right-3 bottom-3 text-4xl opacity-80 z-10 select-none">
                        {currentEditingData.secondaryEmoji || '⚡'}
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null);
                          setEditingBanner(null);
                        } else {
                          startEditing(banner);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      {isEditing ? (language === 'bn' ? 'পুনর্বার বন্ধ করুন' : 'Collapse') : (language === 'bn' ? 'তথ্য পরিবর্তন করুন' : 'Edit Info')}
                    </button>

                    {deleteConfirmId === banner.id ? (
                      <div className="flex items-center gap-1.5 animate-fade-in">
                        <span className="text-[10px] text-red-500 font-bold">
                          {language === 'bn' ? 'নিশ্চিত?' : 'Confirm?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            deleteBanner(banner.id);
                            if (isEditing) {
                              setEditingId(null);
                              setEditingBanner(null);
                            }
                            setDeleteConfirmId(null);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1.5 rounded-xl cursor-pointer shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'হ্যাঁ' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all"
                        >
                          {language === 'bn' ? 'না' : 'No'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(banner.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Form side */}
                <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-150 dark:border-slate-800 lg:pl-6 pt-6 lg:pt-0">
                  {isEditing && editingBanner ? (
                    <form onSubmit={handleEditSave} className="space-y-4">
                      {/* Badge / Title language tabs and inputs online editable */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ব্যাজ (বাংলা)</label>
                          <input
                            type="text"
                            required
                            value={editingBanner.badgeBn}
                            onChange={e => updateEditingField({ badgeBn: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Badge (English)</label>
                          <input
                            type="text"
                            required
                            value={editingBanner.badgeEn}
                            onChange={e => updateEditingField({ badgeEn: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">শিরোনাম (বাংলা)</label>
                          <input
                            type="text"
                            required
                            value={editingBanner.titleBn}
                            onChange={e => updateEditingField({ titleBn: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Title (English)</label>
                          <input
                            type="text"
                            required
                            value={editingBanner.titleEn}
                            onChange={e => updateEditingField({ titleEn: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">বিজ্ঞাপন বিবরণ (বাংলা)</label>
                          <textarea
                            rows={2}
                            required
                            value={editingBanner.descBn}
                            onChange={e => updateEditingField({ descBn: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Description (English)</label>
                          <textarea
                            rows={2}
                            required
                            value={editingBanner.descEn}
                            onChange={e => updateEditingField({ descEn: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">বোতামের টেক্সট (বাংলা)</label>
                          <input
                            type="text"
                            required
                            value={editingBanner.buttonTextBn}
                            onChange={e => updateEditingField({ buttonTextBn: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Button Text (English)</label>
                          <input
                            type="text"
                            required
                            value={editingBanner.buttonTextEn}
                            onChange={e => updateEditingField({ buttonTextEn: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">রিডাইরেক্ট লিংক</label>
                          <input
                            type="text"
                            required
                            value={editingBanner.link}
                            onChange={e => updateEditingField({ link: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">নতুন ছবি দিন (png, jpeg, jpg, gif)</label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer flex items-center justify-center border border-dashed hover:border-indigo-500 rounded-xl p-1.5 bg-slate-50 dark:bg-slate-800">
                              <Upload className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                              <span className="text-[10px] text-slate-500">{language === 'bn' ? 'ছবি নির্বাচন' : 'Pick Image'}</span>
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/gif"
                                className="sr-only"
                                onChange={e => handleFileUpload(e, false)}
                              />
                            </label>
                            {hasImage && (
                              <button
                                type="button"
                                onClick={() => updateEditingField({ image: '' })}
                                className="px-2.5 py-1.5 bg-red-150 text-red-500 dark:bg-red-950/25 dark:text-red-400 hover:bg-red-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                                title={language === 'bn' ? 'ছবি ডিলিট করে ব্যানার গ্রাডিয়েন্ট ব্যবহার করুন' : 'Use background colors instead of image'}
                              >
                                {language === 'bn' ? 'ছবি মুছুন' : 'Remove Image'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* fallbacks for decoration gradient */}
                      {!hasImage && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ইমোজি ১</label>
                            <input
                              type="text"
                              value={editingBanner.iconEmoji || ''}
                              onChange={e => updateEditingField({ iconEmoji: e.target.value })}
                              className="w-full text-xs px-2 py-1 rounded border dark:bg-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ইমোজি ২</label>
                            <input
                              type="text"
                              value={editingBanner.secondaryEmoji || ''}
                              onChange={e => updateEditingField({ secondaryEmoji: e.target.value })}
                              className="w-full text-xs px-2 py-1 rounded border dark:bg-slate-800"
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">রঙের কম্বিনেশন</label>
                            <select
                              value={`${editingBanner.gradientFrom}:${editingBanner.gradientTo}`}
                              onChange={e => {
                                const [from, to] = e.target.value.split(':');
                                updateEditingField({ gradientFrom: from, gradientTo: to });
                              }}
                              className="w-full text-xs px-1.5 py-1 rounded border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                            >
                              {GRADIENTS.map(g => (
                                <option key={g.name} value={`${g.from}:${g.to}`}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Explicit Save button at the bottom of the edit form */}
                      <div className="border-t border-slate-150 dark:border-slate-800 pt-3 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingBanner(null);
                          }}
                          className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs hover:bg-slate-100 cursor-pointer text-slate-700 dark:text-slate-305"
                        >
                          {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-600/10 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400 border border-dashed border-slate-150 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-900/40">
                      <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? 'তথ্য পরিবর্তন করতে "তথ্য পরিবর্তন করুন" বাটনে ক্লিক করুন।' : 'Click "Edit Info" to modify banner captions, links, or image.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
