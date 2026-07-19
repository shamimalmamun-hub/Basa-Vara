import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function WhatsAppWidget() {
  const { language } = useLanguage();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Smooth delayed entrance for the widget
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Automatically hide the WhatsApp tooltip message after 5 seconds of being shown
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const whatsappNumber = '8801329246833'; // Bangladesh number without prefix or '+'
  const message = language === 'bn' 
    ? 'হ্যালো, আমি বাসাভাড়া ও হোম টিউটর ওয়েবসাইট থেকে বলছিলাম।' 
    : 'Hello, I am contacting you from the rent and home tutor website.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const tooltipText = language === 'bn' 
    ? 'আমাদের প্রতিনিধির সাথে কথা বলুন' 
    : 'Speak with our representative';

  const isHomePage = location.pathname === '/';

  if (!isHomePage || !isVisible) return null;

  return (
    <div id="whatsapp-widget-container" className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Speech bubble above the WhatsApp logo */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            id="whatsapp-tooltip-bubble"
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mb-3 bg-emerald-500 dark:bg-emerald-600 text-white py-2.5 px-4 rounded-2xl shadow-xl border border-emerald-400/20 flex items-center gap-2 max-w-[280px] pointer-events-auto relative"
          >
            {/* Visual Speech Bubble Indicator Arrow */}
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-emerald-500 dark:bg-emerald-600 rotate-45 border-r border-b border-emerald-400/20"></div>
            
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs md:text-sm font-semibold tracking-wide text-white hover:text-emerald-100 select-none mr-1"
            >
              {tooltipText}
            </a>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="p-0.5 rounded-full hover:bg-emerald-600 dark:hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors"
              aria-label="Close message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated WhatsApp Button */}
      <motion.a
        id="whatsapp-floating-button"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-emerald-500/20 shadow-emerald-500/10 cursor-pointer pointer-events-auto group overflow-hidden"
        title={tooltipText}
      >
        {/* Pulsing Backing Ring for eye-catching animation */}
        <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping opacity-75"></span>
        
        {/* Sleek Gradient Overlay */}
        <span className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-350 rounded-full"></span>
        
        {/* Custom High-Quality SVG WhatsApp Logo */}
        <svg 
          className="w-8 h-8 relative z-10 transition-transform duration-350 group-hover:rotate-12" 
          fill="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.993c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.a>
    </div>
  );
}
