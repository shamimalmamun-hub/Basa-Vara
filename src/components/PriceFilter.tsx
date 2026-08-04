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
  maxBound = 20000
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
      // Don't cross max
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
      // Don't cross min
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
    { label: language === 'bn' ? 'সব টাকা (সকল পোস্ট)' : 'All Range', min: '', max: '' },
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
    <div className="w-full backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 p-5 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-all">
      {/* Header Row: Title, Sorting, Reset */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span>{titleText}</span>
        </div>

        {/* Sorting Dropdown & Reset Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            {language === 'bn' ? 'ক্রমানুসার:' : 'Sort:'}
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
          >
            <option value="default">{language === 'bn' ? 'ডিফল্ট' : 'Default'}</option>
            <option value="price_asc">
              {language === 'bn' ? 'কম টাকা থেকে বেশি ⬆' : 'Price: Low to High ⬆'}
            </option>
            <option value="price_desc">
              {language === 'bn' ? 'বেশি টাকা থেকে কম ⬇' : 'Price: High to Low ⬇'}
            </option>
          </select>

          {(hasActivePriceFilter || isFilterActive) && onResetAll && (
            <button
              onClick={onResetAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-colors shrink-0 cursor-pointer"
              title={language === 'bn' ? 'রিসেট' : 'Reset'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Single Filter Line Container */}
      <div className="my-4 px-2">
        {/* Top Label Row: Left (Min) vs Right (Max) */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-3">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              {language === 'bn' ? 'সর্বনিম্ন:' : 'Min:'}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              {formatPriceLabel(currentMin)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              {language === 'bn' ? 'সর্বোচ্চ:' : 'Max:'}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              {maxPrice !== '' ? formatPriceLabel(currentMax) : formatPriceLabel(realMaxBound)}
            </span>
          </div>
        </div>

        {/* Dual Slider Track Line */}
        <div className="relative w-full h-8 flex items-center my-2">
          {/* Background Track Line */}
          <div className="absolute left-0 right-0 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            {/* Active Highlight Segment between Min and Max */}
            <div
              className="absolute h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`
              }}
            />
          </div>

          {/* Min Range Input Slider */}
          <input
            type="range"
            min={realMinBound}
            max={realMaxBound}
            step={stepSize}
            value={currentMin}
            onChange={handleMinChange}
            className="absolute left-0 right-0 w-full h-3 appearance-none bg-transparent pointer-events-auto cursor-pointer accent-emerald-600 focus:outline-none z-20"
            title={language === 'bn' ? 'সর্বনিম্ন টাকা' : 'Min Price'}
          />

          {/* Max Range Input Slider */}
          <input
            type="range"
            min={realMinBound}
            max={realMaxBound}
            step={stepSize}
            value={currentMax}
            onChange={handleMaxChange}
            className="absolute left-0 right-0 w-full h-3 appearance-none bg-transparent pointer-events-auto cursor-pointer accent-indigo-600 focus:outline-none z-30"
            title={language === 'bn' ? 'সর্বোচ্চ টাকা' : 'Max Price'}
          />
        </div>

        {/* Bottom Labels under the Line */}
        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 dark:text-slate-500 px-1 mt-1">
          <span>{formatPriceLabel(realMinBound)} ({language === 'bn' ? 'সর্বনিম্ন পোস্ট' : 'Min Post'})</span>
          <span>{formatPriceLabel(realMaxBound)} ({language === 'bn' ? 'সর্বোচ্চ পোস্ট' : 'Max Post'})</span>
        </div>
      </div>

      {/* Quick Set Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
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
