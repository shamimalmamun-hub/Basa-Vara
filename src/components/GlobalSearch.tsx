import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, X, Home, GraduationCap, MapPin, ChevronRight, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarSearchProps {
  className?: string;
  onSelectResult?: () => void;
  mode?: 'auto' | 'mobile' | 'desktop';
}

export default function GlobalSearch({ className = '', onSelectResult, mode = 'auto' }: NavbarSearchProps) {
  const { properties, tutors, setSelectedLocation } = useApp();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && isMobileModalOpen && mode === 'auto') {
        setIsMobileModalOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobileModalOpen, mode]);

  // Focus mobile input when mobile modal opens and lock background body scroll
  useEffect(() => {
    if (isMobileModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileModalOpen]);

  // Close dropdown when clicking outside on desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  // Helper to build searchable text for properties including Bengali synonyms
  const getPropertySearchText = (p: any) => {
    const title = (p.title || '').toLowerCase();
    const loc = (p.location || '').toLowerCase();
    const addr = (p.address || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const types = Array.isArray(p.type) ? p.type : [p.type || ''];
    const typeStr = types.join(' ').toLowerCase();

    let synonyms = '';
    if (typeStr.includes('female mess') || typeStr.includes('female') || title.includes('female') || title.includes('ছাত্রী')) {
      synonyms += ' ছাত্রী মেস ছাত্রীমেস মেস ফিমেল মেস মেয়েদের মেস female mess ';
    }
    if (typeStr.includes('male mess') || typeStr.includes('male') || title.includes('male') || title.includes('ছাত্র')) {
      synonyms += ' ছাত্র মেস ছাত্রমেস মেস মেল মেস ছেলেদের মেস male mess ';
    }
    if (typeStr.includes('family') || title.includes('family') || title.includes('ফ্যামিলি')) {
      synonyms += ' ফ্যামিলি বাসা ফ্যামিলি ফ্ল্যাট পরিবার ফেমিলি family flat ';
    }
    if (typeStr.includes('bachelor') || title.includes('bachelor') || title.includes('ব্যাচেলর')) {
      synonyms += ' ব্যাচেলর বাসা ব্যাচেলর মেস সাবলেট bachelor flat ';
    }

    return `${title} ${loc} ${addr} ${desc} ${typeStr} ${synonyms}`;
  };

  // Helper to build searchable text for tutors including Bengali synonyms
  const getTutorSearchText = (t: any) => {
    const name = (t.name || '').toLowerCase();
    const subjects = (t.subjects || []).join(' ').toLowerCase();
    const edu = (t.education || '').toLowerCase();
    const loc = (t.location || '').toLowerCase();
    const gender = (t.gender || '').toLowerCase();

    let synonyms = '';
    if (gender === 'female' || name.includes('মিস') || name.includes('মেহেজাবিন') || name.includes('সারিকা')) {
      synonyms += ' ছাত্রী টিউটর মহিলা টিউটর ফিমেল female ';
    } else if (gender === 'male') {
      synonyms += ' ছাত্র টিউটর পুরুষ টিউটর মেল male ';
    }

    return `${name} ${subjects} ${edu} ${loc} ${synonyms} টিউটর টিউশন home tutor`;
  };

  // Search Properties
  const matchingProperties = React.useMemo(() => {
    if (!query) return [];
    const tokens = query.split(/\s+/).filter(Boolean);

    return properties.filter(p => {
      const text = getPropertySearchText(p);
      if (text.includes(query)) return true;
      if (tokens.length > 1 && tokens.every(token => text.includes(token))) return true;
      if (tokens.length === 1 && tokens.some(token => text.includes(token))) return true;
      return false;
    }).slice(0, 5);
  }, [properties, query]);

  // Search Tutors
  const matchingTutors = React.useMemo(() => {
    if (!query) return [];
    const tokens = query.split(/\s+/).filter(Boolean);

    return tutors.filter(t => {
      const text = getTutorSearchText(t);
      if (text.includes(query)) return true;
      if (tokens.length > 1 && tokens.every(token => text.includes(token))) return true;
      if (tokens.length === 1 && tokens.some(token => text.includes(token))) return true;
      return false;
    }).slice(0, 5);
  }, [tutors, query]);

  // Quick navigation pages
  const staticPages = React.useMemo(() => [
    {
      id: 'page-rentals',
      title: language === 'bn' ? 'বাসা ভাড়া পেইজ' : 'Rentals Page',
      path: '/rentals',
      icon: Home
    },
    {
      id: 'page-tutors',
      title: language === 'bn' ? 'হোম টিউটর পেইজ' : 'Home Tutors Page',
      path: '/tutors',
      icon: GraduationCap
    }
  ], [language]);

  const matchingPages = React.useMemo(() => {
    if (!query) return [];
    return staticPages.filter(p => p.title.toLowerCase().includes(query));
  }, [staticPages, query]);

  const totalResults = matchingProperties.length + matchingTutors.length + matchingPages.length;

  const handlePropertyClick = (location: string) => {
    if (location) {
      setSelectedLocation(location);
    }
    navigate('/rentals');
    setSearchQuery('');
    setIsFocused(false);
    setIsMobileModalOpen(false);
    if (onSelectResult) onSelectResult();
  };

  const handleTutorClick = (location: string) => {
    if (location) {
      setSelectedLocation(location);
    }
    navigate('/tutors');
    setSearchQuery('');
    setIsFocused(false);
    setIsMobileModalOpen(false);
    if (onSelectResult) onSelectResult();
  };

  const handlePageClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsFocused(false);
    setIsMobileModalOpen(false);
    if (onSelectResult) onSelectResult();
  };

  const shouldRenderMobile = mode === 'mobile' || (mode === 'auto' && isMobile);
  const showDesktopDropdown = isFocused && searchQuery.trim().length > 0 && !shouldRenderMobile;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* TRIGGER BUTTON (Mobile) vs INLINE INPUT (Desktop) */}
      {shouldRenderMobile ? (
        <button
          type="button"
          onClick={() => setIsMobileModalOpen(true)}
          className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        /* DESKTOP INLINE INPUT BAR */
        <div className={`flex items-center w-full px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border ${isFocused ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-700/60'} transition-all shadow-inner`}>
          <Search className="w-4 h-4 text-indigo-500 shrink-0 mr-2" />
          <input
            ref={desktopInputRef}
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (!isFocused) setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={language === 'bn' ? 'বাসা, টিউটর, এলাকা লিখে সার্চ করুন...' : 'Search rentals, tutors, locations...'}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-semibold focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                desktopInputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* DESKTOP DROPDOWN MENU */}
      <AnimatePresence>
        {showDesktopDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl overflow-hidden z-[100] max-h-80 overflow-y-auto p-2"
          >
            {totalResults === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching results found'}
              </div>
            ) : (
              <div className="space-y-1">
                {matchingProperties.length > 0 && (
                  <div>
                    <div className="px-2.5 py-1 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      <span>{language === 'bn' ? 'বাসা ভাড়া' : 'Rentals'} ({matchingProperties.length})</span>
                    </div>
                    {matchingProperties.map(property => (
                      <div
                        key={property.id}
                        onClick={() => handlePropertyClick(property.location)}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {property.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{property.location}</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">
                              ৳{property.price?.toLocaleString('en-IN')}
                            </span>
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                {matchingTutors.length > 0 && (
                  <div className="pt-1">
                    <div className="px-2.5 py-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      <span>{language === 'bn' ? 'হোম টিউটর' : 'Tutors'} ({matchingTutors.length})</span>
                    </div>
                    {matchingTutors.map(tutor => (
                      <div
                        key={tutor.id}
                        onClick={() => handleTutorClick(tutor.location)}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {tutor.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {(tutor.subjects || []).join(', ')} • {tutor.location}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                {matchingPages.length > 0 && (
                  <div className="pt-1">
                    {matchingPages.map(page => (
                      <div
                        key={page.id}
                        onClick={() => handlePageClick(page.path)}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {page.title}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE POP-UP SEARCH MODAL VIA PORTAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isMobileModalOpen && (
            <motion.div
              key="mobile-search-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileModalOpen(false)}
              className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-start p-3 pt-12 sm:pt-16"
            >
              <motion.div
                key="mobile-search-modal-card"
                initial={{ scale: 0.95, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col w-full max-w-xs xs:max-w-sm mx-auto"
              >
                {/* Modal Top Search Input */}
                <div className="p-2 sm:p-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center flex-1 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-sm min-w-0">
                    <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mr-1.5" />
                    <input
                      ref={mobileInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={language === 'bn' ? 'বাসা, টিউটর বা এলাকা খুঁজুন...' : 'Search rentals or tutors...'}
                      className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-[11px] font-medium focus:outline-none truncate"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          mobileInputRef.current?.focus();
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileModalOpen(false)}
                    className="px-3 py-1.5 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                </div>

                {/* Modal Body / Results */}
                <div className="p-2.5 sm:p-3 overflow-y-auto max-h-[60vh] space-y-2">
                  {!query ? (
                    <div className="py-2 px-1 text-center space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? 'কী খুঁজতে চান?' : 'Quick Search'}
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handlePageClick('/rentals')}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Home className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{language === 'bn' ? 'বাসা ভাড়া' : 'Rentals'}</span>
                        </button>
                        <button
                          onClick={() => handlePageClick('/tutors')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{language === 'bn' ? 'হোম টিউটর' : 'Tutors'}</span>
                        </button>
                      </div>
                    </div>
                  ) : totalResults === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                      {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching results found'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Rentals */}
                      {matchingProperties.length > 0 && (
                        <div>
                          <div className="px-1 py-0.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                            <Home className="w-3 h-3" />
                            <span>{language === 'bn' ? 'বাসা ভাড়া' : 'Rentals'}</span>
                          </div>
                          <div className="space-y-1">
                            {matchingProperties.slice(0, 2).map(property => (
                              <div
                                key={property.id}
                                onClick={() => handlePropertyClick(property.location)}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    {property.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                    <span>{property.location}</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">
                                      ৳{property.price?.toLocaleString('en-IN')}
                                    </span>
                                  </p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tutors */}
                      {matchingTutors.length > 0 && (
                        <div>
                          <div className="px-1 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                            <GraduationCap className="w-3 h-3" />
                            <span>{language === 'bn' ? 'হোম টিউটর' : 'Tutors'}</span>
                          </div>
                          <div className="space-y-1">
                            {matchingTutors.slice(0, 2).map(tutor => (
                              <div
                                key={tutor.id}
                                onClick={() => handleTutorClick(tutor.location)}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    {tutor.name}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {(tutor.subjects || []).join(', ')} • {tutor.location}
                                  </p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Static Pages */}
                      {matchingPages.length > 0 && (
                        <div className="space-y-1">
                          {matchingPages.slice(0, 1).map(page => (
                            <div
                              key={page.id}
                              onClick={() => handlePageClick(page.path)}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                  {page.title}
                                </span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
