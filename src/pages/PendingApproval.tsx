import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Clock, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function PendingApproval() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 py-16 flex flex-col items-center selection:bg-indigo-500/30">
      <div className="relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 w-full max-w-lg p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-900/10 transition-all duration-500 text-center overflow-hidden">
        
        {/* Top Glow Decor */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        
        {/* Animated Icon Container */}
        <div className="flex justify-center mb-6 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-full flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/40 shadow-inner"
          >
            <Clock className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="absolute top-12 right-[40%] bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900"
          >
            <CheckCircle2 className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Dynamic Typography and Content based on language context */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {language === 'bn' ? 'রেজিস্ট্রেশন সফল হয়েছে!' : 'Registration Successful!'}
        </h2>
        
        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm mb-6 flex items-center justify-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/20 py-2 px-4 rounded-full max-w-md mx-auto border border-indigo-100/30 dark:border-indigo-900/20">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">{language === 'bn' ? 'অ্যাকাউন্ট বর্তমানে অনুমোদনের অপেক্ষায় রয়েছে' : 'Your account is pending admin approval'}</span>
        </p>

        <div className="space-y-4 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-8 text-justify bg-slate-50/50 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-100 dark:border-transparent">
          {language === 'bn' ? (
            <>
              <p>
                প্রিয় গ্রাহক, আপনার ফর্মটি আমাদের সিস্টেমে সফলভাবে জমা নেওয়া হয়েছে। আপনি যে 
                এনআইডি কার্ডের ছবি এবং পেমেন্ট ট্রানজ্যাকশন আইডি প্রদান করেছেন, তা সিস্টেমে নিবন্ধিত আকর্ষণীয় রেকর্ডে অন্তর্ভুক্ত হয়েছে।
              </p>
              <p>
                সিস্টেম অ্যাডমিন আপনার দেওয়া তথ্য এবং পেমেন্ট মেথড চেক করে 
                খুব শীঘ্রই আপনার অ্যাকাউন্টটি সক্রিয় (Approve) করে দেবেন। সর্বোচ্চ <strong>১০ থেকে ৩০ মিনিট</strong> লাগতে পারে। 
                অনুমোদন সম্পন্ন হওয়ার পর আপনি আপনার ইমেইল ও পাসওয়ার্ড দিয়ে সরাসরি লগইন করে সেবাগুলো উপভোগ করতে পারবেন।
              </p>
            </>
          ) : (
            <>
              <p>
                Dear user, your registration application has been received successfully. The identification files and transaction details you submitted have been saved.
              </p>
              <p>
                A system administrator is currently verifying your payment transaction and NID copies. This verification process typically takes <strong>10 to 30 minutes</strong>.
                Once approved, you will be able to log in with your credentials and enjoy our premium features. Thank you for your patience!
              </p>
            </>
          )}
        </div>

        {/* Interactive Control Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'লগইন পেইজে ফিরে যান' : 'Back to Login Page'}</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/50"
          >
            {language === 'bn' ? 'হোম পেইজে যান' : 'Go to Home Page'}
          </button>
        </div>

        {/* System ID Info */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-6 font-mono">
          SYSTEM REFERENCE: REGISTRATION_APPROVAL_PENDING_SECURE
        </p>
      </div>
    </div>
  );
}
