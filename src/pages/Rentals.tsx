import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PropertyCard } from '../components/Cards';
import { MAIN_LOCATIONS, PROPERTY_TYPES } from '../lib/utils';
import { SlidersHorizontal } from 'lucide-react';

export default function Rentals() {
  const { properties, selectedLocation, setSelectedLocation } = useApp();
  const { language, t } = useLanguage();
  const [filterType, setFilterType] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filtered = properties.filter(p => 
    (selectedLocation === null || (p.location || '').toLowerCase().trim() === selectedLocation.toLowerCase().trim()) &&
    (filterType === 'All' || 
      (Array.isArray(p.type) ? p.type.includes(filterType as any) : p.type === filterType)
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, filterType]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProperties = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === 'bn' ? 'ভাড়ার জন্য উপলব্ধ' : 'Available Rentals'}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t('rentalsSubtitle')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-indigo-500" /> {t('rentalsFilter')}
          </div>
          <select 
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-sm cursor-pointer"
            value={selectedLocation || 'All'} 
            onChange={e => setSelectedLocation(e.target.value === 'All' ? null : e.target.value)}
          >
            <option value="All">{language === 'bn' ? 'সকল এলাকা' : 'All Areas'}</option>
            {MAIN_LOCATIONS.map(l => {
              let label = l;
              if (l === 'Mymensingh Sadar') label = language === 'bn' ? 'ময়মনসিংহ সদর' : 'Mymensingh Sadar';
              else if (l === 'Madhupur') label = language === 'bn' ? 'মধুপুর' : 'Madhupur';
              else if (l === 'Muktagacha') label = language === 'bn' ? 'মুক্তাগাছা' : 'Muktagacha';
              else if (l === 'Bhaluka') label = language === 'bn' ? 'ভালুকা' : 'Bhaluka';
              else if (l === 'Trishal') label = language === 'bn' ? 'ত্রিশাল' : 'Trishal';
              else if (l === 'Dhaka') label = language === 'bn' ? 'ঢাকা' : 'Dhaka';
              return (
                <option key={l} value={l}>
                  {label}
                </option>
              );
            })}
          </select>
          <select 
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-sm cursor-pointer"
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="All">{language === 'bn' ? 'সকল ধরন' : 'All Types'}</option>
            {PROPERTY_TYPES.map(tOption => {
              let localizedLabel = tOption;
              if (tOption === 'Family Flat') localizedLabel = language === 'bn' ? 'ফ্যামিলি ফ্ল্যাট' : 'Family Flat';
              else if (tOption === 'Female Mess') localizedLabel = language === 'bn' ? 'ছাত্রী মেস' : 'Female Mess';
              else if (tOption === 'Male Mess') localizedLabel = language === 'bn' ? 'ছাত্র মেস' : 'Male Mess';
              else if (tOption === 'Bachelor Flat') localizedLabel = language === 'bn' ? 'ব্যাচেলর ফ্ল্যাট' : 'Bachelor Flat';
              
              return (
                <option key={tOption} value={tOption}>
                  {localizedLabel}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedProperties.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(prev => Math.max(prev - 1, 1));
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
              document.documentElement.scrollTop = 0;
              document.body.scrollTop = 0;
            }}
            className="px-5 py-2.5 text-sm font-semibold rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
          </button>
          
          <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
            {language === 'bn' 
              ? `${currentPage} / ${totalPages} পৃষ্ঠা` 
              : `Page ${currentPage} of ${totalPages}`
            }
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage(prev => Math.min(prev + 1, totalPages));
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
              document.documentElement.scrollTop = 0;
              document.body.scrollTop = 0;
            }}
            className="px-5 py-2.5 text-sm font-semibold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/10"
          >
            {language === 'bn' ? 'পরবর্তী' : 'Next'}
          </button>
        </div>
      )}
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('rentalsNotFound')}</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">{t('rentalsNotFoundLong')}</p>
        </div>
      )}
    </div>
  );
}
