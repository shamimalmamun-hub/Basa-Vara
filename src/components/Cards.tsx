import React from 'react';
import { Link } from 'react-router-dom';
import { Property, Tutor } from '../types';
import { MapPin, BookOpen, Clock, CalendarDays, Phone, LockKeyhole } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';

export function PropertyCard({ property }: { property: Property, key?: any }) {
  const { currentUser } = useApp();
  const { language, t } = useLanguage();
  const isOwner = currentUser?.id === property.ownerId;
  const isAdmin = currentUser?.role === 'admin';
  const isSubscribed = currentUser?.subscriptionEnd ? new Date(currentUser.subscriptionEnd) > new Date() : false;
  const canViewDetails = isAdmin || isOwner || isSubscribed;

  const propertyTypeLabel = () => {
    if (property.type === 'Flat') return language === 'bn' ? 'ফ্ল্যাট' : 'Flat';
    if (property.type === 'Seat') return language === 'bn' ? 'সিট' : 'Seat';
    if (property.type === 'Single Room') return language === 'bn' ? 'সিঙ্গেল রুম' : 'Single Room';
    return language === 'bn' ? 'মেস' : 'Mess';
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
    <div className="flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative group">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/10 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img 
          src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'} 
          alt={property.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-sm px-3 py-1 rounded-full font-bold shadow-sm text-slate-900 dark:text-slate-100">
          ৳{property.price.toLocaleString('en-IN')}<span className="text-slate-500 dark:text-slate-400 text-xs font-normal">{t('tagMonth')}</span>
        </div>
        <div className="absolute top-3 left-3 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
          {propertyTypeLabel()}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">{property.title}</h3>
        <p className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
          <MapPin className="w-4 h-4 mr-1 text-indigo-500 shrink-0" /> {locationLabel}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed flex-1">
          {property.description}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          {canViewDetails ? (
            <div className="space-y-2">
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{property.address}</span>
              </div>
              {property.contactNumber && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                  <a href={`tel:${property.contactNumber}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{property.contactNumber}</a>
                </div>
              )}
            </div>
          ) : (
            <Link to={currentUser ? '/dashboard' : '/login'} state={{ tab: 'subscription' }} className="flex items-center justify-center w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/50">
              <LockKeyhole className="w-3.5 h-3.5 mr-1.5" /> {language === 'bn' ? 'সাবস্ক্রাইব করে বিস্তারিত দেখুন' : 'Subscribe to View Details'}
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
    <div className="flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/10 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      {tutor.isVerified && (
        <div className="absolute top-0 right-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider">
          {t('tagVerified')}
        </div>
      )}
      <div className="flex items-center space-x-4 mb-4 mt-2">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
          <img 
            src={tutor.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'} 
            alt={tutor.name} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{tutor.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
            <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" /> {tutor.education}
          </p>
        </div>
      </div>
      
      <div className="space-y-3 mt-4 flex-1">
        <div className="flex items-start text-sm">
          <MapPin className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{locationLabel}</span>
        </div>
        <div className="flex items-start text-sm">
          <CalendarDays className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {tutor.availableDays.map(d => getDaysLabel(d)).join(', ')}
          </span>
        </div>
        <div className="flex items-start text-sm">
          <Clock className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{tutor.availableTime}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        {canViewDetails ? (
           <div className="flex items-center text-sm mb-4">
             <Phone className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
             {tutor.contactNumber ? (
               <a href={`tel:${tutor.contactNumber}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{tutor.contactNumber}</a>
             ) : (
               <span className="text-slate-500 italic">{language === 'bn' ? 'নম্বর দেওয়া নেই' : 'No number provided'}</span>
             )}
           </div>
        ) : (
           <Link to={currentUser ? '/dashboard' : '/login'} state={{ tab: 'subscription' }} className="flex items-center justify-center w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/50 mb-4">
             <LockKeyhole className="w-3.5 h-3.5 mr-1.5" /> {language === 'bn' ? 'কন্টাক্ট দেখতে সাবস্ক্রাইব করুন' : 'Subscribe to View Contact'}
           </Link>
        )}
        
        <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          <div className="flex flex-wrap gap-1">
            {tutor.subjects.slice(0, 2).map(sub => (
              <span key={sub} className="px-2 py-0.5 text-[10px] rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/50 dark:border-slate-750">
                {getSubjectLabel(sub)}
              </span>
            ))}
            {tutor.subjects.length > 2 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border border-slate-200/50 dark:border-slate-750">
                +{tutor.subjects.length - 2}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider">{language === 'bn' ? 'প্রত্যাশিত' : 'Expected'}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">৳{tutor.salaryExpected.toLocaleString('en-IN')}<span className="text-[10px] font-normal">{t('tagMonth')}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
