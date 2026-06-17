import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TutorCard } from '../components/Cards';
import { MAIN_LOCATIONS } from '../lib/utils';
import { SlidersHorizontal } from 'lucide-react';

export default function Tutors() {
  const { tutors, selectedLocation, setSelectedLocation } = useApp();
  const { language, t } = useLanguage();
  const [filterSubj, setFilterSubj] = useState<string>('All');

  const allSubjects = Array.from(new Set(tutors.flatMap(t => t.subjects))) as string[];

  const filtered = tutors.filter(t => 
    (selectedLocation === null || (t.location || '').toLowerCase().trim() === selectedLocation.toLowerCase().trim()) &&
    (filterSubj === 'All' || t.subjects.includes(filterSubj))
  );

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('tutorsTitle')}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t('tutorsSubtitle')}
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
            value={filterSubj} 
            onChange={e => setFilterSubj(e.target.value)}
          >
            <option value="All">{t('tutorsAllSubjects')}</option>
            {allSubjects.map(s => <option key={s} value={s}>{getSubjectLabel(s)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(t => <TutorCard key={t.id} tutor={t} />)}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('tutorsNotFound')}</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">{t('tutorsNotFoundLong')}</p>
        </div>
      )}
    </div>
  );
}
