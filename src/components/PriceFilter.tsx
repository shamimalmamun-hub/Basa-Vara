import React from 'react';
import { ArrowUpDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PriceFilterProps {
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  sortOrder: string;
  setSortOrder: (val: string) => void;
  onResetAll?: () => void;
  isFilterActive?: boolean;
  typeLabel?: 'rent' | 'tutor';
  minBound?: number; // Calculated minimum price from actual posts
  maxBound?: number; // Calculated maximum price from actual posts
  children?: React.ReactNode; // Integrated dropdowns (location, type, subject, gender, etc.)
}

function toBengaliNum(val: number | string): string {
  const enToBn: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(val).replace(/[0-9]/g, match => enToBn[match] || match);
}

export default function PriceFilter({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortOrder,
  setSortOrder,
  onResetAll,
  isFilterActive = false,
  typeLabel = 'rent',
  minBound = 1000,
  maxBound = 20000,
  children
}: PriceFilterProps) {
  const { language } = useLanguage();

  // Safety fallbacks for bounds calculated from real posts
  const realMinBound = Math.max(0, isNaN(minBound) || minBound === Infinity ? 500 : minBound);
  const realMaxBound = Math.max(realMinBound + 1000, isNaN(maxBound) || maxBound === -Infinity ? 20000 : maxBound);
  const stepSize = realMaxBound - realMinBound > 10000 ? 1000 : 500;

  // Current numeric state
  const currentMin = minPrice !== '' ? Math.max(realMinBound, Number(minPrice)) : realMinBound;
  const currentMax = maxPrice !== '' ? Math.min(realMaxBound, Number(maxPrice)) : realMaxBound;

  const formatPriceLabel = (amount: number) => {
    const formatted = amount.toLocaleString('en-IN');
    if (language === 'bn') {
      return `৳${toBengaliNum(formatted)}`;
    }
    return `৳${formatted}`;
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= currentMax) {
      const safeMin = Math.max(realMinBound, currentMax - stepSize);
      setMinPrice(safeMin === realMinBound ? '' : String(safeMin));
      return;
    }
    if (val <= realMinBound) {
      setMinPrice('');
    } else {
      setMinPrice(String(val));
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val <= currentMin) {
      const safeMax = Math.min(realMaxBound, currentMin + stepSize);
      setMaxPrice(safeMax === realMaxBound ? '' : String(safeMax));
      return;
    }
    if (val >= realMaxBound) {
      setMaxPrice('');
    } else {
      setMaxPrice(String(val));
    }
  };

  // Quick preset options
  const half = Math.round((realMinBound + (realMaxBound - realMinBound) * 0.5) / stepSize) * stepSize;
  const quarter3 = Math.round((realMinBound + (realMaxBound - realMinBound) * 0.75) / stepSize) * stepSize;

  const quickPresets = [
    { label: language === 'bn' ? 'সকল রেঞ্জ' : 'All Range', min: '', max: '' },
    { label: `${formatPriceLabel(realMinBound)} - ${formatPriceLabel(half)}`, min: String(realMinBound), max: String(half) },
    { label: `${formatPriceLabel(half)} - ${formatPriceLabel(realMaxBound)}`, min: String(half), max: String(realMaxBound) },
    { label: `${formatPriceLabel(quarter3)}+`, min: String(quarter3), max: '' },
  ];

  const hasActivePriceFilter = minPrice !== '' || maxPrice !== '' || sortOrder !== 'default';

  // Calculate percentage range for high-contrast active fill line
  const minPercent = Math.round(((currentMin - realMinBound) / (realMaxBound - realMinBound)) * 100);
  const maxPercent = Math.round(((currentMax - realMinBound) / (realMaxBound - realMinBound)) * 100);

  const titleText = typeLabel === 'tutor'
    ? (language === 'bn' ? 'বেতন পরিমাণ ফিল্টার' : 'Salary Range Filter')
    : (language === 'bn' ? 'ভাড়া পরিমাণ ফিল্টার' : 'Rent Range Filter');

  return (
    <div className="w-full backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-all mb-8">
      {/* Unified Filter Header Row: Dropdowns + Sorting + Reset */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        {/* Left Side: Filter Badge & Custom Category Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="flex items-center text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 gap-1.5 shrink-0 pr-2 border-r border-slate-200 dark:border-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>{language === 'bn' ? 'ফিল্টার:' : 'Filters:'}</span>
          </div>

          {children}
        </div>

        {/* Right Side: Sorting Dropdown & Reset Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            {language === 'bn' ? 'ক্রমানুসার:' : 'Sort:'}
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
          >
            <option value="default">{language === 'bn' ? 'ডিফল্ট' : 'Default'}</option>
            <option value="price_asc">
              {typeLabel === 'tutor'
                ? (language === 'bn' ? 'কম বেতন থেকে বেশি ⬆' : 'Salary: Low to High ⬆')
                : (language === 'bn' ? 'কম টাকা থেকে বেশি ⬆' : 'Price: Low to High ⬆')}
            </option>
            <option value="price_desc">
              {typeLabel === 'tutor'
                ? (language === 'bn' ? 'বেশি বেতন থেকে কম ⬇' : 'Salary: High to Low ⬇')
                : (language === 'bn' ? 'বেশি টাকা থেকে কম ⬇' : 'Price: High to Low ⬇')}
            </option>
          </select>

          {(hasActivePriceFilter || isFilterActive) && onResetAll && (
            <button
              onClick={onResetAll}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-colors shrink-0 cursor-pointer shadow-sm"
              title={language === 'bn' ? 'রিসেট' : 'Reset'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Single Filter Line Container */}
      <div className="pt-4 px-1">
        {/* Min (Left) vs Max (Right) Labels */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-2">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              {typeLabel === 'tutor' ? (language === 'bn' ? 'সর্বনিম্ন বেতন:' : 'Min Salary:') : (language === 'bn' ? 'সর্বনিম্ন ভাড়া:' : 'Min Rent:')}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              {formatPriceLabel(realMinBound)}
            </span>
          </div>

          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
            {titleText}
          </span>

          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              {typeLabel === 'tutor' ? (language === 'bn' ? 'সর্বোচ্চ বেতন:' : 'Max Salary:') : (language === 'bn' ? 'সর্বোচ্চ ভাড়া:' : 'Max Rent:')}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              {maxPrice !== '' ? formatPriceLabel(currentMax) : formatPriceLabel(realMaxBound)}
            </span>
          </div>
        </div>

        {/* Single Slider Track Line */}
        <div className="relative w-full h-7 flex items-center my-1">
          {/* Background Track Line */}
          <div className="absolute left-0 right-0 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            {/* Active Highlight Segment from start to selected max */}
            <div
              className="absolute h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all"
              style={{
                left: '0%',
                width: `${maxPercent}%`
              }}
            />
          </div>

          {/* Single Draggable Price Slider */}
          <input
            type="range"
            min={realMinBound}
            max={realMaxBound}
            step={stepSize}
            value={currentMax}
            onChange={handleMaxChange}
            className="absolute left-0 right-0 w-full h-3 appearance-none bg-transparent cursor-pointer accent-indigo-600 focus:outline-none z-30"
            title={language === 'bn' ? 'টাকা ফিল্টার করুন (সামনে/পিছনে টানুন)' : 'Filter Price (Drag handle)'}
          />
        </div>

        {/* Bottom Labels under the Line */}
        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 dark:text-slate-500 px-1 mt-0.5">
          <span>{formatPriceLabel(realMinBound)} ({language === 'bn' ? 'সর্বনিম্ন পোস্ট' : 'Min Post'})</span>
          <span>{formatPriceLabel(realMaxBound)} ({language === 'bn' ? 'সর্বোচ্চ পোস্ট' : 'Max Post'})</span>
        </div>
      </div>

      {/* Quick Set Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1">
          {language === 'bn' ? 'দ্রুত নির্বাচন:' : 'Quick Select:'}
        </span>
        {quickPresets.map((preset) => {
          const isActive = minPrice === preset.min && maxPrice === preset.max;
          return (
            <button
              key={preset.label}
              onClick={() => {
                setMinPrice(preset.min);
                setMaxPrice(preset.max);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
