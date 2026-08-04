import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TutorCard } from '../components/Cards';
import { MAIN_LOCATIONS } from '../lib/utils';
import { SlidersHorizontal } from 'lucide-react';
import ItemDetailModal from '../components/ItemDetailModal';
import PriceFilter from '../components/PriceFilter';

export default function Tutors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const { tutors, selectedLocation, setSelectedLocation } = useApp();
  const { language, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterSubj, setFilterSubj] = useState<string>('All');
  const [filterGender, setFilterGender] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('default');

  const selectedTutor = selectedId ? tutors.find(t => t.id === selectedId) : null;

  // Calculate dynamic min & max salaries from actual posted tutors
  const validSalaries = tutors.map(t => Number(t.salaryExpected)).filter(val => !isNaN(val) && val > 0);
  const minPostedSalary = validSalaries.length > 0 ? Math.min(...validSalaries) : 1000;
  const maxPostedSalary = validSalaries.length > 0 ? Math.max(...validSalaries) : 20000;

  const allSubjects = Array.from(new Set(tutors.flatMap(t => t.subjects))) as string[];

  const handleResetAll = () => {
    setSelectedLocation(null);
    setFilterSubj('All');
    setFilterGender('All');
    setMinPrice('');
    setMaxPrice('');
    setSortOrder('default');
  };

  const isFilterActive = selectedLocation !== null || filterSubj !== 'All' || filterGender !== 'All' || minPrice !== '' || maxPrice !== '' || sortOrder !== 'default';

  const filtered = tutors
    .filter(t => {
      if (selectedLocation !== null && (t.location || '').toLowerCase().trim() !== selectedLocation.toLowerCase().trim()) {
        return false;
      }
      if (filterSubj !== 'All' && !t.subjects.includes(filterSubj)) {
        return false;
      }
      if (filterGender !== 'All' && t.gender !== filterGender) {
        return false;
      }
      if (minPrice !== '' && !isNaN(Number(minPrice))) {
        if (Number(t.salaryExpected) < Number(minPrice)) return false;
      }
      if (maxPrice !== '' && !isNaN(Number(maxPrice))) {
        if (Number(t.salaryExpected) > Number(maxPrice)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'price_asc') return Number(a.salaryExpected) - Number(b.salaryExpected);
      if (sortOrder === 'price_desc') return Number(b.salaryExpected) - Number(a.salaryExpected);
      return 0;
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, filterSubj, filterGender, minPrice, maxPrice, sortOrder]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentPage]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTutors = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getSubjectLabel = (subject: string) => {
    const dictionary: Record<string, string> = {
      'Mathematics': language === 'bn' ? 'গণিত' : 'Mathematics',
      'Physics': language === 'bn' ? 'পদার্থবিজ্ঞান' : 'Physics',
      'Chemistry': language === 'bn' ? 'রসায়ন' : 'Chemistry',
      'English': language === 'bn' ? 'ইংরেজি' : 'English',
      'ICT': language === 'bn' ? 'আইসিটি' : 'ICT',
      'Biology': language === 'bn' ? 'জীববিজ্ঞান' : 'Biology',
    };
    return dictionary[subject] || subject;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('tutorsTitle')}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t('tutorsSubtitle')}
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
        typeLabel="tutor"
        minBound={minPostedSalary}
        maxBound={maxPostedSalary}
      >
        <select 
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-xs cursor-pointer shadow-sm"
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
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-xs cursor-pointer shadow-sm"
          value={filterSubj} 
          onChange={e => setFilterSubj(e.target.value)}
        >
          <option value="All">{t('tutorsAllSubjects')}</option>
          {allSubjects.map(s => <option key={s} value={s}>{getSubjectLabel(s)}</option>)}
        </select>

        <select 
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-xs cursor-pointer shadow-sm"
          value={filterGender} 
          onChange={e => setFilterGender(e.target.value)}
        >
          <option value="All">{language === 'bn' ? 'টিউটর নির্বাচন করুন' : 'Select Tutor'}</option>
          <option value="male">{language === 'bn' ? 'ছেলে' : 'Male'}</option>
          <option value="female">{language === 'bn' ? 'মেয়ে' : 'Female'}</option>
        </select>
      </PriceFilter>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedTutors.map(t => <TutorCard key={t.id} tutor={t} />)}
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
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('tutorsNotFound')}</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">{t('tutorsNotFoundLong')}</p>
        </div>
      )}

      {/* SINGLE ITEM DETAIL MODAL */}
      {selectedTutor && (
        <ItemDetailModal 
          tutor={selectedTutor} 
          onClose={() => setSearchParams({})} 
        />
      )}
    </div>
  );
}
