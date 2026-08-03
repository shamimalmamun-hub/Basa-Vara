import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Property, Tutor } from '../types';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  X, MapPin, Phone, LockKeyhole, MessageCircle, Briefcase, 
  BookOpen, Clock, CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ItemDetailModalProps {
  property?: Property | null;
  tutor?: Tutor | null;
  onClose: () => void;
}

export default function ItemDetailModal({ property, tutor, onClose }: ItemDetailModalProps) {
  const { currentUser } = useApp();
  const { language, t } = useLanguage();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  if (!property && !tutor) return null;

  // Access control
  const isAdmin = currentUser?.role === 'admin';
  const isOwner = property 
    ? currentUser?.id === property.ownerId 
    : tutor 
    ? currentUser?.id === tutor.userId 
    : false;
  const isSubscribed = currentUser?.subscriptionEnd 
    ? new Date(currentUser.subscriptionEnd) > new Date() 
    : false;
  const canViewDetails = isAdmin || isOwner || isSubscribed;

  const getLocationLabel = (loc: string) => {
    if (loc === 'Mymensingh Sadar') return language === 'bn' ? 'ময়মনসিংহ সদর' : 'Mymensingh Sadar';
    if (loc === 'Madhupur') return language === 'bn' ? 'মধুপুর' : 'Madhupur';
    if (loc === 'Muktagacha') return language === 'bn' ? 'মুক্তাগাছা' : 'Muktagacha';
    if (loc === 'Bhaluka') return language === 'bn' ? 'ভালুকা' : 'Bhaluka';
    if (loc === 'Trishal') return language === 'bn' ? 'ত্রিশাল' : 'Trishal';
    if (loc === 'Dhaka') return language === 'bn' ? 'ঢাকা' : 'Dhaka';
    return loc;
  };

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

  const getDaysLabel = (day: string) => {
    const daysDict: Record<string, string> = {
      'Sunday': language === 'bn' ? 'রবিবার' : 'Sunday',
      'Monday': language === 'bn' ? 'সোমবার' : 'Monday',
      'Tuesday': language === 'bn' ? 'মঙ্গলবার' : 'Tuesday',
      'Wednesday': language === 'bn' ? 'বুধবার' : 'Wednesday',
      'Thursday': language === 'bn' ? 'বৃহস্পতিবার' : 'Thursday',
      'Friday': language === 'bn' ? 'শুক্রবার' : 'Friday',
      'Saturday': language === 'bn' ? 'শনিবার' : 'Saturday',
    };
    return daysDict[day] || day;
  };

  const propertyTypeLabel = (p: Property) => {
    const types = Array.isArray(p.type) ? p.type : [p.type].filter(Boolean);
    if (types.length === 0) return language === 'bn' ? 'ফ্ল্যাট' : 'Flat';
    
    return types.map(t => {
      if (t === 'Family Flat') return language === 'bn' ? 'ফ্যামিলি ফ্ল্যাট' : 'Family Flat';
      if (t === 'Female Mess') return language === 'bn' ? 'ছাত্রী মেস' : 'Female Mess';
      if (t === 'Male Mess') return language === 'bn' ? 'ছাত্র মেস' : 'Male Mess';
      if (t === 'Bachelor Flat') return language === 'bn' ? 'ব্যাচেলর ফ্ল্যাট' : 'Bachelor Flat';
      if (t === 'Flat') return language === 'bn' ? 'ফ্ল্যাট' : 'Flat';
      if (t === 'Seat') return language === 'bn' ? 'সিট' : 'Seat';
      if (t === 'Single Room') return language === 'bn' ? 'সিঙ্গেল রুম' : 'Single Room';
      if (t === 'Mess') return language === 'bn' ? 'মেস' : 'Mess';
      return t;
    }).join(', ');
  };

  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col relative"
        >
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-wider shrink-0 font-sans">
                {property ? (language === 'bn' ? 'একক বাসা তথ্য' : 'Rental Details') : (language === 'bn' ? 'একক টিউটর তথ্য' : 'Tutor Details')}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {property ? property.title : tutor?.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-200/60 dark:bg-slate-800 rounded-full transition-colors shrink-0 cursor-pointer"
              title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
            {/* PROPERTY VIEW */}
            {property && (
              <>
                {/* Image Gallery Slider */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 shrink-0 group">
                  <img
                    src={(property.images && property.images[currentImgIndex]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                    alt={property.title}
                    className="w-full h-full object-cover transition-all duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="bg-violet-600/90 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow backdrop-blur-sm">
                      {propertyTypeLabel(property)}
                    </span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md shadow text-white uppercase tracking-wider ${property.isAvailable === false ? 'bg-rose-600/90' : 'bg-emerald-600/90'}`}>
                      {property.isAvailable === false ? (language === 'bn' ? 'ভাড়া হয়ে গেছে 🛑' : 'Rented Out 🛑') : (language === 'bn' ? 'খালি আছে ✅' : 'Available ✅')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur text-white text-sm font-black px-3.5 py-1 rounded-full shadow border border-white/10">
                    ৳{property.price?.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-300">{t('tagMonth')}</span>
                  </div>

                  {/* Carousel Nav Controls */}
                  {property.images && property.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentImgIndex(prev => (prev === 0 ? property.images.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white p-2 rounded-full shadow-lg transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentImgIndex(prev => (prev === property.images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white p-2 rounded-full shadow-lg transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Image Thumbnails Row */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-slate-950/60 backdrop-blur-md rounded-xl max-w-[90%] overflow-x-auto">
                        {property.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImgIndex(idx)}
                            className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${idx === currentImgIndex ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60'}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Info Overview */}
                <div className="space-y-3">
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                    {property.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <span className="flex items-center text-amber-600 dark:text-amber-400 font-bold">
                      <MapPin className="w-4 h-4 mr-1 text-amber-500 shrink-0" />
                      {getLocationLabel(property.location)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold">
                      {property.address}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {language === 'bn' ? 'বিস্তারিত বিবরণ' : 'Description'}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 whitespace-pre-line">
                      {property.description || (language === 'bn' ? 'কোনো বিবরণ দেওয়া হয়নি' : 'No description provided')}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* TUTOR VIEW */}
            {tutor && (
              <>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500 shrink-0 shadow-md">
                    <img 
                      src={tutor.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80'} 
                      alt={tutor.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {tutor.name}
                      </h1>
                      {tutor.isVerified && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('tagVerified')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{tutor.education}</span>
                    </p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{getLocationLabel(tutor.location)}</span>
                    </p>
                  </div>
                  <div className="text-center sm:text-right shrink-0">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                      {language === 'bn' ? 'প্রত্যাশিত বেতন' : 'Expected Salary'}
                    </span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      ৳{tutor.salaryExpected?.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">{language === 'bn' ? '/মাস' : '/Month'}</span>
                    </span>
                  </div>
                </div>

                {/* Tutor Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{language === 'bn' ? 'পড়ানোর দিন' : 'Available Days'}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {tutor.daysPerWeek ? (
                          language === 'bn' ? `সপ্তাহে ${tutor.daysPerWeek} দিন` : `${tutor.daysPerWeek} days/week`
                        ) : (
                          tutor.availableDays?.map(d => getDaysLabel(d)).join(', ') || 'N/A'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{language === 'bn' ? 'উপলব্ধ সময়' : 'Available Time'}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{tutor.availableTime || 'N/A'}</span>
                    </div>
                  </div>

                  {tutor.experience && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3 sm:col-span-2">
                      <Briefcase className="w-5 h-5 text-indigo-500 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{language === 'bn' ? 'অভিজ্ঞতা' : 'Experience'}</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{tutor.experience}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subjects */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {language === 'bn' ? 'পড়ানোর বিষয়সমূহ' : 'Subjects'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects?.map(sub => (
                      <span key={sub} className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-900/50">
                        {getSubjectLabel(sub)}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* CONTACT SECTION FOR BOTH */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>{language === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Details'}</span>
              </h3>

              {canViewDetails ? (
                <div className="space-y-2">
                  {property && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {property.contactNumber && (
                        <a 
                          href={`tel:${property.contactNumber}`}
                          className="flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{language === 'bn' ? `কল করুন: ${property.contactNumber}` : `Call: ${property.contactNumber}`}</span>
                        </a>
                      )}
                      {property.ownerPhoneNumber && (
                        <a 
                          href={`tel:${property.ownerPhoneNumber}`}
                          className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{language === 'bn' ? `মালিককে কল করুন: ${property.ownerPhoneNumber}` : `Owner: ${property.ownerPhoneNumber}`}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {tutor && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(tutor.contactNumber || tutor.phoneNumber) && (
                        <a 
                          href={`tel:${tutor.contactNumber || tutor.phoneNumber}`}
                          className="flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{language === 'bn' ? `কল করুন: ${tutor.contactNumber || tutor.phoneNumber}` : `Call: ${tutor.contactNumber || tutor.phoneNumber}`}</span>
                        </a>
                      )}
                      {tutor.whatsappNumber && (
                        <a 
                          href={`https://wa.me/${tutor.whatsappNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{language === 'bn' ? `হোয়াটসঅ্যাপ: ${tutor.whatsappNumber}` : `WhatsApp: ${tutor.whatsappNumber}`}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center gap-1.5">
                    <LockKeyhole className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{language === 'bn' ? 'ফোন নম্বর ও সরাসরি যোগাযোগ দেখতে সাবস্ক্রাইব করুন' : 'Subscribe to view phone numbers & direct contact options'}</span>
                  </p>
                  <Link
                    to={currentUser ? '/dashboard' : '/login'}
                    state={{ tab: 'subscription' }}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md"
                  >
                    <LockKeyhole className="w-4 h-4" />
                    <span>{language === 'bn' ? 'সাবস্ক্রাইব করুন' : 'Subscribe Now'}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
