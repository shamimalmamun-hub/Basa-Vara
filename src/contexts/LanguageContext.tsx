import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  overrides: Record<Language, Record<string, string>>;
  updateOverrides: (newOverrides: Record<Language, Record<string, string>>) => void;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Brand & Navigation
    'brandName': 'বাসাভাড়া ও টিউটর',
    'navProperties': 'প্রপার্টিসমূহ',
    'navTutors': 'হোম টিউটর',
    'navDashboard': 'ড্যাশবোর্ড',
    'navLogin': 'লগইন / রেজিস্টার',
    'navLogout': 'লগআউট',
    'translatorAlt': 'ভাষা পরিবর্তন',

    // Hero Section
    'heroTitle1': 'খুঁজে নিন আপনার স্বপ্নের',
    'heroTitleAccent': 'বাসা ও টিউটর',
    'heroBadgeText': 'ময়মনসিংহ বিভাগের এক নম্বর সার্ভিস প্ল্যাটফর্ম',
    'heroSubtitle': 'ময়মনসিংহ ও মধুপুরের সর্ববৃহৎ প্ল্যাটফর্ম, যেখানে পাচ্ছেন ফ্ল্যাট, মেস সিট এবং ভেরিফাইড হোম টিউটর।',
    'heroFindHomeButton': 'বাসা/মেস খুঁজুন',
    'heroFindTutorButton': 'টিউটর খুঁজুন',

    // Home Sections
    'homeNewAds': 'নতুন বিজ্ঞাপনসমূহ',
    'homeAdsSubtitle': 'সর্বশেষ আপলোড করা ফ্ল্যাট, মেস ও সিট।',
    'homeSeeAll': 'সবগুলো দেখুন →',
    'homeNewTutors': 'নতুন টিউটরসমূহ',
    'homeTutorsSubtitle': 'সর্বশেষ নিবন্ধিত শিক্ষক ও টিউটরগণ।',
    'homeNoPropertyFound': 'কোনো প্রপার্টি পাওয়া যায়নি।',
    'homeNoTutorFound': 'কোনো টিউটর পাওয়া যায়নি।',

    // Plans
    'planSectionTitle': 'আমাদের বিশেষ প্যাকেজসমূহ',
    'planSectionSubtitle': 'সাশ্রয়ী মূল্যে আপনার বিজ্ঞাপনটি প্রচার করুন এবং কাঙ্ক্ষিত সুবিধা বুঝে নিন।',
    'planOwnerTitle': 'প্রপার্টি মালিক',
    'planOwnerSubtitle': 'আপনার ফ্ল্যাট, মেস বা সিটের বিজ্ঞাপন দিন।',
    'planOwnerPrice': '৳৫০',
    'planOwnerPeriod': ' / মাস',
    'planOwnerFeature1': 'আনলিমিটেড প্রপার্টি লিস্ট',
    'planOwnerFeature2': 'ভেরিফাইড ব্যাজ',
    'planOwnerFeature3': 'প্রায়োরিটি র‍্যাংকিং',
    'planOwnerFeature4': 'বিজ্ঞাপন প্রকাশের পর দ্রুততম সময়ে ভাড়াটিয়া পাওয়ার সুবিধা',
    
    'planTutorTitle': 'হোম টিউটর',
    'planTutorSubtitle': 'প্রোফাইল তৈরি করুন এবং সরাসরি টিউশনি পান।',
    'planTutorPrice': '৳৫০',
    'planTutorPeriod': ' / মাস',
    'planTutorFeature1': 'ভেরিফাইড প্রোফাইল',
    'planTutorFeature2': 'সরাসরি যোগাযোগ',
    'planTutorFeature3': 'সিভি ডিসপ্লে',
    'planTutorFeature4': 'আনলিমিটেড টিউশনি পাওয়ার সেরা সুযোগ',
    'planPopularBadge': 'জনপ্রিয়',
    'planBtnRegister': 'রেজিস্টার ও সাবস্ক্রাইব করুন',

    // Rentals Page
    'rentalsTitle': 'ভাড়ার বিজ্ঞাপনসমূহ',
    'rentalsSubtitle': 'আপনার এলাকায় ফ্ল্যাট, মেস এবং রুম খুঁজুন।',
    'rentalsFilter': 'ফিল্টার',
    'rentalsAllLocations': 'সব লোকেশন',
    'rentalsAllTypes': 'সব ধরণের',
    'rentalsFlat': 'ফ্ল্যাট',
    'rentalsMess': 'মেস',
    'rentalsSeat': 'সিট',
    'rentalsMymensinghSadar': 'ময়মনসিংহ সদর',
    'rentalsMadhupur': 'মধুপুর',
    'rentalsNotFound': 'কোনো প্রপার্টি পাওয়া যায়নি',
    'rentalsNotFoundLong': 'আরও ফলাফল দেখতে আপনার ফিল্টার পরিবর্তন করুন বা অন্য কোনো অবস্থানে অনুসন্ধান করুন।',

    // Tutors Page
    'tutorsTitle': 'ভেরিফাইড টিউটরগণ',
    'tutorsSubtitle': 'আপনার কাছাকাছি সেরা শিক্ষক খুঁজুন।',
    'tutorsAllSubjects': 'সব বিষয়',
    'tutorsNotFound': 'কোনো টিউটর পাওয়া যায়নি',
    'tutorsNotFoundLong': 'আরও ফলাফল দেখতে আপনার ফিল্টার পরিবর্তন করুন।',

    // Card details / status tags
    'tagAvailable': 'উপলব্ধ আছে',
    'tagRented': 'ভাড়া হয়ে গেছে',
    'tagVerified': 'ভেরিফাইড',
    'tagPremiumOnly': 'শুধুমাত্র প্রিমিয়াম মেম্বারদের জন্য',
    'tagUpgradeBtn': 'আনলক করতে আপগ্রেড করুন',
    'tagMonth': ' / মাস',
    'tagSalaryText': 'প্রত্যাশিত বেতন:',
    'tagEducationText': 'শিক্ষা:',
    'tagSubjectsText': 'বিষয়সমূহ:',
    'tagDaysText': 'দিন:',
    'tagTimeText': 'সময়:',
    'tagLocationText': 'লোকেশন:',
    'tagContactText': 'যোগাযোগ:',
    'tagTaka': 'টাকা',

    // Login/Register
    'loginTitle': 'স্বাগতম',
    'loginSubtitle': 'আপনার একাউন্টে লগইন করুন',
    'roleTenantOwner': 'ইউজার / মালিক',
    'roleTutor': 'টিউটর',
    'fieldEmail': 'ইমেইল এড্রেস',
    'fieldPassword': 'পাসওয়ার্ড',
    'fieldName': 'আপনার নাম',
    'fieldNID': 'এনআইডি নাম্বার (ভেরিফিকেশনের জন্য)',
    'noAccountText': 'অ্যাকাউন্ট নেই?',
    'alreadyAccountText': 'আগে থেকেই অ্যাকাউন্ট আছে?',
    'btnRegisterNow': 'নিবন্ধন করুন',
    'btnLoginNow': 'লগইন করুন',
    'loginErrorNid': 'শুধুমাত্র এনআইডি নম্বরটি দিন (সংখ্যা)',

    // Admin login
    'adminPanelTitle': 'এডমিনিস্ট্রেটর পোর্টাল',
    'adminPanelSubtitle': 'এডমিন ইমেইল ও পাসওয়ার্ড প্রদান করুন',

    // Dashboard - Standard texts
    'dashDashboard': 'ড্যাশবোর্ড',
    'dashMyProperties': 'আমার প্রপার্টি সমূহ',
    'dashAddProperty': 'নতুন প্রপার্টি যোগ করুন',
    'dashMyProfile': 'আমার প্রোফাইল',
    'dashPayments': 'পেমেন্ট ও সাবস্ক্রিপশন',
    'dashVerification': 'এনআইডি ভেরিফিকেশন',
    'dashAdminUsers': 'ব্যবহারকারীগণ (Admin)',
    'dashAdminProperties': 'সকল প্রপার্টি (Admin)',
    'dashAdminInvoices': 'ইনভয়েস যাচাইকরণ (Admin)',
  },
  en: {
    // Brand & Navigation
    'brandName': 'BasaVara & Tutor',
    'navProperties': 'Properties',
    'navTutors': 'Home Tutors',
    'navDashboard': 'Dashboard',
    'navLogin': 'Login / Register',
    'navLogout': 'Log Out',
    'translatorAlt': 'Change Language',

    // Hero Section
    'heroTitle1': 'Find Your Dream',
    'heroTitleAccent': 'Home & Tutor',
    'heroBadgeText': "Mymensingh's Unified Rental & Tutor Platform",
    'heroSubtitle': 'The largest platform in Mymensingh and Madhupur, where you can find flats, messes, seats, and verified home tutors.',
    'heroFindHomeButton': 'Find Home/Mess',
    'heroFindTutorButton': 'Find Tutor',

    // Home Sections
    'homeNewAds': 'Recent Listings',
    'homeAdsSubtitle': 'Latest uploaded flats, messes, and seats.',
    'homeSeeAll': 'See All →',
    'homeNewTutors': 'Recent Tutors',
    'homeTutorsSubtitle': 'Latest registered teachers and tutors.',
    'homeNoPropertyFound': 'No properties found.',
    'homeNoTutorFound': 'No tutors found.',

    // Plans
    'planSectionTitle': 'Our Premium Packages',
    'planSectionSubtitle': 'Promote your advertisement at affordable prices and leverage full system advantages.',
    'planOwnerTitle': 'Property Owner',
    'planOwnerSubtitle': 'List your flat, mess space, or hostel seat.',
    'planOwnerPrice': '৳50',
    'planOwnerPeriod': ' / Month',
    'planOwnerFeature1': 'Unlimited property listings',
    'planOwnerFeature2': 'Verified badge on profile',
    'planOwnerFeature3': 'Priority ranking in searches',
    'planOwnerFeature4': 'Find tenants in the shortest time after posting',

    'planTutorTitle': 'Home Tutor',
    'planTutorSubtitle': 'Create custom profile and find tuitions directly.',
    'planTutorPrice': '৳50',
    'planTutorPeriod': ' / Month',
    'planTutorFeature1': 'Verified expert profile',
    'planTutorFeature2': 'Direct contact with guardians',
    'planTutorFeature3': 'Featured CV/Resume display',
    'planTutorFeature4': 'Access unlimited tuition matching opportunities',
    'planPopularBadge': 'Popular',
    'planBtnRegister': 'Register & Subscribe Now',

    // Rentals Page
    'rentalsTitle': 'Rental Listings',
    'rentalsSubtitle': 'Search for matching flats, messes, and custom rooms in your locality.',
    'rentalsFilter': 'Filter',
    'rentalsAllLocations': 'All Locations',
    'rentalsAllTypes': 'All Types',
    'rentalsFlat': 'Flat',
    'rentalsMess': 'Mess',
    'rentalsSeat': 'Seat',
    'rentalsMymensinghSadar': 'Mymensingh Sadar',
    'rentalsMadhupur': 'Madhupur',
    'rentalsNotFound': 'No properties found',
    'rentalsNotFoundLong': 'Adjust your filters or query a different location to fetch listings.',

    // Tutors Page
    'tutorsTitle': 'Verified Home Tutors',
    'tutorsSubtitle': 'Find the highly recommended experienced tutors in your neighborhood.',
    'tutorsAllSubjects': 'All Subjects',
    'tutorsNotFound': 'No tutors found',
    'tutorsNotFoundLong': 'Adjust your filters or look up other subjects to see results.',

    // Card details / status tags
    'tagAvailable': 'Available',
    'tagRented': 'Already Rented',
    'tagVerified': 'Verified',
    'tagPremiumOnly': 'Premium Subscribers Only',
    'tagUpgradeBtn': 'Upgrade to Unlock Details',
    'tagMonth': ' / month',
    'tagSalaryText': 'Expected Salary:',
    'tagEducationText': 'Education:',
    'tagSubjectsText': 'Subjects:',
    'tagDaysText': 'Days:',
    'tagTimeText': 'Time:',
    'tagLocationText': 'Location:',
    'tagContactText': 'Contact:',
    'tagTaka': 'Taka',

    // Login/Register
    'loginTitle': 'Welcome Back',
    'loginSubtitle': 'Log in to your account',
    'roleTenantOwner': 'User / Owner',
    'roleTutor': 'Home Tutor',
    'fieldEmail': 'Email Address',
    'fieldPassword': 'Password',
    'fieldName': 'Your Full Name',
    'fieldNID': 'NID Number (for security verification)',
    'noAccountText': "Don't have an account?",
    'alreadyAccountText': 'Already have an account?',
    'btnRegisterNow': 'Register',
    'btnLoginNow': 'Log In',
    'loginErrorNid': 'Please provide NID with integers only',

    // Admin login
    'adminPanelTitle': 'Administrator Control',
    'adminPanelSubtitle': 'Access portal using administrator credentials',

    // Dashboard - Standard texts
    'dashDashboard': 'Dashboard',
    'dashMyProperties': 'My Properties',
    'dashAddProperty': 'Add New Property',
    'dashMyProfile': 'My Profile',
    'dashPayments': 'Payments & Subscription',
    'dashVerification': 'NID Verification',
    'dashAdminUsers': 'Users Management (Admin)',
    'dashAdminProperties': 'All Properties (Admin)',
    'dashAdminInvoices': 'Verify Invoices (Admin)',
  },
};

const DEFAULT_OVERRIDES: Record<Language, Record<string, string>> = {
  bn: {
    "heroBadgeText": "ময়মনসিংহ বিভাগের ও মধুপুরের এক নম্বর সার্ভিস প্ল্যাটফর্ম"
  },
  en: {}
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language] = useState<Language>('bn');

  const [overrides, setOverrides] = useState<Record<Language, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem('basavara_translation_overrides');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          bn: { ...DEFAULT_OVERRIDES.bn, ...parsed.bn },
          en: { ...DEFAULT_OVERRIDES.en, ...parsed.en }
        };
      }
      return DEFAULT_OVERRIDES;
    } catch {
      return DEFAULT_OVERRIDES;
    }
  });

  useEffect(() => {
    localStorage.setItem('basavara-language', 'bn');
  }, []);

  const updateOverrides = (newOverrides: Record<Language, Record<string, string>>) => {
    setOverrides(newOverrides);
    localStorage.setItem('basavara_translation_overrides', JSON.stringify(newOverrides));
  };

  const t = (key: string): string => {
    // If there is an override, return it first.
    // If not, fall back to default translations.
    if (overrides[language]?.[key] !== undefined && overrides[language]?.[key] !== '') {
      return overrides[language][key];
    }
    if (translations[language]?.[key] !== undefined) {
      return translations[language][key];
    }
    if (overrides['en']?.[key] !== undefined && overrides['en']?.[key] !== '') {
      return overrides['en'][key];
    }
    if (translations['en']?.[key] !== undefined) {
      return translations['en'][key];
    }
    // For key === 'customLogoImage', return empty string if not set rather than returning 'customLogoImage' word
    if (key === 'customLogoImage') return '';
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'bn', setLanguage: () => {}, t, overrides, updateOverrides }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
