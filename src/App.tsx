import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './contexts/AppContext';
import { useLanguage } from './contexts/LanguageContext';
import { MotionConfig } from 'motion/react';
import { updatePageMetaTags } from './lib/meta';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname]);

  return null;
}

// Pages
import Navbar from './components/Navbar';
import ScrollingText from './components/ScrollingText';
import Footer from './components/Footer';
import Home from './pages/Home';
import Rentals from './pages/Rentals';
import Tutors from './pages/Tutors';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import PendingApproval from './pages/PendingApproval';
import WhatsAppWidget from './components/WhatsAppWidget';

function ProtectedRoute({ children, roleRequired }: { children: React.ReactNode, roleRequired?: string[] }) {
  const { currentUser, isLoading } = useApp();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roleRequired && !roleRequired.includes(currentUser.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

export default function App() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const { t, language } = useLanguage();

  // Dynamically update browser tab title and favicon when brand name or logo changes
  useEffect(() => {
    // 1. Dynamic document/tab title update and Open Graph meta tags
    const brandName = t('brandName');
    let pageTitle = "";
    if (brandName && brandName !== 'brandName' && brandName !== '') {
      pageTitle = `${brandName} | ${language === 'bn' ? 'বাসা ভাড়া ও হোম টিউটর' : 'Basa Bhara & Home Tutor BD'}`;
    } else {
      pageTitle = language === 'bn' 
        ? "বাসা ভাড়া ও হোম টিউটর | Basa Bhara & Home Tutor BD"
        : "Basa Bhara & Home Tutor BD";
    }

    updatePageMetaTags({
      title: pageTitle,
      description: language === 'bn' 
        ? "বাংলাদেশ প্রথম প্রযুক্তিবান্ধব বাসা ভাড়া, মেস ভাড়া এবং হোম টিউটর খোঁজার নির্ভরযোগ্য প্ল্যাটফর্ম। ময়মনসিংহ, ঢাকা, ত্রিশাল, ভালুকা সহ বিভিন্ন অঞ্চলে সহজে বাড়িভাড়া এবং দক্ষ গৃহশিক্ষক খুঁজুন।"
        : "The most trusted platform in Bangladesh for house rentals, mess seats, and experienced home tutors.",
      image: '/og-image.jpg'
    });

    // 2. Dynamic favicon / browser tab icon update (combats browser aggressive caching with timestamp version)
    const customLogo = t('customLogoImage');
    const targetLogo = customLogo && customLogo !== '' ? customLogo : `/logo.png?v=${Date.now()}`;

    // Find and update all shortcut/favicon links in HTML head
    const iconLinks = document.querySelectorAll("link[rel*='icon']");
    if (iconLinks.length > 0) {
      iconLinks.forEach((link: any) => {
        link.href = targetLogo;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = targetLogo;
      document.head.appendChild(link);
    }

    // Find and update apple touch icon
    const appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (appleLink) {
      (appleLink as any).href = targetLogo;
    } else {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = targetLogo;
      document.head.appendChild(link);
    }
  }, [t, language]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const location = useLocation();
  const isAdminLoginPage = location.pathname === '/admin';

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "user"}>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] font-sans text-slate-800 dark:text-slate-200 transition-colors duration-500 relative selection:bg-indigo-500/30">
        {/* Modern Background Elements - Light Mode (Hidden on mobile to ensure fast performance and prevent scroll lagging) */}
        {!isMobile && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden dark:hidden flex justify-center">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-violet-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '10s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>
          </div>
        )}
        
        {/* Modern Background Elements - Dark Mode (Hidden on mobile to ensure fast performance and prevent scroll lagging) */}
        {!isMobile && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden hidden dark:flex justify-center">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/20 blur-[100px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col min-h-screen">
          {!isAdminLoginPage && (
            <div className="sticky top-0 z-50 w-full flex flex-col shadow-sm">
              <Navbar />
              <ScrollingText />
            </div>
          )}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/tutors" element={<Tutors />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/pending" element={<PendingApproval />} />
              
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          {!isAdminLoginPage && <Footer />}
          {!isAdminLoginPage && <WhatsAppWidget />}
        </div>
      </div>
    </MotionConfig>
  );
}
