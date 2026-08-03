import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, X, Home, GraduationCap, MapPin, ChevronRight, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarSearchProps {
  className?: string;
  onSelectResult?: () => void;
}

export default function GlobalSearch({ className = '', onSelectResult }: NavbarSearchProps) {
  const { properties, tutors, setSelectedLocation } = useApp();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
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

  // Search Properties
  const matchingProperties = React.useMemo(() => {
    if (!query) return [];
    return properties.filter(p => {
      const title = (p.title || '').toLowerCase();
      const loc = (p.location || '').toLowerCase();
      const addr = (p.address || '').toLowerCase();
      const typeStr = Array.isArray(p.type) ? p.type.join(' ').toLowerCase() : (p.type || '').toLowerCase();

      return title.includes(query) || loc.includes(query) || addr.includes(query) || typeStr.includes(query);
    }).slice(0, 5);
  }, [properties, query]);

  // Search Tutors
  const matchingTutors = React.useMemo(() => {
    if (!query) return [];
    return tutors.filter(t => {
      const name = (t.name || '').toLowerCase();
      const subjects = (t.subjects || []).join(' ').toLowerCase();
      const edu = (t.education || '').toLowerCase();
      const loc = (t.location || '').toLowerCase();

      return name.includes(query) || subjects.includes(query) || edu.includes(query) || loc.includes(query);
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
    if (onSelectResult) onSelectResult();
  };

  const handleTutorClick = (location: string) => {
    if (location) {
      setSelectedLocation(location);
    }
    navigate('/tutors');
    setSearchQuery('');
    setIsFocused(false);
    if (onSelectResult) onSelectResult();
  };

  const handlePageClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsFocused(false);
    if (onSelectResult) onSelectResult();
  };

  const showDropdown = isFocused && searchQuery.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Inline Input Box directly inside Navbar */}
      <div className={`flex items-center w-full px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border ${isFocused ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-700/60'} transition-all shadow-inner`}>
        <Search className="w-4 h-4 text-indigo-500 shrink-0 mr-2" />
        <input
          ref={inputRef}
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
              inputRef.current?.focus();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Inline Dropdown Menu directly attached under the input field */}
      <AnimatePresence>
        {showDropdown && (
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
                {/* Rentals Header & Items */}
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

                {/* Tutors Header & Items */}
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

                {/* Pages */}
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
    </div>
  );
}
