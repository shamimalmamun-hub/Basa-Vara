import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { Home, LogOut, Menu, X, Languages, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { currentUser, logout, setSelectedLocation } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLangOpen, setIsLangOpen] = React.useState(false);

  return (
    <nav className="w-full backdrop-blur-xl bg-white/70 dark:bg-[#0A0F1C]/70 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm dark:shadow-indigo-900/10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={() => setSelectedLocation(null)} className="flex items-center space-x-2.5">
            <img src={t('customLogoImage') || "/logo.png?v=2"} alt="Logo" className="w-8 h-8 object-contain rounded-lg" referrerPolicy="no-referrer" />
            <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white">
              {t('brandName') !== 'brandName' ? t('brandName') : (
                language === 'bn' ? (
                  <>বাসা ভাড়া <span className="text-indigo-600 dark:text-indigo-400">ও হোম টিউটর</span></>
                ) : (
                  <>Rent & <span className="text-indigo-600 dark:text-indigo-400">Home Tutor</span></>
                )
              )}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              onClick={() => setSelectedLocation(null)}
              className="text-sm font-semibold text-slate-750 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t('navProperties')}
            </Link>
            <Link 
              to="/" 
              onClick={() => setSelectedLocation(null)}
              className="text-sm font-semibold text-slate-750 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t('navTutors')}
            </Link>
            
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-slate-700">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {t('navDashboard')}
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
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

          {/* Mobile menu controls */}
          <div className="md:hidden flex items-center gap-1.5">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-5 space-y-2.5 overflow-hidden"
          >
            <Link 
              to="/" 
              onClick={() => {
                setSelectedLocation(null);
                setIsMenuOpen(false);
              }} 
              className="block px-4 py-3 rounded-2xl text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {t('navProperties')}
            </Link>
            <Link 
              to="/" 
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
