import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Megaphone } from 'lucide-react';

export default function ScrollingText() {
  const { isScrollingTextEnabled, scrollingTextBn, scrollingTextEn } = useApp();
  const { language } = useLanguage();

  if (!isScrollingTextEnabled) return null;

  const text = language === 'bn' ? scrollingTextBn : scrollingTextEn;

  return (
    <div className="w-full bg-indigo-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-indigo-100/50 dark:border-slate-800/60 shadow-sm relative z-40 overflow-hidden transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 text-xs sm:text-sm font-semibold text-indigo-900 dark:text-indigo-200">
          
          {/* Badge indicator */}
          <div className="flex items-center gap-1.5 bg-indigo-600 dark:bg-indigo-550 text-white px-2.5 py-1 rounded-full text-[10px] md:text-xs font-extrabold shadow-sm shadow-indigo-500/10 shrink-0 z-10 select-none">
            <Megaphone className="w-3 h-3 animate-bounce" />
            <span>{language === 'bn' ? 'অফার ও ঘোষণা' : 'Offers & Ads'}</span>
          </div>

          {/* Scrolling text area */}
          <div className="flex-1 overflow-hidden mx-4 relative h-full flex items-center">
            <div className="w-full relative whitespace-nowrap overflow-hidden">
              <div className="animate-marquee inline-block text-slate-800 dark:text-slate-100 pl-[100%] font-medium">
                {text}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
