import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Property, Tutor } from '../types';
import { MapPin, BookOpen, Clock, CalendarDays, Phone, LockKeyhole, MessageCircle, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';

export function PropertyCard({ property }: { property: Property, key?: any }) {
  const { currentUser } = useApp();
  const { language, t } = useLanguage();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const isOwner = currentUser?.id === property.ownerId;
  const isAdmin = currentUser?.role === 'admin';
  const isSubscribed = currentUser?.subscriptionEnd ? new Date(currentUser.subscriptionEnd) > new Date() : false;
  const canViewDetails = isAdmin || isOwner || isSubscribed;

  const propertyTypeLabel = () => {
    const types = Array.isArray(property.type) ? property.type : [property.type].filter(Boolean);
    if (types.length === 0) return language === 'bn' ? 'ফ্ল্যাট' : 'Flat';
    
    return types.map(t => {
      if (t === 'Family Flat') return language === 'bn' ? 'ফ্যামিলি ফ্ল্যাট' : 'Family Flat';
      if (t === 'Female Mess') return language === 'bn' ? 'ছাত্রী মেস' : 'Female Mess';
      if (t === 'Male Mess') return language === 'bn' ? 'ছাত্র মেস' : 'Male Mess';
      if (t === 'Bachelor Flat') return language === 'bn' ? 'ব্যাচেলর ফ্ল্যাট' : 'Bachelor Flat';
      
      // fallbacks
      if (t === 'Flat') return language === 'bn' ? 'ফ্ল্যাট' : 'Flat';
      if (t === 'Seat') return language === 'bn' ? 'সিট' : 'Seat';
      if (t === 'Single Room') return language === 'bn' ? 'সিঙ্গেল রুম' : 'Single Room';
      if (t === 'Mess') return language === 'bn' ? 'মেস' : 'Mess';
      return t;
    }).join(', ');
  };

  const getLocationLabel = (loc: string) => {
    if (loc === 'Mymensingh Sadar') return language === 'bn' ? 'ময়মনসিংহ সদর' : 'Mymensingh Sadar';
    if (loc === 'Madhupur') return language === 'bn' ? 'মধুপুর' : 'Madhupur';
    if (loc === 'Muktagacha') return language === 'bn' ? 'মুক্তাগাছা' : 'Muktagacha';
    if (loc === 'Bhaluka') return language === 'bn' ? 'ভালুকা' : 'Bhaluka';
    if (loc === 'Trishal') return language === 'bn' ? 'ত্রিশাল' : 'Trishal';
    if (loc === 'Dhaka') return language === 'bn' ? 'ঢাকা' : 'Dhaka';
    return loc;
  };

  const locationLabel = getLocationLabel(property.location);

  return (
    <div className="flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-3 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/10 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 rounded-2xl mb-3 group/slider">
        <img 
          src={(property.images && property.images[currentImgIndex]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'} 
          alt={`${property.title} - ${currentImgIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';
          }}
        />
        
        {/* Left/Right Carousel Controls */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImgIndex(prev => (prev === 0 ? property.images.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white dark:bg-slate-900/95 dark:hover:bg-slate-950 text-slate-800 dark:text-slate-200 p-1.5 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity duration-200 cursor-pointer z-10"
              title={language === 'bn' ? 'পূর্ববর্তী ছবি' : 'Previous Image'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImgIndex(prev => (prev === property.images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white dark:bg-slate-900/95 dark:hover:bg-slate-950 text-slate-800 dark:text-slate-200 p-1.5 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity duration-200 cursor-pointer z-10"
              title={language === 'bn' ? 'পরবর্তী ছবি' : 'Next Image'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Image index badge indicator */}
            <div className="absolute bottom-2 right-2 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow z-10 font-sans">
              {currentImgIndex + 1}/{property.images.length}
            </div>

            {/* Availability Badge inside slide */}
            <div className={`absolute bottom-2 left-2 text-[9px] font-black px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg z-10 text-white uppercase tracking-wider ${property.isAvailable === false ? 'bg-rose-600/90 ring-1 ring-white/10' : 'bg-emerald-600/90 ring-1 ring-white/10'}`}>
              {property.isAvailable === false ? (language === 'bn' ? 'ভাড়া হয়ে গেছে 🛑' : 'Rented Out 🛑') : (language === 'bn' ? 'খালি আছে ✅' : 'Available ✅')}
            </div>

            {/* Pagination dots at the top center of the slide */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {property.images.map((_, i) => (
                <span 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImgIndex ? 'bg-indigo-500 w-3' : 'bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-xs px-2.5 py-1 rounded-full font-black shadow-sm text-indigo-650 dark:text-indigo-400 border border-slate-200/20">
          ৳{property.price.toLocaleString('en-IN')}<span className="text-slate-500 dark:text-slate-400 text-[10px] font-normal">{t('tagMonth')}</span>
        </div>
        <div className="absolute top-3 left-3 bg-violet-600/90 text-white text-[9.5px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-sm">
          {propertyTypeLabel()}
        </div>
      </div>

      <div className="p-1 flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug tracking-tight">{property.title}</h3>
          <p className="flex items-center text-xs text-amber-600 dark:text-amber-400 mt-1 font-bold">
            <MapPin className="w-4 h-4 mr-1 text-amber-500 shrink-0" /> {locationLabel}
          </p>
          {canViewDetails ? (
            <div className="text-xs text-indigo-950 dark:text-indigo-100 font-medium mt-2 leading-relaxed max-h-[120px] overflow-y-auto pr-1 select-text scrollbar-thin bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/30 p-2 rounded-2xl">
              {property.description}
            </div>
          ) : (
            <p className="text-xs text-slate-805 dark:text-slate-200 font-medium mt-2 line-clamp-2 leading-relaxed h-[36px] overflow-hidden">
              {property.description}
            </p>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 min-h-[92px] flex flex-col justify-center pr-1">
          {canViewDetails ? (
            <div className="space-y-1">
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 text-indigo-500 mr-1.5 mt-0.5 shrink-0" />
                <span className="text-slate-800 dark:text-slate-200 font-bold truncate">{property.address}</span>
              </div>
              {(property.contactNumber || property.ownerPhoneNumber) && (
                <div className="flex flex-col gap-1.5 pt-0.5">
                  {property.contactNumber && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-indigo-500 mr-1.5 shrink-0" />
                      <span className="text-slate-550 dark:text-slate-400 mr-1 text-xs font-semibold shrink-0">{language === 'bn' ? 'যোগাযোগ:' : 'Contact:'}</span>
                      <a href={`tel:${property.contactNumber}`} className="text-indigo-650 dark:text-indigo-400 font-extrabold hover:underline truncate">{property.contactNumber}</a>
                    </div>
                  )}
                  {property.ownerPhoneNumber && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-emerald-550 mr-1.5 shrink-0" />
                      <span className="text-slate-550 dark:text-slate-400 mr-1 text-xs font-semibold shrink-0">{language === 'bn' ? 'মালিক:' : 'Owner:'}</span>
                      <a href={`tel:${property.ownerPhoneNumber}`} className="text-emerald-600 dark:text-emerald-400 text-base font-black hover:underline truncate">{property.ownerPhoneNumber}</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link to={currentUser ? '/dashboard' : '/login'} state={{ tab: 'subscription' }} className="flex items-center justify-center w-full py-2.5 bg-indigo-50/65 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-xl transition-all border border-indigo-200/50 dark:border-indigo-900/50 shadow-sm">
              <LockKeyhole className="w-4 h-4 mr-1.5 shrink-0" /> {language === 'bn' ? 'সাবস্ক্রাইব করে বিস্তারিত দেখুন' : 'Subscribe to View Details'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function TutorCard({ tutor }: { tutor: Tutor, key?: any }) {
  const { currentUser } = useApp();
  const { language, t } = useLanguage();
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const isAdmin = currentUser?.role === 'admin';
  const isOwner = currentUser?.id === tutor.userId;
  const isSubscribed = currentUser?.subscriptionEnd ? new Date(currentUser.subscriptionEnd) > new Date() : false;
  const canViewDetails = isAdmin || isOwner || isSubscribed;

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

  const getLocationLabel = (loc: string) => {
    if (loc === 'Mymensingh Sadar') return language === 'bn' ? 'ময়মনসিংহ সদর' : 'Mymensingh Sadar';
    if (loc === 'Madhupur') return language === 'bn' ? 'মধুপুর' : 'Madhupur';
    if (loc === 'Muktagacha') return language === 'bn' ? 'মুক্তাগাছা' : 'Muktagacha';
    if (loc === 'Bhaluka') return language === 'bn' ? 'ভালুকা' : 'Bhaluka';
    if (loc === 'Trishal') return language === 'bn' ? 'ত্রিশাল' : 'Trishal';
    if (loc === 'Dhaka') return language === 'bn' ? 'ঢাকা' : 'Dhaka';
    return loc;
  };

  const locationLabel = getLocationLabel(tutor.location);

  return (
    <div className="flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-3 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/10 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      {tutor.isVerified && (
        <div className="absolute top-0 right-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider">
          {t('tagVerified')}
        </div>
      )}
      <div className="flex items-center space-x-3 mb-1 shrink-0 h-[50px]">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
          <img 
            src={tutor.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'} 
            alt={tutor.name} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-base text-slate-900 dark:text-white truncate">{tutor.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start">
            <BookOpen className="w-3 h-3 mr-1 text-slate-400 shrink-0 mt-0.5" /> <span>{tutor.education}</span>
          </p>
        </div>
      </div>
      
      <div className="space-y-1.5 mt-1 shrink-0 flex flex-col justify-center">
        <div className="flex items-start text-sm">
          <MapPin className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{locationLabel}</span>
        </div>
        <div className="flex items-start text-sm">
          <CalendarDays className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium font-sans truncate">
            {tutor.daysPerWeek ? (
              <span>{language === 'bn' ? `সপ্তাহে ${tutor.daysPerWeek}` : `${tutor.daysPerWeek}/week`}</span>
            ) : (
              tutor.availableDays.map(d => getDaysLabel(d)).join(', ')
            )}
          </span>
        </div>
        <div className="flex items-start text-sm">
          <Clock className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{tutor.availableTime}</span>
        </div>
        {tutor.experience && (
        <div className="flex items-start text-sm">
          <Briefcase className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{tutor.experience}</span>
        </div>
        )}
      </div>

      <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1 flex-grow">
        <div className="flex items-center">
          {canViewDetails ? (
             <div className="space-y-1.5 w-full">
               {(tutor.contactNumber || tutor.phoneNumber) && (
                 <div className="flex items-center text-sm">
                   <Phone className="w-4.5 h-4.5 text-indigo-500 mr-1.5 shrink-0" />
                   <span className="text-slate-650 dark:text-slate-300 mr-1 font-semibold shrink-0">{language === 'bn' ? 'ফোন:' : 'Phone:'}</span>
                   <a href={`tel:${tutor.contactNumber || tutor.phoneNumber}`} className="text-indigo-650 dark:text-indigo-400 text-sm md:text-base font-black hover:underline truncate">{tutor.contactNumber || tutor.phoneNumber}</a>
                 </div>
               )}
               {tutor.whatsappNumber && (
                 <div className="flex items-center text-sm">
                   <MessageCircle className="w-4.5 h-4.5 text-emerald-500 mr-1.5 shrink-0" />
                   <span className="text-slate-650 dark:text-slate-300 mr-1 font-semibold shrink-0">{language === 'bn' ? 'হোয়াটসঅ্যাপ:' : 'WhatsApp:'}</span>
                   <a href={`https://wa.me/${tutor.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 text-sm md:text-base font-black hover:underline truncate">{tutor.whatsappNumber}</a>
                 </div>
               )}
               {!tutor.contactNumber && !tutor.phoneNumber && !tutor.whatsappNumber && (
                 <span className="text-slate-500 text-xs italic">{language === 'bn' ? 'কোনো কন্টাক্ট নম্বর দেওয়া নেই' : 'No contact details provided'}</span>
               )}
             </div>
          ) : (
             <Link to={currentUser ? '/dashboard' : '/login'} state={{ tab: 'subscription' }} className="flex items-center justify-center w-full py-2.5 bg-indigo-50/65 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-xl transition-all border border-indigo-200/50 dark:border-indigo-900/50 shadow-sm">
               <LockKeyhole className="w-4 h-4 mr-1.5 shrink-0" /> {language === 'bn' ? 'কন্টাক্ট দেখতে সাবস্ক্রাইব করুন' : 'Subscribe to View Contact'}
             </Link>
          )}
        </div>
        
        <div className="flex justify-between items-center bg-white dark:bg-slate-950 px-2 py-0.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-wrap gap-0.5 flex-1 pr-1">
            {(showAllSubjects ? tutor.subjects : tutor.subjects.slice(0, 2)).map(sub => (
              <span key={sub} className="px-1.5 py-0.5 text-[9px] rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-900/50">
                {getSubjectLabel(sub)}
              </span>
            ))}
            {tutor.subjects.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllSubjects(!showAllSubjects)}
                className="px-1.5 py-0.5 text-[9px] rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors shrink-0"
              >
                {showAllSubjects ? '×' : `+${tutor.subjects.length - 2}`}
              </button>
            )}
          </div>
          <div className="text-right shrink-0 pl-1">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider">{language === 'bn' ? 'প্রত্যাশিত' : 'Expected'}</span>
            <span className="text-xs font-black text-slate-900 dark:text-white">৳{tutor.salaryExpected.toLocaleString('en-IN')}<span className="text-[10px] font-normal">{language === 'bn' ? '/মাস' : '/Month'}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
