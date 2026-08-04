import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PropertyCard } from '../components/Cards';
import { MAIN_LOCATIONS, PROPERTY_TYPES } from '../lib/utils';
import { SlidersHorizontal } from 'lucide-react';
import ItemDetailModal from '../components/ItemDetailModal';
import PriceFilter from '../components/PriceFilter';

export default function Rentals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const { properties, selectedLocation, setSelectedLocation } = useApp();
  const { language, t } = useLanguage();
  const [filterType, setFilterType] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const selectedProperty = selectedId ? properties.find(p => p.id === selectedId) : null;

  // Calculate dynamic min & max prices from actual posted properties
  const validPrices = properties.map(p => Number(p.price)).filter(val => !isNaN(val) && val > 0);
  const minPostedPrice = validPrices.length > 0 ? Math.min(...validPrices) : 500;
  const maxPostedPrice = validPrices.length > 0 ? Math.max(...validPrices) : 30000;

  const handleResetAll = () => {
    setSelectedLocation(null);
    setFilterType('All');
    setMinPrice('');
    setMaxPrice('');
    setSortOrder('default');
  };

  const isFilterActive = selectedLocation !== null || filterType !== 'All' || minPrice !== '' || maxPrice !== '' || sortOrder !== 'default';

  const filtered = properties
    .filter(p => {
      if (selectedLocation !== null && (p.location || '').toLowerCase().trim() !== selectedLocation.toLowerCase().trim()) {
        return false;
      }
      if (filterType !== 'All') {
        const isTypeMatch = Array.isArray(p.type) ? p.type.includes(filterType as any) : p.type === filterType;
        if (!isTypeMatch) return false;
      }
      if (minPrice !== '' && !isNaN(Number(minPrice))) {
        if (Number(p.price) < Number(minPrice)) return false;
      }
      if (maxPrice !== '' && !isNaN(Number(maxPrice))) {
        if (Number(p.price) > Number(maxPrice)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'price_asc') return Number(a.price) - Number(b.price);
      if (sortOrder === 'price_desc') return Number(b.price) - Number(a.price);
      return 0;
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, filterType, minPrice, maxPrice, sortOrder]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentPage]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProperties = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {language === 'bn' ? 'ভাড়ার জন্য উপলব্ধ' : 'Available Rentals'}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t('rentalsSubtitle')}
        </p>
      </div>

      {/* UNIFIED MAIN FILTER PANEL */}
      <PriceFilter
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onResetAll={handleResetAll}
        isFilterActive={isFilterActive}
        typeLabel="rent"
        minBound={minPostedPrice}
        maxBound={maxPostedPrice}
      >
        <select 
          className="w-full md:w-auto px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-xs cursor-pointer shadow-sm"
          value={selectedLocation || 'All'} 
          onChange={e => setSelectedLocation(e.target.value === 'All' ? null : e.target.value)}
        >
          <option value="All">{language === 'bn' ? 'সকল এলাকা' : 'All Areas'}</option>
          {MAIN_LOCATIONS.map(l => {
            let label = l;
            if (l === 'Mymensingh Sadar') label = language === 'bn' ? 'ময়মনসিংহ সদর' : 'Mymensingh Sadar';
            else if (l === 'Madhupur') label = language === 'bn' ? 'মধুপুর' : 'Madhupur';
            return (
              <option key={l} value={l}>
                {label}
              </option>
            );
          })}
        </select>

        <select 
          className="w-full md:w-auto px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-xs cursor-pointer shadow-sm"
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
      </PriceFilter>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedProperties.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(prev => Math.max(prev - 1, 1));
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
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
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
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

      {/* SINGLE ITEM DETAIL MODAL */}
      {selectedProperty && (
        <ItemDetailModal 
          property={selectedProperty} 
          onClose={() => setSearchParams({})} 
        />
      )}
    </div>
  );
}
