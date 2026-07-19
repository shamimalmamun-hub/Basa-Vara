import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PropertyCard, TutorCard } from '../components/Cards';
import { Home as HomeIcon, GraduationCap, CheckCircle2, MapPin, ChevronRight, ArrowRight, Sparkles, ChevronDown, X } from 'lucide-react';
import { motion } from 'motion/react';
import { getYouTubeId } from '../lib/utils';
import { DEFAULT_BANNERS } from '../contexts/AppContext';

const LOCATION_NAMES: Record<string, { bn: string, en: string, icon: string }> = {
  'Mymensingh Sadar': { bn: 'ময়মনসিংহ সদর', en: 'Mymensingh Sadar', icon: '🏛️' },
  'Madhupur': { bn: 'মধুপুর', en: 'Madhupur', icon: '🌳' },
  'Muktagacha': { bn: 'মুক্তাগাছা', en: 'Muktagacha', icon: '🧁' },
  'Trishal': { bn: 'ত্রিশাল', en: 'Trishal', icon: '📚' },
  'Bhaluka': { bn: 'ভালুকা', en: 'Bhaluka', icon: '🏭' },
  'Dhaka': { bn: 'ঢাকা', en: 'Dhaka', icon: '🏙️' },
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
    },
  },
};

const listGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const listCardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 70,
      damping: 15,
    },
  },
};

export default function Home() {
  const { currentUser, properties, tutors, selectedLocation, setSelectedLocation, banners, heroVideoUrl, isLoading } = useApp();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [videoQuality, setVideoQuality] = useState<'small' | 'medium' | 'hd720' | 'default'>('default');

  // Connection speed adaptive video resolution detection
  useEffect(() => {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      const updateQuality = () => {
        if (conn.saveData || ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
          setVideoQuality('small'); // 240p/360p lower resolution
        } else if (conn.effectiveType === '4g') {
          if (conn.rtt > 300 || conn.downlink < 2) {
            setVideoQuality('medium'); // 360p/480p medium quality
          } else {
            setVideoQuality('hd720'); // 720p HD quality
          }
        } else {
          setVideoQuality('default'); // Default/Auto quality
        }
      };

      updateQuality();
      if (typeof conn.addEventListener === 'function') {
        conn.addEventListener('change', updateQuality);
        return () => conn.removeEventListener('change', updateQuality);
      }
    }
  }, []);

  // Check if screen is mobile to disable expensive features and make scrolling silky smooth
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Robust, progressive instant autoplay for background video on load
  useEffect(() => {
    // Debug: Log all unique property locations to help diagnose filter issues
    const uniqueLocations = Array.from(new Set(properties.map(p => p.location)));
    console.log("Unique property locations:", uniqueLocations);
    const uniqueTutorLocations = Array.from(new Set(tutors.map(t => t.location)));
    console.log("Unique tutor locations:", uniqueTutorLocations);

    const playVideoImmediately = () => {
      // 1. Send play command to YouTube iframe if it is mounted
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      }
      // 2. Play HTML5 video if it's mounted
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.defaultMuted = true;
        videoRef.current.play().catch(() => {});
      }
    };

    // Run autoplay triggers immediately
    playVideoImmediately();

    // Trigger repeatedly over the first few seconds to account for slower iframe component boot times
    const t1 = setTimeout(playVideoImmediately, 100);
    const t2 = setTimeout(playVideoImmediately, 500);
    const t3 = setTimeout(playVideoImmediately, 1000);
    const t4 = setTimeout(playVideoImmediately, 2000);
    const t5 = setTimeout(playVideoImmediately, 3050);

    // Attach passive gesture listener and scrolling triggers to instantly unlock video state on older mobile browsers
    document.addEventListener('click', playVideoImmediately, { once: true });
    document.addEventListener('touchstart', playVideoImmediately, { once: true });
    document.addEventListener('scroll', playVideoImmediately, { once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      document.removeEventListener('click', playVideoImmediately);
      document.removeEventListener('touchstart', playVideoImmediately);
      document.removeEventListener('scroll', playVideoImmediately);
    };
  }, [heroVideoUrl]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="rounded-full h-14 w-14 border-[3px] border-t-indigo-500 border-indigo-600/30"
        />
        <p className="text-sm font-semibold tracking-wider text-indigo-200">
          {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
        </p>
      </div>
    );
  }
  
  // Filter core lists by selected area to fulfill "সেই লোকেশনের বাসা/মেস, টিটোর লিস্ট আসবে"
  const filteredProperties = properties.filter(p => {
    if (!selectedLocation) return true;
    const propLoc = (p.location || '').toLowerCase().trim();
    const selLoc = selectedLocation.toLowerCase().trim();
    if (propLoc !== selLoc) return false;
    return true;
  });
  const filteredTutors = tutors.filter(t => {
    if (!selectedLocation) return true;
    const tutorLoc = (t.location || '').toLowerCase().trim();
    const selLoc = selectedLocation.toLowerCase().trim();
    if (tutorLoc !== selLoc) return false;
    return true;
  });

  const featuredProperties = filteredProperties.slice(0, 6);
  const featuredTutors = filteredTutors.slice(0, 6);

  const handleSubscribe = (role: 'user' | 'tutor' | 'visitor') => {
    if (currentUser) {
      navigate('/dashboard', { state: { tab: 'subscription' } });
    } else {
      navigate('/login', { state: { fromPricing: true, defaultRole: role } });
    }
  };

  return (
    <div className="pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-10 pb-16 md:pt-32 md:pb-40 overflow-hidden bg-indigo-950 border-b border-indigo-900/60 flex items-center min-h-[55vh] md:min-h-[85vh]">
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Render background video on both desktop and mobile/tablet as requested */}
          {heroVideoUrl ? (
            getYouTubeId(heroVideoUrl) ? (
              <div className="absolute inset-0 w-full h-full opacity-85 md:opacity-65 overflow-hidden pointer-events-none scale-[1.35]">
                <iframe
                  ref={iframeRef}
                  className="absolute top-0 left-0 w-full h-full border-0 pointer-events-none cursor-default"
                  src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(heroVideoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(heroVideoUrl)}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1&vq=${videoQuality}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title="Background YouTube Video"
                />
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                key={heroVideoUrl}
                className="absolute inset-0 w-full h-full object-cover opacity-85 md:opacity-65"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            )
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80" 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-25 mix-blend-overlay"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          )}
          {/* Dual-layer dark overlay to guarantee excellent text readability on smaller viewports */}
          <div className="absolute inset-0 bg-indigo-950/40 md:bg-indigo-950/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/65 md:via-indigo-950/60 to-indigo-950/20"></div>
          
          {/* Optimized static beautiful fluid circle light shapes - Completely prevents rendering bottleneck & scroll lag on desktop/laptop views */}
          <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial={isMobile ? "visible" : "hidden"}
          animate="visible"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 w-full"
        >
          {/* Header Badge */}
          {!selectedLocation && !isMobile && (
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/20 backdrop-blur px-3 py-1.5 rounded-full mb-6 md:mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-indigo-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {t('heroBadgeText')}
              </span>
            </motion.div>
          )}

          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 md:mb-6 leading-tight max-w-4xl mx-auto px-2"
          >
            {t('heroTitle1')} <br className="hidden sm:inline" /> 
            <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-indigo-300 drop-shadow">
              {t('heroTitleAccent')}
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-slate-200/90 max-w-2xl mx-auto font-light leading-relaxed px-4"
          >
            {t('heroSubtitle')}
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-3 md:gap-4 items-center w-full max-w-md mx-auto px-4 sm:px-0"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link 
                to="/rentals" 
                className="flex items-center justify-center w-full px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold rounded-2xl text-indigo-950 bg-white hover:bg-slate-50 shadow-xl shadow-indigo-900/30 transition-all border border-transparent hover:border-slate-100"
              >
                <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600 animate-pulse" />
                {t('heroFindHomeButton')}
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link 
                to="/tutors" 
                className="flex items-center justify-center w-full px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold rounded-2xl text-white bg-indigo-650/80 hover:bg-indigo-600/90 backdrop-blur border border-indigo-500/40 hover:border-indigo-450 shadow-xl shadow-indigo-950/40 transition-all"
              >
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-200" />
                {t('heroFindTutorButton')}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Banner Ad Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <motion.div 
          variants={isMobile ? undefined : containerVariants}
          initial={isMobile ? "visible" : "hidden"}
          whileInView={isMobile ? undefined : "visible"}
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 gap-6"
        >
          {(banners && banners.length > 0 ? [banners[0]] : DEFAULT_BANNERS.slice(0, 1)).map((banner, index) => {
            const hasImage = !!banner.image;

            // Fallback gradients
            let gradientClass = 'bg-gradient-to-r from-slate-750 to-slate-950';
            if (!hasImage) {
              if (banner.gradientFrom && banner.gradientTo) {
                gradientClass = `bg-gradient-to-r from-${banner.gradientFrom} to-${banner.gradientTo}`;
              } else {
                gradientClass = 'bg-gradient-to-r from-teal-500 to-emerald-600 shadow-xl shadow-teal-500/10';
              }
            }

            const isExternal = banner.link && (banner.link.startsWith('http://') || banner.link.startsWith('https://'));
            const linkProps = isExternal 
              ? { href: banner.link, target: '_blank', rel: 'noopener noreferrer' } 
              : { href: banner.link || '#' };

            return (
              <motion.a 
                key={banner.id || `banner-${index}`}
                {...linkProps}
                variants={isMobile ? undefined : itemVariants}
                whileHover={isMobile ? undefined : { 
                  y: -5, 
                  scale: 1.008,
                  boxShadow: '0 20px 35px -8px rgba(59, 130, 246, 0.16)'
                }}
                className="relative block rounded-2xl md:rounded-[1.75rem] overflow-hidden shadow-lg group w-full cursor-pointer border border-slate-200/10 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900"
              >
                {hasImage ? (
                  <div className="w-full aspect-[16/7] sm:aspect-[16/5] md:aspect-[16/4.5] lg:aspect-[16/4] max-h-[180px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[320px] overflow-hidden">
                    <img 
                      src={banner.image} 
                      alt="Advertisement Banner" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.015]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/7] sm:aspect-[16/5] md:aspect-[16/4.5] lg:aspect-[16/4] max-h-[180px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[320px] flex items-center justify-center text-white bg-gradient-to-r from-teal-500 to-emerald-600">
                    <span className="text-sm font-bold tracking-wider opacity-60">
                      {language === 'bn' ? 'বিজ্ঞাপন ব্যানার' : 'Advertisement Banner'}
                    </span>
                  </div>
                )}
                {/* Subtle Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </motion.a>
            );
          })}
        </motion.div>
      </section>

      {/* Featured Rentals Grid with view trigger animations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        {/* Animated & Highly Polished Header Section */}
        <div className="relative mb-12 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              {/* Pulsing Tag Badge */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-500/20 backdrop-blur-sm"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </div>
                <span className="text-xs font-black tracking-wider text-indigo-700 dark:text-indigo-300 uppercase flex items-center gap-1">
                  🏠 {language === 'bn' ? 'বাসা ভাড়া' : 'Rentals'}
                </span>
              </motion.div>

              {/* Title Header with Modern Typography */}
              <motion.h2 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center flex-wrap gap-3"
              >
                <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-indigo-200 bg-clip-text text-transparent">
                  {t('homeNewAds')}
                </span>
                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-black bg-indigo-50/60 dark:bg-indigo-950/60 border border-indigo-100/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-sans">
                  {language === 'bn' ? `মোট: ${properties.length}টি` : `Total: ${properties.length}`}
                </span>
                {selectedLocation && (
                  <motion.span 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center text-xs sm:text-sm font-semibold bg-indigo-600 text-white dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 px-3 py-1 rounded-full shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {LOCATION_NAMES[selectedLocation]?.[language] || selectedLocation}
                  </motion.span>
                )}
              </motion.h2>

              {/* Description Subtitle */}
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium max-w-2xl"
              >
                {t('homeAdsSubtitle')}
              </motion.p>
            </div>

            {/* See All Button with Interactivity */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex-shrink-0"
            >
              <Link 
                to="/rentals" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/85 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all border border-indigo-100/30 dark:border-indigo-500/10 group shadow-sm"
              >
                <span>{t('homeSeeAll')}</span> 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Animated Custom Divider Line (Glow Line + Icon Anchor) */}
          <div className="relative mt-8 h-[2px] w-full bg-slate-100 dark:bg-slate-800/50">
            <motion.div 
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
            />
            {/* Center Glowing Dot/Indicator */}
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 flex items-center justify-center">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600 border-2 border-white dark:border-slate-900 shadow"></span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Animated slide up cells */}
        <motion.div 
          variants={isMobile ? undefined : listGridVariants}
          initial={isMobile ? "visible" : "hidden"}
          whileInView={isMobile ? undefined : "visible"}
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuredProperties.map(p => (
            <motion.div key={p.id} variants={isMobile ? undefined : listCardVariants}>
              <PropertyCard property={p} />
            </motion.div>
          ))}
          
          {featuredProperties.length === 0 && (
            <motion.div 
              variants={fadeInUp}
              className="py-16 px-6 bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center col-span-full"
            >
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('homeNoPropertyFound')}</p>
            </motion.div>
          )}
        </motion.div>


      </section>

      {/* Featured Tutors Grid with viewport trigger animations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        {/* Animated & Highly Polished Header Section */}
        <div className="relative mb-12 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              {/* Pulsing Tag Badge */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-500/20 backdrop-blur-sm"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </div>
                <span className="text-xs font-black tracking-wider text-indigo-700 dark:text-indigo-300 uppercase flex items-center gap-1">
                  🎓 {language === 'bn' ? 'হোম টিউটর' : 'Home Tutors'}
                </span>
              </motion.div>

              {/* Title Header with Modern Typography */}
              <motion.h2 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center flex-wrap gap-3"
              >
                <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-indigo-200 bg-clip-text text-transparent">
                  {t('homeNewTutors')}
                </span>
                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-black bg-pink-50/60 dark:bg-pink-950/60 border border-pink-100/60 dark:border-pink-500/20 text-pink-600 dark:text-pink-400 rounded-xl font-sans">
                  {language === 'bn' ? `মোট: ${tutors.length}টি` : `Total: ${tutors.length}`}
                </span>
                {selectedLocation && (
                  <motion.span 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center text-xs sm:text-sm font-semibold bg-indigo-600 text-white dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 px-3 py-1 rounded-full shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {LOCATION_NAMES[selectedLocation]?.[language] || selectedLocation}
                  </motion.span>
                )}
              </motion.h2>

              {/* Description Subtitle */}
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium max-w-2xl"
              >
                {t('homeTutorsSubtitle')}
              </motion.p>
            </div>

            {/* See All Button with Interactivity */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex-shrink-0"
            >
              <Link 
                to="/tutors" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/85 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all border border-indigo-100/30 dark:border-indigo-500/10 group shadow-sm"
              >
                <span>{t('homeSeeAll')}</span> 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Animated Custom Divider Line (Glow Line + Icon Anchor) */}
          <div className="relative mt-8 h-[2px] w-full bg-slate-100 dark:bg-slate-800/50">
            <motion.div 
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
            />
            {/* Center Glowing Dot/Indicator */}
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 flex items-center justify-center">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600 border-2 border-white dark:border-slate-900 shadow"></span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Animated list cells */}
        <motion.div 
          variants={isMobile ? undefined : listGridVariants}
          initial={isMobile ? "visible" : "hidden"}
          whileInView={isMobile ? undefined : "visible"}
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuredTutors.map(t => (
            <motion.div key={t.id} variants={isMobile ? undefined : listCardVariants}>
              <TutorCard tutor={t} />
            </motion.div>
          ))}
          
          {featuredTutors.length === 0 && (
            <motion.div 
              variants={fadeInUp}
              className="py-16 px-6 bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center col-span-full"
            >
              <p className="text-sm font-bold text-slate-550 dark:text-slate-400">{t('homeNoTutorFound')}</p>
            </motion.div>
          )}
        </motion.div>


      </section>

      {/* Pricing Plans Section */}
      {!currentUser && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-650 dark:text-indigo-455 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full mb-3 inline-block">
              💎 {language === 'bn' ? 'প্যাকেজ সমূহ' : 'Pricing Slots'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{t('planSectionTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{t('planSectionSubtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Visitor Plan */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.12)'
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-[2.5rem] p-8 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all relative group overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/10 via-transparent to-white/10 dark:from-indigo-900/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 relative z-10">
                  {language === 'bn' ? 'সাধারণ ভিজিটর' : 'General Visitor'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 relative z-10 font-medium font-sans">
                  {language === 'bn' ? 'শুধুমাত্র তথ্য খোঁজা ও যোগাযোগ করা' : 'Browse listings & contact numbers'}
                </p>
                
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-6 relative z-10 flex items-baseline">
                  {language === 'bn' ? '৳২৫' : '৳25'}
                  <span className="text-xs font-bold text-slate-550 dark:text-slate-400 ml-1.5">/ {language === 'bn' ? 'মাস' : 'Month'}</span>
                </div>
                
                <ul className="space-y-4 mb-8 relative z-10">
                  <li className="flex items-center text-sm text-slate-705 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> 
                    {language === 'bn' ? 'বাসা ও মেসের ফুল ঠিকানা ও কন্টাক্ট' : 'View all rental addresses & contact numbers'}
                  </li>
                  <li className="flex items-center text-sm text-slate-705 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> 
                    {language === 'bn' ? 'হোম টিউটরদের ডিটেইল ও ফোন নম্বর' : 'Access tutor subject specs & phone numbers'}
                  </li>
                  <li className="flex items-center text-sm text-slate-705 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> 
                    {language === 'bn' ? 'বিজ্ঞাপন প্রকাশ করা যাবে না' : 'Post / Listing creations restricted'}
                  </li>
                  <li className="flex items-center text-sm text-slate-705 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> 
                    {language === 'bn' ? 'সামাজিক পেজ/গ্রুপের ভুয়া তথ্যের পরিবর্তে শতভাগ অথেন্টিক ও এনআইডি (NID) দ্বারা ভেরিফাইড তথ্য পাবেন' : 'Get 100% authentic NID-verified info, completely safer than fake social media posts'}
                  </li>
                </ul>
              </div>

              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubscribe('visitor')} 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-extrabold rounded-2xl relative z-10 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {t('planBtnRegister')}
              </motion.button>
            </motion.div>

            {/* Tutor Plan (Standard active ring and glowing gradient) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                boxShadow: '0 30px 60px -15px rgba(99, 102, 241, 0.25)'
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-2 border-indigo-500 dark:border-indigo-400 rounded-[2.5rem] p-8 relative group overflow-hidden shadow-xl shadow-indigo-500/[0.03] flex flex-col justify-between"
            >
              {/* Soft pulsing halo */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="absolute top-5 right-6 z-20">
                <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-lg shadow-indigo-650/30">
                  {language === 'bn' ? 'টিউটর' : 'Popular'}
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 relative z-10">{t('planTutorTitle')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 relative z-10 font-medium font-sans">{t('planTutorSubtitle')}</p>
                
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-6 relative z-10 flex items-baseline">
                  {t('planTutorPrice')}
                  <span className="text-xs font-bold text-slate-550 dark:text-slate-400 ml-1.5">{t('planTutorPeriod')}</span>
                </div>
                
                <ul className="space-y-4 mb-8 relative z-10">
                  <li className="flex items-center text-sm text-slate-755 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> {t('planTutorFeature1')}
                  </li>
                  <li className="flex items-center text-sm text-slate-755 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> {t('planTutorFeature2')}
                  </li>
                  <li className="flex items-center text-sm text-slate-755 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> {t('planTutorFeature3')}
                  </li>
                  {t('planTutorFeature4') && (
                    <li className="flex items-center text-sm text-slate-755 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> {t('planTutorFeature4')}
                    </li>
                  )}
                </ul>
              </div>

              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubscribe('tutor')} 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-extrabold rounded-2xl relative z-10 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {t('planBtnRegister')}
              </motion.button>
            </motion.div>

            {/* Owner Plan with lift animation */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.12)'
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-[2.5rem] p-8 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all relative group overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/20 via-transparent to-white/10 dark:from-indigo-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 relative z-10">{t('planOwnerTitle')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 relative z-10 font-medium font-sans">{t('planOwnerSubtitle')}</p>
                
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-6 relative z-10 flex items-baseline">
                  {t('planOwnerPrice')}
                  <span className="text-xs font-bold text-slate-550 dark:text-slate-400 ml-1.5">{t('planOwnerPeriod')}</span>
                </div>
                
                <ul className="space-y-4 mb-8 relative z-10">
                  <li className="flex items-center text-sm text-slate-705 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> {t('planOwnerFeature1')}
                  </li>
                  <li className="flex items-center text-sm text-slate-705 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> {t('planOwnerFeature2')}
                  </li>
                  <li className="flex items-center text-sm text-slate-705 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> {t('planOwnerFeature3')}
                  </li>
                  {t('planOwnerFeature4') && (
                    <li className="flex items-center text-sm text-slate-755 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-2.5 shrink-0" /> {t('planOwnerFeature4')}
                    </li>
                  )}
                </ul>
              </div>

              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubscribe('user')} 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-extrabold rounded-2xl relative z-10 shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                {t('planBtnRegister')}
              </motion.button>
            </motion.div>
            
          </div>
        </section>
      )}

    </div>
  );
}
