import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateId, uploadImageToFirebase } from '../lib/utils';
import { FileBadge } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { login, registerUser, users } = useApp();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login Details
  const [email, setEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Details
  const [selectedPlan, setSelectedPlan] = useState<'user' | 'tutor' | 'visitor' | null>(null);
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState<'user' | 'tutor' | 'visitor'>('visitor');
  const [nidFront, setNidFront] = useState<string>('');
  const [nidBack, setNidBack] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | null>(null);
  
  useEffect(() => {
    // If they came from pricing page or came from a subscription lock click, show register
    if (location.state?.fromPricing || location.state?.tab === 'subscription') {
      setIsLogin(false);
      setRegStep(1); // Always start from step 1 (the beginning of the register page)
      if (location.state?.fromPricing) {
        const incomingRole = (location.state?.defaultRole || 'visitor') as 'user' | 'tutor' | 'visitor';
        setRole(incomingRole);
      }
    }
  }, [location]);

  // Smooth scroll to top of window when view toggles or step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isLogin, regStep]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, loginPassword, false);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleFileChangeFront = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const toastId = toast.loading(language === 'bn' ? 'NID ছবি আপলোড হচ্ছে...' : 'Uploading NID front...');
      try {
        const url = await uploadImageToFirebase(file, 'nid_documents');
        setNidFront(url);
        toast.success(language === 'bn' ? 'NID প্রথম পাতা আপলোড সম্পূর্ণ!' : 'NID front uploaded successfully!', { id: toastId });
      } catch (err) {
        console.error("Front NID upload failed:", err);
        toast.error(language === 'bn' ? 'ছবি আপলোডে সমস্যা হয়েছে' : 'Upload failed', { id: toastId });
      }
    }
  };

  const handleFileChangeBack = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const toastId = toast.loading(language === 'bn' ? 'NID ছবি আপলোড হচ্ছে...' : 'Uploading NID back...');
      try {
        const url = await uploadImageToFirebase(file, 'nid_documents');
        setNidBack(url);
        toast.success(language === 'bn' ? 'NID শেষ পাতা আপলোড সম্পূর্ণ!' : 'NID back uploaded successfully!', { id: toastId });
      } catch (err) {
        console.error("Back NID upload failed:", err);
        toast.error(language === 'bn' ? 'ছবি আপলোডে সমস্যা হয়েছে' : 'Upload failed', { id: toastId });
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!paymentMethod) {
      toast.error(language === 'bn' ? 'দয়া করে একটি পেমেন্ট মেথড নির্বাচন করুন' : 'Please select a payment method');
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase().trim() === regEmail.toLowerCase().trim());
    if (emailExists) {
      toast.error(language === 'bn' ? 'এই ইমেইল দিয়ে ইতিমধ্যেই একটি অ্যাকাউন্ট তৈরি করা হয়েছে।' : 'An account with this email already exists.');
      return;
    }

    setIsSubmitting(true);
    const packageLabel = role === 'visitor' ? 'Visitor Package (৳২৫/মাস)' : role === 'tutor' ? 'Tutor Package (৳৫০/মাস)' : 'Owner Package (৳৫০/মাস)';
    const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const registrationPromise = registerUser({
        id: generateId(),
        name: regName,
        email: regEmail,
        password: regPassword,
        role: role,
        nidStatus: role === 'visitor' ? 'unsubmitted' : 'pending',
        nidFrontBase64: nidFront,
        nidBackBase64: nidBack,
        transactionId: transactionId,
        paymentMethod: paymentMethod,
        subscriptionType: packageLabel,
        subscriptionEnd: oneMonthLater
      } as any);

      await toast.promise(registrationPromise as any, {
        loading: language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating account...',
        success: language === 'bn' ? 'রেজিস্ট্রেশন সফল হয়েছে!' : 'Registration successful!',
        error: language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।' : 'Registration failed.'
      });

      setIsSubmitting(false);
      navigate('/pending');
    } catch (err) {
      console.error("Registration error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 w-full max-w-md p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-900/10 transition-colors duration-500 relative overflow-hidden">
        
        {/* Subtle inner top glow for depth */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent dark:via-white/10"></div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
          <button 
            type="button" 
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            onClick={() => setIsLogin(true)}
          >
            {language === 'bn' ? 'লগইন' : 'Login'}
          </button>
          <button 
            type="button" 
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            onClick={() => { setIsLogin(false); setRegStep(1); }}
          >
            {language === 'bn' ? 'রেজিস্টার' : 'Register'}
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" 
                placeholder="Ex: demo@user.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" 
                placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড দিন' : 'Enter your password'}
              />
            </div>
            <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10">
              {language === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Sign In to Dashboard'}
            </button>
          </form>
        ) : regStep === 1 ? (
          <div>
            <h3 className="text-base font-bold mb-5 text-center text-slate-900 dark:text-white">
              {language === 'bn' ? 'অ্যাকাউন্টের ধরণ ও সাবস্ক্রিপশন নির্বাচন করুন' : 'Select Account Type & Subscription'}
            </h3>
            <div className="flex flex-col gap-3.5 w-full">
              {/* Visitor Card */}
              <div 
                onClick={() => { setRole('visitor'); setRegStep(2); }}
                className="p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-4 bg-white dark:bg-slate-950 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group text-left"
              >
                 <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">🔍</div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{language === 'bn' ? 'সাধারণ ভিজিটর' : 'General Visitor'}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{language === 'bn' ? '৳২৫/মাস' : '৳25/Month'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-1">
                      {language === 'bn' ? 'শুধু সাবস্ক্রাইব করে সকল তথ্য ও মোবাইল নম্বর দেখতে পারবেন (কোনো পোস্ট দিতে পারবেন না)। ৫টি ক্যাটাগরির অ্যাক্সেস পাবেন।' : 'View all listing details & contact numbers securely. Cannot post advertisements.'}
                    </p>
                 </div>
              </div>

              {/* Tutor Card */}
              <div 
                onClick={() => { setRole('tutor'); setRegStep(2); }}
                className="p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-4 bg-white dark:bg-slate-950 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group text-left"
              >
                 <div className="w-12 h-12 bg-[#FFF6E9] dark:bg-indigo-950 text-orange-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">👨‍🏫</div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{language === 'bn' ? 'হোম টিউটর (পোস্ট+উইজার)' : 'Home Tutor (Post & View)'}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{language === 'bn' ? '৳৫০/মাস' : '৳50/Month'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-1">
                      {language === 'bn' ? 'নিজের টিউটর প্রোফাইল তৈরি ও প্রকাশ করতে পারবেন এবং শিক্ষার্থীদের সরাসরি কন্টাক্ট নম্বর ও ঠিকানা দেখতে পারবেন।' : 'Create professional tutor profile, list subjects/education, plus view all matches.'}
                    </p>
                 </div>
              </div>

              {/* Owner Card */}
              <div 
                onClick={() => { setRole('user'); setRegStep(2); }}
                className="p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-4 bg-white dark:bg-slate-950 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group text-left"
              >
                 <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">🏠</div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{language === 'bn' ? 'প্রপার্টি মালিক (পোস্ট+উইজার) ' : 'Property Owner (Post & View)'}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{language === 'bn' ? '৳৫০/মাস' : '৳50/Month'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-1">
                      {language === 'bn' ? 'আপনার ফ্ল্যাট, মেস বা সিটের আনলিমিটেড পোস্ট/বিজ্ঞাপন দিতে পারবেন এবং সকল প্রপার্টি পরিচালনা ও ভিউ করতে পারবেন।' : 'Post unlimited listings for flats, messes, seats, with full listing controls.'}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'bn' ? 'সম্পূর্ণ নাম' : 'Full Name'}
              </label>
              <input required type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <input required type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <input required type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'অ্যাকাউন্টের ধরন:' : 'Account Type:'} <strong className="text-indigo-600 dark:text-indigo-400">
                  {role === 'visitor' ? (language === 'bn' ? 'সাধারণ ভিজিটর' : 'General Visitor') : role === 'tutor' ? (language === 'bn' ? 'হোম টিউটর' : 'Home Tutor') : (language === 'bn' ? 'প্রপার্টি মালিক / সাধারণ' : 'Property Owner / Standard')}
                </strong>
              </span>
              <button type="button" onClick={() => setRegStep(1)} className="text-xs text-indigo-600 hover:underline font-bold">{language === 'bn' ? 'পরিবর্তন' : 'Change'}</button>
            </div>
            {role !== 'visitor' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 mt-4">
                  {language === 'bn' ? 'পরিচয় যাচাইকরণ' : 'Identity Verification'} <span className="text-xs text-red-500">*</span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl relative hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                    <div className="space-y-1 text-center">
                      {!nidFront ? (
                        <>
                          <FileBadge className="mx-auto h-10 w-10 text-slate-400" />
                          <div className="flex text-xs text-slate-600 dark:text-slate-400 mt-2">
                            <label htmlFor="file-upload-front" className="relative cursor-pointer rounded-md font-bold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 hover:text-indigo-500">
                              <span>{language === 'bn' ? 'এনআইডি সামনের ছবি' : 'NID Front Photo'}</span>
                              <input id="file-upload-front" name="file-upload-front" type="file" className="sr-only" onChange={handleFileChangeFront} accept="image/*" required={role !== 'visitor'} />
                            </label>
                          </div>
                          <p className="text-[10px] text-slate-500">Upload front part</p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-16 bg-indigo-100 rounded flex items-center justify-center text-indigo-700 overflow-hidden">
                             <img src={nidFront} className="object-cover w-full h-full" alt="NID Front" referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-xs text-indigo-600 font-semibold mt-2">{language === 'bn' ? 'ফাইল প্রস্তুত' : 'File ready'}</span>
                          <button type="button" onClick={() => setNidFront('')} className="text-xs text-red-500 mt-1">{language === 'bn' ? 'রিমুভ' : 'Remove'}</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl relative hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                    <div className="space-y-1 text-center">
                      {!nidBack ? (
                        <>
                          <FileBadge className="mx-auto h-10 w-10 text-slate-400" />
                          <div className="flex text-xs text-slate-600 dark:text-slate-400 mt-2">
                            <label htmlFor="file-upload-back" className="relative cursor-pointer rounded-md font-bold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 hover:text-indigo-500">
                              <span>{language === 'bn' ? 'এনআইডি পিছনের ছবি' : 'NID Back Photo'}</span>
                              <input id="file-upload-back" name="file-upload-back" type="file" className="sr-only" onChange={handleFileChangeBack} accept="image/*" required={role !== 'visitor'} />
                            </label>
                          </div>
                          <p className="text-[10px] text-slate-500">Upload back part</p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-16 bg-indigo-100 rounded flex items-center justify-center text-indigo-700 overflow-hidden">
                             <img src={nidBack} className="object-cover w-full h-full" alt="NID Back" referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-xs text-indigo-600 font-semibold mt-2">{language === 'bn' ? 'ফাইল প্রস্তুত' : 'File ready'}</span>
                          <button type="button" onClick={() => setNidBack('')} className="text-xs text-red-500 mt-1">{language === 'bn' ? 'রিমুভ' : 'Remove'}</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-slate-50 dark:bg-slate-900 border-2 border-indigo-100 dark:border-slate-800 p-4 sm:p-5 rounded-2xl mt-5 shadow-sm">
              <motion.div 
                className="text-center mb-4"
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <h4 className="inline-block text-base sm:text-lg font-black text-red-600 dark:text-red-500 relative pb-1 tracking-wide">
                  {language === 'bn' ? '🔒 পেমেন্ট কমপ্লিট করুন' : '🔒 Complete Payment'}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></span>
                </h4>
              </motion.div>
              
              <div className="bg-white dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 mb-4 text-center">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 flex-wrap">
                  <span>{language === 'bn' ? 'পেমেন্ট মেথড সিলেক্ট করুন। সাবস্ক্রিপশন ফি:' : 'Select payment method. Subscription Fee:'}</span>
                  <span className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                    {role === 'visitor' ? (language === 'bn' ? '৳২৫ / মাস' : '৳25 / Month') : (language === 'bn' ? '৳৫০ / মাস' : '৳50 / Month')}
                  </span>
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                 <button type="button" onClick={() => setPaymentMethod('bkash')} className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none ${paymentMethod === 'bkash' ? 'bg-[#DF146E] text-white shadow-md shadow-[#DF146E]/30 ring-2 ring-[#DF146E] ring-offset-1 dark:ring-offset-slate-900 scale-[1.02]' : 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#DF146E] hover:text-[#DF146E]'}`}>
                   <img src="/bkash.png" alt="bKash" className="h-5 sm:h-6 w-auto object-contain" referrerPolicy="no-referrer" />
                   <span>{language === 'bn' ? 'বিকাশ' : 'bKash'}</span>
                 </button>
                 <button type="button" onClick={() => setPaymentMethod('nagad')} className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none ${paymentMethod === 'nagad' ? 'bg-[#EC2227] text-white shadow-md shadow-[#EC2227]/30 ring-2 ring-[#EC2227] ring-offset-1 dark:ring-offset-slate-900 scale-[1.02]' : 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#EC2227] hover:text-[#EC2227]'}`}>
                   <img src="/nagad.png" alt="Nagad" className="h-5 sm:h-6 w-auto object-contain" referrerPolicy="no-referrer" />
                   <span>{language === 'bn' ? 'নগদ' : 'Nagad'}</span>
                 </button>
                 <button type="button" onClick={() => setPaymentMethod('rocket')} className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none ${paymentMethod === 'rocket' ? 'bg-[#8C3494] text-white shadow-md shadow-[#8C3494]/30 ring-2 ring-[#8C3494] ring-offset-1 dark:ring-offset-slate-900 scale-[1.02]' : 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#8C3494] hover:text-[#8C3494]'}`}>
                   <img src="/rocket.png" alt="Rocket" className="h-5 sm:h-6 w-auto object-contain" referrerPolicy="no-referrer" />
                   <span>{language === 'bn' ? 'রকেট' : 'Rocket'}</span>
                 </button>
              </div>

              {paymentMethod && (
                 <div className="mb-4 text-xs font-semibold text-slate-700 dark:text-slate-350 p-3 sm:p-3.5 bg-indigo-50/80 dark:bg-indigo-950/30 rounded-xl border border-indigo-100/70 dark:border-indigo-900/55 leading-normal">
                    <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-1.5">
                      {language === 'bn' ? (
                        <>নিচের নাম্বারে 🔀 <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs sm:text-sm">{paymentMethod === 'bkash' ? 'বিকাশ' : paymentMethod === 'nagad' ? 'নগদ' : 'রকেট'} (Personal)</strong> সেন্ড মানি করুন:</>
                      ) : (
                        <>Send money (Personal) via 🔀 <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs sm:text-sm">{paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'}</strong> to:</>
                      )}
                    </p>
                    <div className="flex items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100/50 dark:border-indigo-950/80">
                      <p className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-wider select-all font-mono">০১৪০১৯৯৬৬৭৪</p>
                      <button 
                        type="button" 
                        onClick={() => {
                          navigator.clipboard.writeText('01401996674');
                          toast.success(language === 'bn' ? 'নাম্বার কপি করা হয়েছে!' : 'Number copied!');
                        }}
                        className="shrink-0 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 rounded-md hover:bg-indigo-100 transition-colors"
                      >
                        {language === 'bn' ? 'কপি' : 'Copy'}
                      </button>
                    </div>
                 </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  {language === 'bn' ? 'ট্রানজ্যাকশন আইডি (Transaction ID) বসান' : 'Enter Transaction ID'}
                </label>
                <input required type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} disabled={!paymentMethod} className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold tracking-wider placeholder:tracking-normal" placeholder={language === 'bn' ? 'যেমন: 8XDF1A384P' : 'Ex: 8XDF1A384P'} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (language === 'bn' ? 'অনুগ্রহ করে অপেক্ষা করুন...' : 'Processing, Please Wait...') 
                : (language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
