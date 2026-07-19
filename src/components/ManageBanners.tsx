import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AdBanner } from '../types';
import { Trash2, Plus, Upload, Link as LinkIcon, Edit, Eye, Sparkles, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage } from '../lib/utils';

export default function ManageBanners() {
  const { banners, updateBanner, addBanner, deleteBanner } = useApp();
  const { language } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Banner state template - simplified to only link and image, other fields are kept as empty strings for schema compatibility
  const initialNewBannerState: Omit<AdBanner, 'id'> = {
    badgeBn: '',
    badgeEn: '',
    titleBn: '',
    titleEn: '',
    descBn: '',
    descEn: '',
    buttonTextBn: '',
    buttonTextEn: '',
    link: 'https://',
    image: '',
    gradientFrom: 'indigo-500',
    gradientTo: 'purple-600',
    iconEmoji: '',
    secondaryEmoji: ''
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

  // File upload reader function with adaptive compression to strictly respect Firestore's 1MB document limit
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
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

    const toastId = toast.loading(language === 'bn' ? 'ছবি প্রসেস করা হচ্ছে...' : 'Processing image...');

    try {
      let maxWidth = 1920;
      let maxHeight = 1920;
      let quality = 0.8;
      let compressed = "";
      let success = false;

      // Adaptively compress image until the resulting base64 string is under the Firestore document limit (~1MB total document size, so base64 < 800KB or 800,000 chars is extremely safe)
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          compressed = await compressImage(file, maxWidth, maxHeight, quality);
          if (compressed.length < 800000) {
            success = true;
            break;
          }
        } catch (err) {
          console.error(`Compression attempt ${attempt} failed:`, err);
        }
        // Scale down size and quality for the next iteration to find a safe sweet spot
        maxWidth = Math.round(maxWidth * 0.7);
        maxHeight = Math.round(maxHeight * 0.7);
        quality = Math.max(0.4, quality - 0.15);
      }

      // If all trials failed or still too big, use a highly aggressive compact size fallback
      if (!success || compressed.length >= 800000) {
        compressed = await compressImage(file, 800, 800, 0.5);
      }

      if (isNew) {
        setNewBanner(prev => ({ ...prev, image: compressed }));
      } else {
        setEditingBanner(prev => prev ? { ...prev, image: compressed } : null);
      }
      toast.dismiss(toastId);
      toast.success(language === 'bn' ? 'ছবি সফলভাবে প্রসেস হয়েছে!' : 'Image processed successfully!');
    } catch (err) {
      console.error("Banner image compression failed completely:", err);
      toast.dismiss(toastId);
      toast.error(language === 'bn' ? 'ছবি প্রসেস করতে ব্যর্থ হয়েছে!' : 'Failed to process image!');
    }
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
        
        {(banners?.length || 0) < 1 && (
          <button
            onClick={() => setShowAddNew(!showAddNew)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all w-fit cursor-pointer"
          >
            {showAddNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddNew ? (language === 'bn' ? 'বন্ধ করুন' : 'Cancel') : (language === 'bn' ? 'নতুন ব্যানার যোগ করুন' : 'Add New Banner')}
          </button>
        )}
      </div>

      {/* New Banner Form */}
      {showAddNew && (
        <form onSubmit={handleAddNewSubmit} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            ✨ {language === 'bn' ? 'নতুন বিজ্ঞাপনের তথ্য' : 'New Advertisement Info'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="https://example.com/promo or /rentals"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Image Upload Supporting png, jpeg, jpg, gif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-slate-400" /> বিজ্ঞাপন ব্যানার ছবি (PNG, JPG, JPEG, GIF সমর্থিত)
                </label>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium mb-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 px-3.5 py-3 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-200 text-xs mb-1">
                    <span>💡</span> 
                    {language === 'bn' ? 'ব্যানার সাইজ নির্দেশিকা:' : 'Banner Size Guidelines:'}
                  </div>
                  <div>
                    • <strong>Width:</strong> 1000px
                  </div>
                  <div>
                    • <strong>Height:</strong> 400px
                  </div>
                  <div>
                    • <strong>{language === 'bn' ? 'সর্বোচ্চ ফটো সাইজ:' : 'Max Photo Size:'}</strong> 1 MB
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-4 bg-white dark:bg-slate-800 transition-all">
                    <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                      {newBanner.image ? (language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Image') : (language === 'bn' ? 'ছবি আপলোড করুন (সর্বোচ্চ ১ মেগাবাইট)' : 'Upload Image (Max 1MB)')}
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
          {(banners && banners.length > 0 ? [banners[0]] : []).map((banner, index) => {
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

                  {/* Simulated rendered real banner widget - Only displaying the image or fallback gradient placeholder */}
                  {currentEditingData.image ? (
                    <div className="relative rounded-3xl overflow-hidden shadow-md w-full bg-slate-50 dark:bg-slate-950/40 flex justify-center group">
                      <img 
                        src={currentEditingData.image} 
                        alt="Banner Preview" 
                        className="w-full h-auto max-h-[240px] object-contain" 
                      />
                      <div className="absolute top-2 right-3 bg-black/40 backdrop-blur-md text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full text-white/90 select-none border border-white/10">
                        {language === 'bn' ? 'বিজ্ঞাপন প্রিভিউ' : 'Ad Preview'}
                      </div>
                    </div>
                  ) : (
                    <div className={`relative rounded-3xl overflow-hidden shadow-md aspect-[16/6] w-full flex items-center justify-center text-white p-6 bg-gradient-to-r from-teal-500 to-emerald-600`}>
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto opacity-75 mb-1.5" />
                        <p className="text-xs font-bold">{language === 'bn' ? 'কোনো ব্যানার ছবি নেই' : 'No banner image'}</p>
                        <p className="text-[10px] opacity-75 mt-0.5">{language === 'bn' ? 'দয়া করে ছবি আপলোড করুন' : 'Please upload an image'}</p>
                      </div>
                    </div>
                  )}

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
                    <form onSubmit={handleEditSave} className="space-y-6">
                      {/* Redirect link input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> রিডাইরেক্ট লিংক (Link)
                        </label>
                        <input
                          type="text"
                          required
                          value={editingBanner.link}
                          onChange={e => updateEditingField({ link: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      {/* Image selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5 text-slate-400" /> বিজ্ঞাপন ব্যানার ছবি (PNG, JPG, JPEG, GIF সমর্থিত)
                        </label>
                        <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium mb-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 px-3.5 py-3 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 leading-relaxed space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-200 text-xs mb-1">
                            <span>💡</span> 
                            {language === 'bn' ? 'ব্যানার সাইজ নির্দেশিকা:' : 'Banner Size Guidelines:'}
                          </div>
                          <div>
                            • <strong>Width:</strong> 1000px
                          </div>
                          <div>
                            • <strong>Height:</strong> 400px
                          </div>
                          <div>
                            • <strong>{language === 'bn' ? 'সর্বোচ্চ ফটো সাইজ:' : 'Max Photo Size:'}</strong> 1 MB
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex-1 cursor-pointer flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 transition-all">
                            <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {editingBanner.image ? (language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Image') : (language === 'bn' ? 'ছবি আপলোড করুন (সর্বোচ্চ ১ মেগাবাইট)' : 'Upload Image (Max 1MB)')}
                            </span>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/gif"
                              className="sr-only"
                              onChange={e => handleFileUpload(e, false)}
                            />
                          </label>
                          {editingBanner.image && (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0">
                              <img src={editingBanner.image} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => updateEditingField({ image: '' })}
                                className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Explicit Save button at the bottom of the edit form */}
                      <div className="border-t border-slate-150 dark:border-slate-800 pt-4 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingBanner(null);
                          }}
                          className="px-4 py-2 border border-slate-200 rounded-xl text-xs hover:bg-slate-100 cursor-pointer text-slate-700 dark:text-slate-300"
                        >
                          {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-600/10 cursor-pointer"
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
