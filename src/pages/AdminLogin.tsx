import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error('দয়া করে ইমেইল ও পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = login(cleanEmail, cleanPassword, true);
      if (success) {
        toast.success('এডমিন প্যানেলে স্বাগতম!');
        navigate('/dashboard');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      
      {/* Radial glow background overlays for rich gradient depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.2),transparent_60%)] pointer-events-none"></div>

      {/* Decorative floating blurred animated glow orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 sm:w-96 sm:h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none animate-float"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 sm:w-96 sm:h-96 bg-violet-600/30 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        
        {/* Main Glassmorphic Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-indigo-500/20 shadow-2xl shadow-indigo-950/60 transition-all">
          
          {/* Header Badge & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 mb-4 relative group">
              <ShieldCheck className="w-8 h-8" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              এডমিন সিকিউর পোর্টাল
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
              বাসাভাড়া ও টিউটর প্ল্যাটফর্ম অ্যাডমিন কন্ট্রোল প্যানেল
            </p>

            {/* Security Notice Badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-inner">
              <Lock className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span>শুধুমাত্র অথরাইজড সিস্টেম এডমিনদের জন্য</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                এডমিন ইমেইল এড্রেস
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/80 bg-slate-800/80 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-500 text-sm shadow-inner" 
                  placeholder="ইমেইল এড্রেস প্রদান করুন"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                এডমিন পাসওয়ার্ড
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-700/80 bg-slate-800/80 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-500 text-sm shadow-inner" 
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center text-xs">
            <Link 
              to="/" 
              className="text-slate-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোম পেইজে ফিরে যান</span>
            </Link>
          </div>

        </div>

        {/* Footer Credit Tag */}
        <p className="text-center text-slate-500 text-[11px] mt-6 font-medium">
          © {new Date().getFullYear()} Basavara Admin System • All rights reserved.
        </p>

      </div>
    </div>
  );
}
