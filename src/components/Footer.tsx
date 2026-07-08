import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, Shield, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors duration-500 relative overflow-hidden">
      {/* Subtle bottom accents */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-600"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-start">
          
          {/* Brand Col */}
          <div className="space-y-4 flex flex-col items-start text-left">
            <Link to="/" className="flex items-center space-x-2.5 justify-start">
              {t('customLogoImage') ? (
                <img src={t('customLogoImage')} alt="Logo" className="w-6 h-6 object-contain rounded-md" referrerPolicy="no-referrer" />
              ) : (
                <Home className="w-5 h-5 text-indigo-400" />
              )}
              <span className="font-bold text-lg tracking-tight text-white">
                {t('brandName') !== 'brandName' ? t('brandName') : (
                  language === 'bn' ? (
                    <>বাসা ভাড়া <span className="text-indigo-400">ও হোম টিউটর</span></>
                  ) : (
                    <>Rent & <span className="text-indigo-400">Home Tutor</span></>
                  )
                )}
              </span>
            </Link>
            <p className="text-[14px] text-slate-400 leading-relaxed max-w-sm text-left">
              {language === 'bn' 
                ? 'ময়মনসিংহ ও মধুপুরের সর্ববৃহৎ প্ল্যাটফর্ম, যেখানে পাচ্ছেন ফ্ল্যাট, মেস সিট এবং ভেরিফাইড হোম টিউটরের খোঁজ সহজে ও দ্রুত।'
                : 'The premier platform in Mymensingh and Madhupur, finding you apartments, mess rooms, and verified home tutors quickly and easily.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start text-left">
            <h4 className="text-[14px] font-bold text-white uppercase tracking-wider mb-4 text-left">
              {language === 'bn' ? 'অনুসন্ধান করুন' : 'Explore'}
            </h4>
            <ul className="space-y-2.5 text-[14px] flex flex-col items-start text-left">
              <li>
                <Link to="/rentals" className="hover:text-indigo-400 transition-colors">
                  {language === 'bn' ? 'বাসা/মেস বিজ্ঞাপনসমূহ' : 'Rentals & Messes'}
                </Link>
              </li>
              <li>
                <Link to="/tutors" className="hover:text-indigo-400 transition-colors">
                  {language === 'bn' ? 'হোম টিউটর খুঁজুন' : 'Find Home Tutors'}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  {language === 'bn' ? 'লগইন / রেজিস্টার করুন' : 'Login / Register'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Quick Stats */}
          <div className="flex flex-col items-start text-left">
            <h4 className="text-[14px] font-bold text-white uppercase tracking-wider mb-4 text-left">
              {language === 'bn' ? 'যোগাযোগ ও সহায়তা' : 'Support & Assistance'}
            </h4>
            <ul className="space-y-2.5 text-[14px] text-slate-400 flex flex-col items-start text-left">
              <li className="flex items-center gap-2 justify-start">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'bn' ? '১০০% এনআইডি ভেরিফাইড ইউজার' : '100% NID Verified Users'}</span>
              </li>
              <li className="flex items-center gap-2 justify-start">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>support@basavara.com</span>
              </li>
              <li className="flex items-center gap-2 justify-start">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>+৮৮০১-৪০১৯৯৬৬৭৪</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-5 mb-2.5"></div>

        {/* Bottom Bar: Copyright & Built Info */}
        <div className="flex flex-col items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-400 font-medium no-padding">
          <div className="w-full text-center">
            {language === 'bn' ? (
              <span>
                © ২০২৬ - সর্বস্বত্ব সংরক্ষিত । কারিগরি সহযোগিতায়{' '}
                <a 
                  href="https://www.facebook.com/ishamimalmamun/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                >
                  শামীম আল মামুন
                </a>
              </span>
            ) : (
              <span>
                © 2026 - All rights reserved. Technical Assistance by{' '}
                <a 
                  href="https://www.facebook.com/ishamimalmamun/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                >
                  Shamim Al Mamun
                </a>
              </span>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
