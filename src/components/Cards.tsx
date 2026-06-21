import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Property, Tutor } from '../types';
import { MapPin, BookOpen, Clock, CalendarDays, Phone, LockKeyhole, MessageCircle, Briefcase } from 'lucide-react';
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
    <div className="flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative group h-[480px]">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/10 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
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
      <div className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">{property.title}</h3>
          <p className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            <MapPin className="w-4 h-4 mr-1 text-indigo-500 shrink-0" /> {locationLabel}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed h-[42px] overflow-hidden">
            {property.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 h-[100px] overflow-y-auto pr-1">
          {canViewDetails ? (
            <div className="space-y-1.5">
              <div className="flex items-start text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">{property.address}</span>
              </div>
              {(property.contactNumber || property.ownerPhoneNumber) && (
                <div className="flex flex-col gap-1.5 pt-1">
                  {property.contactNumber && (
                    <div className="flex items-center text-xs sm:text-sm">
                      <Phone className="w-3.5 h-3.5 text-indigo-500 mr-2 shrink-0" />
                      <span className="text-slate-500 mr-1 text-xs shrink-0">{language === 'bn' ? 'যোগাযোগ:' : 'Contact:'}</span>
                      <a href={`tel:${property.contactNumber}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline truncate">{property.contactNumber}</a>
                    </div>
                  )}
                  {property.ownerPhoneNumber && (
                    <div className="flex items-center text-xs sm:text-sm">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                      <span className="text-slate-500 mr-1 text-xs shrink-0">{language === 'bn' ? 'মালিক:' : 'Owner Phone:'}</span>
                      <a href={`tel:${property.ownerPhoneNumber}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline truncate">{property.ownerPhoneNumber}</a>
                    </div>
                  )}
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
    <div className="flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-3 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
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
             <div className="space-y-1 w-full">
               {(tutor.contactNumber || tutor.phoneNumber) && (
                 <div className="flex items-center text-xs">
                   <Phone className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" />
                   <span className="text-slate-500 mr-1 shrink-0">{language === 'bn' ? 'ফোন:' : 'Phone:'}</span>
                   <a href={`tel:${tutor.contactNumber || tutor.phoneNumber}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline truncate">{tutor.contactNumber || tutor.phoneNumber}</a>
                 </div>
               )}
               {tutor.whatsappNumber && (
                 <div className="flex items-center text-xs">
                   <MessageCircle className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" />
                   <span className="text-slate-500 mr-1 shrink-0">{language === 'bn' ? 'হোয়াটসঅ্যাপ:' : 'WhatsApp:'}</span>
                   <a href={`https://wa.me/${tutor.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline truncate">{tutor.whatsappNumber}</a>
                 </div>
               )}
               {!tutor.contactNumber && !tutor.phoneNumber && !tutor.whatsappNumber && (
                 <span className="text-slate-500 text-xs italic">{language === 'bn' ? 'কোনো কন্টাক্ট নম্বর দেওয়া নেই' : 'No contact details provided'}</span>
               )}
             </div>
          ) : (
             <Link to={currentUser ? '/dashboard' : '/login'} state={{ tab: 'subscription' }} className="flex items-center justify-center w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/50">
               <LockKeyhole className="w-4 h-4 mr-1" /> {language === 'bn' ? 'কন্টাক্ট দেখতে সাবস্ক্রাইব করুন' : 'Subscribe to View Contact'}
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
