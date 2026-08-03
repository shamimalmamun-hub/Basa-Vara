import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GlobalSearch from './GlobalSearch';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { currentUser, logout, setSelectedLocation } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="relative z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0A0F1C]/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm dark:shadow-indigo-900/10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Brand Logo & Name */}
          <Link to="/" onClick={() => setSelectedLocation(null)} className="flex items-center space-x-1.5 xs:space-x-2 shrink min-w-0">
            <img src={t('customLogoImage') || "/logo.png?v=2"} alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg shrink-0" referrerPolicy="no-referrer" />
            <span className="font-extrabold text-xl xs:text-2xl sm:text-2xl md:text-xl tracking-tight text-slate-900 dark:text-white truncate">
              {t('brandName') !== 'brandName' ? t('brandName') : (
                language === 'bn' ? (
                  <>বাসা ভাড়া <span className="text-indigo-600 dark:text-indigo-400">ও হোম টিউটর</span></>
                ) : (
                  <>Rent & <span className="text-indigo-600 dark:text-indigo-400">Home Tutor</span></>
                )
              )}
            </span>
          </Link>

          {/* Desktop Search Bar Wrapper */}
          <div className="hidden md:flex flex-1 max-w-xs md:max-w-md lg:max-w-lg mx-3">
            <GlobalSearch mode="desktop" />
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center space-x-6 shrink-0">
            <Link 
              to="/rentals" 
              onClick={() => setSelectedLocation(null)}
              className="text-sm font-semibold text-slate-750 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t('navProperties')}
            </Link>
            <Link 
              to="/tutors" 
              onClick={() => setSelectedLocation(null)}
              className="text-sm font-semibold text-slate-750 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t('navTutors')}
            </Link>
            
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-slate-700">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {t('navDashboard')}
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer" title={t('navLogout')}>
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="px-4 py-2 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
                  {t('navLogin')}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Right Action Group: Search icon right next to Menu toggle button */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            <GlobalSearch mode="mobile" />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-5 space-y-2.5 overflow-hidden shadow-xl"
          >
            <Link 
              to="/rentals" 
              onClick={() => {
                setSelectedLocation(null);
                setIsMenuOpen(false);
              }} 
              className="block px-4 py-3 rounded-2xl text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {t('navProperties')}
            </Link>
            <Link 
              to="/tutors" 
              onClick={() => {
                setSelectedLocation(null);
                setIsMenuOpen(false);
              }} 
              className="block px-4 py-3 rounded-2xl text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {t('navTutors')}
            </Link>
            {currentUser ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all">
                  {t('navDashboard')}
                </Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} className="w-full text-left px-4 py-3 rounded-2xl text-base font-bold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                  {t('navLogout')}
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2.5 text-center rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/10">
                {t('navLogin')}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
