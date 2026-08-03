import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Property, Tutor } from '../types';
import { 
  Search, 
  X, 
  Home, 
  GraduationCap, 
  Megaphone, 
  Compass, 
  MapPin, 
  Phone, 
  BookOpen, 
  ChevronRight, 
  LockKeyhole, 
  MessageCircle, 
  Clock, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalSearchProps {
  isOpen?: boolean;
  onClose?: () => void;
  inlineNav?: boolean;
}

export default function GlobalSearch({ isOpen: externalIsOpen, onClose: externalOnClose, inlineNav = false }: GlobalSearchProps) {
  const { properties, tutors, scrollingTextBn, scrollingTextEn, banners, currentUser, setSelectedLocation } = useApp();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'rentals' | 'tutors' | 'notices' | 'pages'>('all');
  
  // Selected detail modal item
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setSearchQuery('');
    setSelectedProperty(null);
    setSelectedTutor(null);
  };

  // Keyboard shortcut listener (Cmd+K, Ctrl+K, or '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setInternalIsOpen(prev => !prev);
        if (!isOpen) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      } else if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const query = searchQuery.trim().toLowerCase();

  // 1. Search Properties
  const matchingProperties = React.useMemo(() => {
    if (!query) return [];
    return properties.filter(p => {
      const title = (p.title || '').toLowerCase();
      const loc = (p.location || '').toLowerCase();
      const addr = (p.address || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const rentStr = p.price ? p.price.toString() : '';
      const phone = (p.contactNumber || '').toLowerCase();
      const ownerPhone = (p.ownerPhoneNumber || '').toLowerCase();
      const typesStr = Array.isArray(p.type) ? p.type.join(' ').toLowerCase() : (p.type || '').toLowerCase();

      return (
        title.includes(query) ||
        loc.includes(query) ||
        addr.includes(query) ||
        desc.includes(query) ||
        rentStr.includes(query) ||
        phone.includes(query) ||
        ownerPhone.includes(query) ||
        typesStr.includes(query)
      );
    });
  }, [properties, query]);

  // 2. Search Tutors
  const matchingTutors = React.useMemo(() => {
    if (!query) return [];
    return tutors.filter(tutor => {
      const name = (tutor.name || '').toLowerCase();
      const subjects = (tutor.subjects || []).join(' ').toLowerCase();
      const edu = (tutor.education || '').toLowerCase();
      const loc = (tutor.location || '').toLowerCase();
      const days = (tutor.availableDays || []).join(' ').toLowerCase();
      const exp = (tutor.experience || '').toLowerCase();
      const salStr = tutor.salaryExpected ? tutor.salaryExpected.toString() : '';
      const phone = (tutor.contactNumber || tutor.phoneNumber || '').toLowerCase();

      return (
        name.includes(query) ||
        subjects.includes(query) ||
        edu.includes(query) ||
        loc.includes(query) ||
        days.includes(query) ||
        exp.includes(query) ||
        salStr.includes(query) ||
        phone.includes(query)
      );
    });
  }, [tutors, query]);

  // 3. Search Notices / Announcements / Banners
  const matchingNotices = React.useMemo(() => {
    if (!query) return [];
    const results: { id: string; title: string; content: string; type: 'ticker' | 'banner' }[] = [];

    const tickerText = language === 'bn' ? scrollingTextBn : scrollingTextEn;
    if (tickerText && tickerText.toLowerCase().includes(query)) {
      results.push({
        id: 'notice-ticker',
        title: language === 'bn' ? 'জরুরি নোটিশ / ঘোষণা' : 'Urgent Notice / Announcement',
        content: tickerText,
        type: 'ticker'
      });
    }

    (banners || []).forEach(b => {
      const bTitle = (b.title || '').toLowerCase();
      const bSub = (b.subtitle || '').toLowerCase();
      if (bTitle.includes(query) || bSub.includes(query)) {
        results.push({
          id: b.id,
          title: b.title,
          content: b.subtitle,
          type: 'banner'
        });
      }
    });

    return results;
  }, [scrollingTextBn, scrollingTextEn, banners, query, language]);

  // 4. Search Static Pages & Actions
  const staticPages = React.useMemo(() => [
    {
      id: 'page-rentals',
      title: language === 'bn' ? 'সকল বাসা ভাড়া তালিকা' : 'All Rental Listings',
      description: language === 'bn' ? 'ফ্যামিলি ফ্ল্যাট, ছাত্র মেস ও ব্যাচেলর সাবলেট খুঁজুন' : 'Find family flats, student messes & bachelor sublets',
      path: '/rentals',
      icon: Home,
      category: 'বাসা ভাড়া'
    },
    {
      id: 'page-tutors',
      title: language === 'bn' ? 'হোম টিউটর খুঁজুন' : 'Find Home Tutors',
      description: language === 'bn' ? 'অভিজ্ঞ গৃহশিক্ষক ও টিউটর টিচার খুঁজুন' : 'Find experienced home tutors & teachers',
      path: '/tutors',
      icon: GraduationCap,
      category: 'হোম টিউটর'
    },
    {
      id: 'page-dashboard',
      title: language === 'bn' ? 'আমার ড্যাশবোর্ড' : 'User Dashboard',
      description: language === 'bn' ? 'আপনার পোস্ট, সাবস্ক্রিপশন ও প্রোফাইল পরিচালনা করুন' : 'Manage your posts, subscription & profile',
      path: '/dashboard',
      icon: Compass,
      category: 'ড্যাশবোর্ড'
    },
    {
      id: 'page-login',
      title: language === 'bn' ? 'লগইন ও সাইনআপ' : 'Login & Register',
      description: language === 'bn' ? 'বাসা ভাড়া ও টিউটর সার্ভিস পেতে সাইনআপ করুন' : 'Sign in or register to access details',
      path: '/login',
      icon: Sparkles,
      category: 'একাউন্ট'
    },
    {
      id: 'page-admin',
      title: language === 'bn' ? 'এডমিন লগইন' : 'Admin Login',
      description: language === 'bn' ? 'সিস্টেম এডমিনিস্ট্রেটর সিকিউর পোর্টাল' : 'System administrator portal',
      path: '/admin',
      icon: LockKeyhole,
      category: 'এডমিন'
    }
  ], [language]);

  const matchingPages = React.useMemo(() => {
    if (!query) return [];
    return staticPages.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }, [staticPages, query]);

  const totalResults = matchingProperties.length + matchingTutors.length + matchingNotices.length + matchingPages.length;

  const handleNavigate = (path: string, locationFilter?: string) => {
    if (locationFilter) {
      setSelectedLocation(locationFilter);
    }
    navigate(path);
    handleClose();
  };

  const isSubscribed = currentUser?.subscriptionEnd ? new Date(currentUser.subscriptionEnd) > new Date() : false;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      {/* Inline Search Bar Trigger for Navbar */}
      {inlineNav && (
        <div className="relative flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2 md:mx-4">
          <button
            type="button"
            onClick={() => {
              setInternalIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs font-semibold transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">
                {language === 'bn' ? 'বাসা, টিউটর, এলাকা লিখে সার্চ...' : 'Search rentals, tutors, areas...'}
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Full Modal Command Palette */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 px-3 sm:px-4 pb-6 overflow-y-auto">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            />

            {/* Search Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Top Search Input Box */}
              <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80">
                <Search className="w-5 h-5 text-indigo-500 shrink-0 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'ওয়েবসাইটের যেকোনো কিছু লিখে খুঁজুন (যেমন: ঢাকা, পদার্থবিজ্ঞান, ফ্যামিলি, ৩০০০)...' : 'Search anything (e.g., Mymensingh, Physics, Family, 3000)...'}
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-sm sm:text-base font-semibold focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  Esc
                </button>
              </div>

              {/* Category Filters Bar */}
              {query && (
                <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                      activeCategory === 'all'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {language === 'bn' ? `সবগুলো (${totalResults})` : `All (${totalResults})`}
                  </button>
                  <button
                    onClick={() => setActiveCategory('rentals')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                      activeCategory === 'rentals'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    🏠 {language === 'bn' ? `বাসা ভাড়া (${matchingProperties.length})` : `Rentals (${matchingProperties.length})`}
                  </button>
                  <button
                    onClick={() => setActiveCategory('tutors')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                      activeCategory === 'tutors'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    👨‍🏫 {language === 'bn' ? `হোম টিউটর (${matchingTutors.length})` : `Tutors (${matchingTutors.length})`}
                  </button>
                  {matchingNotices.length > 0 && (
                    <button
                      onClick={() => setActiveCategory('notices')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                        activeCategory === 'notices'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      📢 {language === 'bn' ? `নোটিশ (${matchingNotices.length})` : `Notices (${matchingNotices.length})`}
                    </button>
                  )}
                  {matchingPages.length > 0 && (
                    <button
                      onClick={() => setActiveCategory('pages')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                        activeCategory === 'pages'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      🔗 {language === 'bn' ? `পেইজ (${matchingPages.length})` : `Pages (${matchingPages.length})`}
                    </button>
                  )}
                </div>
              )}

              {/* Search Results Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {!query ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                      <Search className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {language === 'bn' ? 'ওয়েবসাইটের যেকোনো তথ্য খুঁজুন' : 'Search Website Content'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                        {language === 'bn' 
                          ? 'বাসা ভাড়া, ফ্যামিলি ফ্ল্যাট, ছাত্র মেস, গৃহশিক্ষক, বিষয়, এলাকা বা অফার লিখে সার্চ টাইপ করুন।' 
                          : 'Type any keyword to search rentals, tutors, subjects, locations, or special notices.'}
                      </p>
                    </div>

                    {/* Quick Suggestion Tags */}
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {language === 'bn' ? 'জনপ্রিয় সার্চসমূহ:' : 'Popular Searches:'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['ময়মনসিংহ সদর', 'ফ্যামিলি ফ্ল্যাট', 'গণিত', 'পদার্থবিজ্ঞান', 'ছাত্র মেস', 'ঢাকা'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800/80 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
                          >
                            🔍 {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : totalResults === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-4xl">🔍</p>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No Results Found'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      {language === 'bn'
                        ? 'দয়া করে অন্য কোনো বিষয়, বাসাভাড়ার এলাকা বা কিওয়ার্ড লিখে আবার চেষ্টা করুন।'
                        : 'Please try searching with another keyword, location, or subject name.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: PROPERTIES (বাসা ভাড়া) */}
                    {(activeCategory === 'all' || activeCategory === 'rentals') && matchingProperties.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <Home className="w-4 h-4" />
                            <span>{language === 'bn' ? 'বাসা ভাড়া তালিকা' : 'Rental Listings'}</span>
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full text-indigo-700 dark:text-indigo-300">
                              {matchingProperties.length}
                            </span>
                          </h3>
                          <button
                            onClick={() => handleNavigate('/rentals')}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {matchingProperties.map(property => (
                            <div
                              key={property.id}
                              onClick={() => setSelectedProperty(property)}
                              className="group p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-all cursor-pointer flex gap-3 items-center hover:shadow-md"
                            >
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 relative">
                                <img
                                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'}
                                  alt={property.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                                {property.isAvailable === false && (
                                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-[9px] font-black text-rose-400">
                                    Rented
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {property.title}
                                </h4>
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span>{property.location}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-xs font-black text-indigo-650 dark:text-indigo-400">
                                    ৳{property.price?.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold truncate">
                                    {Array.isArray(property.type) ? property.type[0] : property.type}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: TUTORS (হোম টিউটর) */}
                    {(activeCategory === 'all' || activeCategory === 'tutors') && matchingTutors.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4" />
                            <span>{language === 'bn' ? 'হোম টিউটর তালিকা' : 'Home Tutors'}</span>
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full text-indigo-700 dark:text-indigo-300">
                              {matchingTutors.length}
                            </span>
                          </h3>
                          <button
                            onClick={() => handleNavigate('/tutors')}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {matchingTutors.map(tutor => (
                            <div
                              key={tutor.id}
                              onClick={() => setSelectedTutor(tutor)}
                              className="group p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-all cursor-pointer flex gap-3 items-center hover:shadow-md"
                            >
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 dark:bg-slate-700 shrink-0 border border-indigo-200 dark:border-indigo-900/50">
                                <img
                                  src={tutor.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'}
                                  alt={tutor.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {tutor.name}
                                  </h4>
                                  {tutor.isVerified && (
                                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-extrabold px-1.5 py-0.2 rounded-md shrink-0">
                                      ✓ Verified
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {tutor.education}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  {(tutor.subjects || []).slice(0, 2).map(sub => (
                                    <span key={sub} className="text-[9.5px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold">
                                      {sub}
                                    </span>
                                  ))}
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 ml-auto">
                                    ৳{tutor.salaryExpected?.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 3: NOTICES & ANNOUNCEMENTS */}
                    {(activeCategory === 'all' || activeCategory === 'notices') && matchingNotices.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4" />
                          <span>{language === 'bn' ? 'জরুরি নোটিশ ও বিশেষ অফার' : 'Notices & Offers'}</span>
                        </h3>
                        <div className="space-y-2">
                          {matchingNotices.map(notice => (
                            <div
                              key={notice.id}
                              className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1"
                            >
                              <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                <span>{notice.title}</span>
                              </p>
                              <p className="text-slate-700 dark:text-slate-300 font-medium">
                                {notice.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 4: PAGES & LINKS */}
                    {(activeCategory === 'all' || activeCategory === 'pages') && matchingPages.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Compass className="w-4 h-4" />
                          <span>{language === 'bn' ? 'ওয়েবসাইট পেইজ লিংক' : 'Navigation Pages'}</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {matchingPages.map(page => {
                            const IconComponent = page.icon;
                            return (
                              <button
                                key={page.id}
                                onClick={() => handleNavigate(page.path)}
                                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 transition-all cursor-pointer flex items-center gap-3 group"
                              >
                                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0">
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {page.title}
                                  </p>
                                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                                    {page.description}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Footer Tip */}
              <div className="px-4 sm:px-6 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  💡 <span className="font-semibold">{language === 'bn' ? 'টিপস: যেকোনো সময় Ctrl+K চাপলে সার্চ ওপেন হবে।' : 'Tip: Press Ctrl+K anytime to open search.'}</span>
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  Basavara Search v2.0
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Property Detail Preview Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProperty(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden shrink-0">
                <img
                  src={selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute top-3 left-3 bg-violet-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  {Array.isArray(selectedProperty.type) ? selectedProperty.type.join(', ') : selectedProperty.type}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-sm font-black px-3 py-1 rounded-full shadow">
                  ৳{selectedProperty.price?.toLocaleString('en-IN')}/মাস
                </div>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {selectedProperty.title}
                  </h3>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedProperty.location}</span>
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="font-bold text-slate-900 dark:text-white mb-1">বিবরণ / বিবরণী:</p>
                  {selectedProperty.description}
                </div>

                {/* Contact info or subscribe prompt */}
                {(isAdmin || currentUser?.id === selectedProperty.ownerId || isSubscribed) ? (
                  <div className="space-y-2 bg-indigo-50/80 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50">
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">ঠিকানা ও যোগাযোগ:</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{selectedProperty.address}</span>
                    </p>
                    {selectedProperty.contactNumber && (
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>ফোন: <a href={`tel:${selectedProperty.contactNumber}`} className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">{selectedProperty.contactNumber}</a></span>
                      </p>
                    )}
                    {selectedProperty.ownerPhoneNumber && (
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>মালিক: <a href={`tel:${selectedProperty.ownerPhoneNumber}`} className="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline">{selectedProperty.ownerPhoneNumber}</a></span>
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedProperty(null);
                      handleNavigate(currentUser ? '/dashboard' : '/login');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    <LockKeyhole className="w-4 h-4" />
                    <span>সাবস্ক্রাইব করে ফুল কন্টাক্ট ইনফো দেখুন</span>
                  </button>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() => {
                    setSelectedProperty(null);
                    handleNavigate('/rentals', selectedProperty.location);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  বাসা ভাড়া পেইজে দেখুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tutor Detail Preview Modal */}
      <AnimatePresence>
        {selectedTutor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTutor(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 dark:bg-slate-800 shrink-0 border-2 border-indigo-500">
                  <img
                    src={selectedTutor.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'}
                    alt={selectedTutor.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                      {selectedTutor.name}
                    </h3>
                    {selectedTutor.isVerified && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-md shrink-0">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                    {selectedTutor.education}
                  </p>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedTutor.location}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTutor(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">পড়ানো বিষয়সমূহ:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedTutor.subjects || []).map(sub => (
                      <span key={sub} className="px-2.5 py-1 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-900/50">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">পড়ানোর সময় / দিন:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedTutor.availableTime || 'আলোচনা সাপেক্ষে'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">প্রত্যাশিত বেতন:</span>
                    <span className="font-extrabold text-indigo-650 dark:text-indigo-400">৳{selectedTutor.salaryExpected?.toLocaleString('en-IN')}/মাস</span>
                  </div>
                </div>

                {/* Contact details */}
                {(isAdmin || currentUser?.id === selectedTutor.userId || isSubscribed) ? (
                  <div className="space-y-2 bg-indigo-50/80 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50">
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">কন্টাক্ট নম্বর:</p>
                    {(selectedTutor.contactNumber || selectedTutor.phoneNumber) && (
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>ফোন: <a href={`tel:${selectedTutor.contactNumber || selectedTutor.phoneNumber}`} className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">{selectedTutor.contactNumber || selectedTutor.phoneNumber}</a></span>
                      </p>
                    )}
                    {selectedTutor.whatsappNumber && (
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>হোয়াটসঅ্যাপ: <a href={`https://wa.me/${selectedTutor.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline">{selectedTutor.whatsappNumber}</a></span>
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedTutor(null);
                      handleNavigate(currentUser ? '/dashboard' : '/login');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    <LockKeyhole className="w-4 h-4" />
                    <span>সাবস্ক্রাইব করে কন্টাক্ট নম্বর দেখুন</span>
                  </button>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedTutor(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() => {
                    setSelectedTutor(null);
                    handleNavigate('/tutors', selectedTutor.location);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  হোম টিউটর পেইজে দেখুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
