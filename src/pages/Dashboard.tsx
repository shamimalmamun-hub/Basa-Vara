import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { ShieldCheck, PlusCircle, CreditCard, LayoutDashboard, CheckCircle2, UserCircle, Settings, Megaphone, Upload, X, Image, Video, AlertTriangle, RefreshCw, Check, AlertCircle, XCircle, Send, Eye, Globe, Users, FileText } from 'lucide-react';
import { MAIN_LOCATIONS, PROPERTY_TYPES, generateId, compressImage } from '../lib/utils';
import { Property, Tutor, Invoice, User } from '../types';
import ManageBanners from '../components/ManageBanners';
import ManageVideo from '../components/ManageVideo';
import ManageHomepage from '../components/ManageHomepage';
import ManagePosts from '../components/ManagePosts';

export default function Dashboard() {
  const { currentUser, users, properties, tutors, invoices, addProperty, updateProperty, deleteProperty, addTutor, updateTutor, deleteTutor, addInvoice, updateUserNID, updateProfile, updateSubscription, deleteUser, apiUrl, updateApiUrl, sendRenewalEmailManual, approveSubscriptionRenewal, rejectSubscriptionRenewal, visitors } = useApp();
  const nonAdminVisitors = (visitors || []).filter(v => v.role !== 'admin');
  const { language } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [userFilter, setUserFilter] = useState<'all' | 'pending-renew' | 'pending-nid' | 'pending-approval' | 'user' | 'tutor' | 'visitor'>('all');
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null);
  const [inputApiUrl, setInputApiUrl] = useState('');

  // Real-time visitor calculations
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const nowMs = currentTime;
  const activeVisitorsList = nonAdminVisitors.filter(v => {
    try {
      return v.status === 'online' && (Math.abs(nowMs - new Date(v.lastActive).getTime()) <= 30000); // 30 seconds threshold with clock-skew safety
    } catch {
      return false;
    }
  });

  const activeHomepageVisitorsCount = activeVisitorsList.filter(v => v.currentPage === '/').length;
  const totalUniqueVisitorsCount = nonAdminVisitors.length;

  useEffect(() => {
    if (apiUrl) {
      setInputApiUrl(apiUrl);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';
  const isTutor = currentUser.role === 'tutor';
  
  const now = new Date();
  const end = currentUser?.subscriptionEnd ? new Date(currentUser.subscriptionEnd) : null;
  const isExpired = !isAdmin && end ? end <= now : false;
  const daysRemaining = end && !isExpired ? Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const showRenewalWarning = !isAdmin && end && !isExpired && (end.getTime() - now.getTime()) <= 3 * 24 * 60 * 60 * 1000;
  const isSubscribed = !isExpired;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 overflow-hidden">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-8 h-8" />
            )}
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</h3>
          <p className="text-sm text-slate-500 capitalize">
            {currentUser.role === 'user' ? 'প্রপার্টি মালিক' : currentUser.role === 'tutor' ? 'টিউটর' : currentUser.role === 'visitor' ? 'সাধারণ ভিজিটর' : 'এডমিন'}
          </p>
          {currentUser.role !== 'visitor' && !isAdmin && (
            <div className={`mt-3 inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${currentUser.nidStatus === 'verified' ? 'bg-indigo-100 text-indigo-700' : currentUser.nidStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              NID: {currentUser.nidStatus === 'verified' ? 'যাচাইকৃত' : currentUser.nidStatus === 'pending' ? 'অপেক্ষমাণ' : 'বাতিল'}
            </div>
          )}
        </div>

        <button onClick={() => setActiveTab('overview')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <LayoutDashboard className="w-5 h-5 mr-3" /> ওভারভিউ
        </button>

        {isAdmin && (
          <>
            <button onClick={() => setActiveTab('nid-verify')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'nid-verify' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <ShieldCheck className="w-5 h-5 mr-3" /> এনআইডি যাচাই
            </button>
            <button onClick={() => setActiveTab('manage-users')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'manage-users' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <UserCircle className="w-5 h-5 mr-3" /> ইউজার ম্যানেজমেন্ট
            </button>
            <button onClick={() => setActiveTab('admin-add-content')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'admin-add-content' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <PlusCircle className="w-5 h-5 mr-3" /> নতুন পোস্ট যুক্ত করুন
            </button>
            <button onClick={() => setActiveTab('manage-posts')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'manage-posts' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <FileText className="w-5 h-5 mr-3" /> পোস্টসমূহ নিয়ন্ত্রণ
            </button>
            <button onClick={() => setActiveTab('manage-banners')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'manage-banners' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <Megaphone className="w-5 h-5 mr-3" /> বিজ্ঞাপন ও ব্যানার
            </button>
            <button onClick={() => setActiveTab('manage-video')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'manage-video' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <Video className="w-5 h-5 mr-3" /> ব্যাকগ্রাউন্ড ভিডিও
            </button>
            <button onClick={() => setActiveTab('manage-homepage')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'manage-homepage' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <Settings className="w-5 h-5 mr-3" /> হোমপেইজ এডিটর (Admin)
            </button>
          </>
        )}

        {currentUser.nidStatus === 'verified' && !isAdmin && currentUser.role !== 'visitor' && (
          <button onClick={() => setActiveTab('add-content')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'add-content' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <PlusCircle className="w-5 h-5 mr-3" /> {isTutor ? 'টিউটর প্রোফাইল তৈরি' : 'প্রপার্টি যোগ করুন'}
          </button>
        )}

        {!isAdmin && (
          <button onClick={() => setActiveTab('subscription')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'subscription' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <CreditCard className="w-5 h-5 mr-3" /> সাবস্ক্রিপশন
          </button>
        )}

        <button onClick={() => setActiveTab('profile')} className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <Settings className="w-5 h-5 mr-3" /> প্রোফাইল সেটিংস
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
            {/* Main Stats / Welcome */}
            <div className={`col-span-1 ${isAdmin ? 'md:col-span-12' : 'md:col-span-8'} bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col`}>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">ড্যাশবোর্ড ওভারভিউ</h2>
              {isAdmin ? (
                 <div className="flex flex-col gap-6 w-full">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                     <StatCard title="মোট ব্যবহারকারী" value={users.length} />
                     <StatCard title="অ্যাক্টিভ পেইড প্ল্যান" value={invoices.filter(i => i.status === 'paid').length} />
                     <StatCard title="মোট প্রপার্টি" value={properties.length} />
                     <StatCard title="অপেক্ষমাণ এনআইডি" value={users.filter(u => u.nidStatus === 'pending').length} />
                     
                     <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center relative overflow-hidden flex flex-col justify-center min-h-[110px]">
                       <div className="absolute top-2 right-2 flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                       </div>
                       <h4 className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1">
                         <Users className="w-3.5 h-3.5 shrink-0" /> মোট ভিজিটরস
                       </h4>
                       <p className="text-2xl font-extrabold mt-2 text-emerald-900 dark:text-emerald-250">{totalUniqueVisitorsCount}</p>
                     </div>

                     <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-center relative overflow-hidden flex flex-col justify-center min-h-[110px]">
                       <div className="absolute top-2 right-2 flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-550"></span>
                       </div>
                       <h4 className="text-indigo-700 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center gap-1">
                         <Eye className="w-3.5 h-3.5 shrink-0" /> হোমপেইজে রানিং
                       </h4>
                       <p className="text-2xl font-extrabold mt-2 text-indigo-900 dark:text-indigo-250">{activeHomepageVisitorsCount}</p>
                     </div>
                   </div>

                   <div className="mt-4 border-t border-slate-205 dark:border-slate-800 pt-6">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                       <div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                           ভিজিটরদের রিয়েল-টাইম উপস্থিতি (Presence Tracker)
                         </h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                           গত ৩ সেকেন্ডের মধ্যে ওয়েবসাইটে সক্রিয় থাকা ইউজার ও ভিজিটরদের লাইভ অবস্থান
                         </p>
                       </div>
                       <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-bold self-start sm:self-center">
                         মোট ট্র্যাকড ডিভাইস: {totalUniqueVisitorsCount}
                       </span>
                     </div>

                     <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-950/20 shadow-sm">
                       <table className="w-full text-left text-sm border-collapse">
                         <thead>
                           <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold selection:bg-transparent">
                             <th className="p-4 text-xs font-semibold uppercase tracking-wider">ভিজিটর / ব্যবহারকারী</th>
                             <th className="p-4 text-xs font-semibold uppercase tracking-wider">ভূমিকা (Role)</th>
                             <th className="p-4 text-xs font-semibold uppercase tracking-wider font-mono">চলতি পেইজ</th>
                             <th className="p-4 text-xs font-semibold uppercase tracking-wider">ডিভাইস ও ব্রাউজার</th>
                             <th className="p-4 text-xs font-semibold uppercase tracking-wider">স্পন্দন টাইম</th>
                             <th className="p-4 text-xs font-semibold uppercase tracking-wider text-center">অবস্থা</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                           {!nonAdminVisitors || nonAdminVisitors.length === 0 ? (
                             <tr>
                               <td colSpan={6} className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                                 কোনো সক্রিয় ভিজিটর হিস্ট্রি নেই।
                               </td>
                             </tr>
                           ) : (
                             [...nonAdminVisitors]
                               .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
                               .slice(0, 10)
                               .map(v => {
                                 const isOnline = v.status === 'online' && (Math.abs(nowMs - new Date(v.lastActive).getTime()) <= 30000);
                                 const lastActiveDate = new Date(v.lastActive);
                                 const lastActiveStr = lastActiveDate.toLocaleTimeString();

                                 return (
                                   <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-300 transition-colors">
                                     <td className="p-4">
                                       <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                         <UserCircle className="w-4 h-4 text-indigo-505 shrink-0" />
                                         <span className="truncate max-w-[150px]">{v.name || 'অতিথি (Guest)'}</span>
                                       </div>
                                       <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{v.id}</span>
                                     </td>
                                     <td className="p-4">
                                       <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                                         v.role === 'admin' 
                                           ? 'bg-red-50 dark:bg-red-950/30 text-red-750 dark:text-red-400 border border-red-105 dark:border-red-900/40' 
                                           : v.role === 'tutor' 
                                             ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-755 dark:text-blue-400 border border-blue-105 dark:border-blue-900/40' 
                                             : v.role === 'user' 
                                               ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-755 dark:text-indigo-400 border border-indigo-105 dark:border-indigo-900/40' 
                                               : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                       }`}>
                                         {v.role === 'admin' ? 'এডমিন' : v.role === 'tutor' ? 'টিউটর' : v.role === 'user' ? 'প্রপার্টি মালিক' : 'সাধারণ ভিজিটর'}
                                       </span>
                                     </td>
                                     <td className="p-4">
                                       <span className="font-mono text-xs text-indigo-705 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/35">
                                         {v.currentPage === '/' ? 'হোম পেইজ (/)' : v.currentPage}
                                       </span>
                                     </td>
                                     <td className="p-4 text-xs text-slate-550 dark:text-slate-400">
                                       {v.deviceInfo || 'Unknown Device'}
                                     </td>
                                     <td className="p-4 text-xs text-slate-600 dark:text-slate-350 font-medium">
                                       {lastActiveStr}
                                     </td>
                                     <td className="p-4">
                                       <div className="flex items-center gap-1.5 justify-center">
                                         <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                         <span className={`text-[11px] font-bold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                           {isOnline ? 'অনলাইন' : 'অফলাইন'}
                                         </span>
                                       </div>
                                     </td>
                                   </tr>
                                 );
                               })
                           )}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 </div>
              ) : (
                 <div className="text-slate-600 dark:text-slate-400 space-y-4 flex-1">
                   <p className="font-semibold text-lg">বাসা-ভাড়া প্ল্যাটফর্মে আপনাকে স্বাগতম!</p>

                   {showRenewalWarning && (
                     <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-5 text-amber-950 dark:text-amber-350 flex gap-3 items-start animate-pulse shadow-sm">
                       <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                       <div>
                         <p className="font-extrabold text-base">
                           {language === 'bn' ? 'সাবস্ক্রিপশনের মেয়াদ শেষ হচ্ছে!' : 'Subscription Expiring Soon!'}
                         </p>
                         <p className="text-sm mt-1 leading-relaxed">
                           {language === 'bn' 
                             ? `আপনার সাবস্ক্রিপশন মেয়াদ আগামী ${daysRemaining} দিনের মধ্যে শেষ হয়ে যাবে। নিরবচ্ছিন্ন সেবা উপভোগ করতে এখনই সাবস্ক্রিপশন নবায়ন করুন।` 
                             : `Your subscription will expire in ${daysRemaining} days. Kindly renew your subscription to avoid any disruptions.`}
                         </p>
                         <button onClick={() => setActiveTab('subscription')} className="mt-3 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-lg transition-colors shadow-sm">
                           {language === 'bn' ? 'এখনই নবায়ন (Renew) করুন' : 'Renew Now'}
                         </button>
                       </div>
                     </div>
                   )}

                   {isExpired && !isAdmin && (
                     <div className="bg-rose-500/10 border-2 border-rose-300 dark:border-rose-900 rounded-2xl p-5 text-rose-950 dark:text-rose-400 flex gap-3 items-start shadow-sm">
                       <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                       <div>
                         <p className="font-extrabold text-base">
                           {language === 'bn' ? 'সাবস্ক্রিপশন মেয়াদোত্তীর্ণ!' : 'Subscription Expired!'}
                         </p>
                         <p className="text-sm mt-1 leading-relaxed">
                           {language === 'bn' 
                             ? 'আপনার সাবস্ক্রিপশনের ১ মাসের মেয়াদ শেষ হয়ে গেছে। দয়া করে পুনরায় সাবস্ক্রিপশন ফি পরিশোধ করে সেবাটি সচল বা রিনিউ করুন।' 
                             : 'Your 1-month subscription has expired. Please renew your subscription to restore your access to premium features.'}
                         </p>
                         <button onClick={() => setActiveTab('subscription')} className="mt-3 px-4 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg transition-colors shadow-sm">
                           {language === 'bn' ? 'সাবস্ক্রিপশন রিনিউ করুন' : 'Subscribe/Renew Now'}
                         </button>
                       </div>
                     </div>
                   )}
                   {currentUser.role === 'visitor' ? (
                     <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 text-indigo-800 dark:text-indigo-400 mt-4 leading-relaxed font-normal text-sm">
                       🎉 <strong className="font-extrabold text-indigo-950 dark:text-white">অভিনন্দন!</strong> আপনি একজন সাধারণ ভিজিটর হিসেবে প্ল্যাটফর্মে সক্রিয় আছেন।
                       <br /><br />
                       আপনার অ্যাকাউন্ট সম্পূর্ণ সচল রয়েছে (সাধারণ ভিজিটরদের কোনো এনআইডি ভেরিফিকেশনের প্রয়োজন নেই)। এখন আপনি হোম পেইজের যেকোনো প্রপার্টি মালিক বা হোম টিউটরের সাথে সরাসরি যোগাযোগ করতে পারবেন এবং বাসা বা মেসের মোবাইল নাম্বার দেখতে পাবেন!
                     </div>
                   ) : (
                     <>
                       {currentUser.nidStatus === 'pending' && (
                         <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-amber-800 dark:text-amber-400 mt-4">
                           আপনার এনআইডি যাচাইয়ের অপেক্ষায় আছে। ভেরিফাই হলে আপনি বিজ্ঞাপন দিতে পারবেন।
                         </div>
                       )}
                     </>
                   )}
                   {currentUser.nidStatus === 'verified' && (
                     <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-indigo-800 dark:text-indigo-400 flex items-center mt-4">
                       <CheckCircle2 className="w-5 h-5 mr-2" /> আপনার আইডি ভেরিফাই সম্পন্ন হয়েছে। বিজ্ঞাপন দিতে মেনু ব্যবহার করুন।
                     </div>
                   )}
                 </div>
              )}
            </div>

            {/* Profile Status Bento Box */}
            {!isAdmin && (
              <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/40 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">প্রোফাইল স্ট্যাটাস</h3>
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="bg-white dark:bg-slate-950/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-transparent">
                    <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">এনআইডি স্ট্যাটাস</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{currentUser.nidStatus === 'verified' ? 'যাচাইকৃত' : currentUser.nidStatus}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-950/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-transparent min-w-0">
                    <div className="bg-amber-100 dark:bg-amber-500/20 p-2 rounded-lg shrink-0">
                      <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-visible">
                      <p className="text-xs text-slate-500">{language === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান' : 'Subscription'}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-normal break-words overflow-visible block w-full">
                        {currentUser.subscriptionType || (language === 'bn' ? 'সক্রিয় প্ল্যান নেই' : 'No Active Plan')}
                      </p>
                      {currentUser.subscriptionEnd && (
                        <p className={`text-[10px] mt-0.5 font-semibold whitespace-normal break-words overflow-visible block w-full ${isExpired ? 'text-red-500 animate-pulse' : 'text-slate-505 dark:text-indigo-300'}`}>
                          {isExpired 
                            ? (language === 'bn' ? 'মেয়াদ শেষ (Expired)' : 'Expired') 
                            : (language === 'bn' 
                                ? `মেয়াদ: ${new Date(currentUser.subscriptionEnd).toLocaleDateString('bn-BD')}` 
                                : `Expires: ${new Date(currentUser.subscriptionEnd).toLocaleDateString()}`)
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Bento Box */}
            <div className={`col-span-1 ${currentUser?.role === 'visitor' ? 'md:col-span-12' : 'md:col-span-8'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6`}>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">সাম্প্রতিক অ্যাক্টিভিটি</h3>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm border-l-2 border-indigo-500 pl-3">
                  <div className="flex-1 text-slate-600 dark:text-slate-300">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">সিস্টেম</span> বাসা-ভাড়া প্ল্যাটফর্মে আপনাকে স্বাগতম!
                    <p className="text-[10px] text-slate-500 mt-1">এইমাত্র</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions / Location Switcher Bento */}
            {currentUser?.role !== 'visitor' && (
              <div className="col-span-1 md:col-span-4 bg-indigo-600 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-white font-bold leading-tight text-xl">আপনার <br/>লিস্টিং পরিচালনা করুন</h3>
                </div>
                <div className="mt-8 relative z-10">
                  <button onClick={() => setActiveTab(isAdmin ? 'admin-add-content' : 'add-content')} className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl backdrop-blur transition-colors w-full text-left flex justify-between items-center">
                    নতুন যোগ করুন <span>&rarr;</span>
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl"></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nid-verify' && isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">এনআইডি যাচাইয়ের অনুরোধ</h2>
            <div className="space-y-4">
              {users.filter(u => u.nidStatus === 'pending').map(user => (
                <div key={user.id} className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-5 border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900 shadow-sm animate-fade-in">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {user.name} 
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full capitalize">{user.role === 'user' ? 'প্রপার্টি মালিক' : 'টিউটর'}</span>
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                    
                    {/* Display both NID Front and NID Back side-by-side in verification panel */}
                    <div className="flex gap-4 mt-3">
                      {user.nidFrontBase64 && (
                        <div className="flex-1 max-w-[140px] text-center">
                          <span className="text-[10px] text-slate-500 font-semibold block mb-1">সামনের দিক</span>
                          <img src={user.nidFrontBase64} alt="NID Front" className="h-20 w-full object-cover rounded border border-slate-300 dark:border-slate-700 shadow-sm cursor-pointer hover:opacity-85 transition-opacity" onClick={() => window.open(user.nidFrontBase64, '_blank')} />
                        </div>
                      )}
                      {user.nidBackBase64 && (
                        <div className="flex-1 max-w-[140px] text-center">
                          <span className="text-[10px] text-slate-500 font-semibold block mb-1">পেছনের দিক</span>
                          <img src={user.nidBackBase64} alt="NID Back" className="h-20 w-full object-cover rounded border border-slate-300 dark:border-slate-700 shadow-sm cursor-pointer hover:opacity-85 transition-opacity" onClick={() => window.open(user.nidBackBase64, '_blank')} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateUserNID(user.id, 'verified')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow transition-all cursor-pointer">অনুমোদন করুন (Approve)</button>
                    <button onClick={() => updateUserNID(user.id, 'rejected')} className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400 rounded-xl text-sm font-semibold transition-all cursor-pointer">বাতিল করুন (Reject)</button>
                  </div>
                </div>
              ))}
              {users.filter(u => u.nidStatus === 'pending').length === 0 && <p className="text-slate-500">কোনো অপেক্ষমাণ অনুরোধ নেই।</p>}
            </div>
          </div>
        )}

        {activeTab === 'manage-users' && isAdmin && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ব্যবহারকারী ম্যানেজমেন্ট</h2>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                মোট ব্যবহারকারী: {users.length} | অপেক্ষমাণ রিনিউয়াল: {users.filter(u => u.pendingRenewStatus === 'pending').length}
              </div>
            </div>

            {/* User Filters Pills Bar */}
            <div className="flex flex-wrap gap-2 mb-6 p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-155 dark:border-slate-800 rounded-2xl">
              {[
                { id: 'all', label: 'সব ব্যবহারকারী', count: users.length },
                { id: 'pending-renew', label: 'অপেক্ষমাণ রিনিউয়াল', count: users.filter(u => u.pendingRenewStatus === 'pending').length, highlight: true },
                { id: 'pending-nid', label: 'অপেক্ষমাণ এনআইডি', count: users.filter(u => u.nidStatus === 'pending').length },
                { id: 'pending-approval', label: 'অপেক্ষমাণ সাইনআপ', count: users.filter(u => !u.isApproved && u.role !== 'admin').length },
                { id: 'user', label: 'প্রপার্টি মালিক', count: users.filter(u => u.role === 'user').length },
                { id: 'tutor', label: 'টিউটর', count: users.filter(u => u.role === 'tutor').length },
                { id: 'visitor', label: 'ভিজিটর', count: users.filter(u => u.role === 'visitor').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setUserFilter(tab.id as any)}
                  className={`px-3-5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    userFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 scale-[1.01]'
                      : tab.highlight && tab.count > 0
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 font-extrabold animate-pulse'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${userFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {users
                .filter(user => {
                  if (userFilter === 'all') return true;
                  if (userFilter === 'pending-renew') return user.pendingRenewStatus === 'pending';
                  if (userFilter === 'pending-nid') return user.nidStatus === 'pending';
                  if (userFilter === 'pending-approval') return !user.isApproved && user.role !== 'admin';
                  if (userFilter === 'user') return user.role === 'user';
                  if (userFilter === 'tutor') return user.role === 'tutor';
                  if (userFilter === 'visitor') return user.role === 'visitor';
                  return true;
                })
                .map(user => (
                <div key={user.id} className="flex flex-col md:flex-row justify-between md:items-start gap-4 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-2 text-lg">
                      {user.name} 
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-1 rounded-full capitalize">{user.role === 'user' ? 'প্রপার্টি মালিক' : user.role === 'tutor' ? 'টিউটর' : user.role === 'visitor' ? 'সাধারণ ভিজিটর' : 'এডমিন'}</span>
                    </h4>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <p><span className="font-extrabold text-slate-950 dark:text-white">ইমেইল:</span> {user.email}</p>
                      <p><span className="font-extrabold text-slate-950 dark:text-white">পাসওয়ার্ড:</span> <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-700 dark:text-slate-300">{user.password || 'N/A'}</span></p>
                      {user.role !== 'admin' && (
                        <p>
                          <span className="font-extrabold text-slate-950 dark:text-white">ট্রানজ্যাকশন আইডি:</span>{' '}
                          <span className="font-mono font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded select-all shadow-sm">
                            {user.transactionId || 'N/A'}
                          </span>
                        </p>
                      )}
                      {user.role !== 'admin' && (
                        <p>
                          <span className="font-extrabold text-slate-950 dark:text-white">পেমেন্ট মাধ্যম:</span>{' '}
                          {user.paymentMethod ? (
                            <span className="capitalize font-extrabold text-pink-650 bg-pink-50 dark:bg-pink-950/20 px-2 py-0.5 rounded shadow-sm border border-pink-100/35">
                              {user.paymentMethod === 'bkash' ? 'বিকাশ (bKash)' : user.paymentMethod === 'nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)'}
                            </span>
                          ) : <span className="text-slate-400 italic">N/A</span>}
                        </p>
                      )}
                      {user.role !== 'admin' && (
                        <p>
                          <span className="font-extrabold text-slate-950 dark:text-white">সাবস্ক্রিপশন প্যাকেজ:</span>{' '}
                          <span className="text-indigo-650 dark:text-indigo-400 font-extrabold bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded shadow-sm border border-indigo-100/30">
                            {user.subscriptionType || 'কোনো সচল প্ল্যান নেই'}
                          </span>
                        </p>
                      )}
                      {user.role !== 'admin' && (
                        <p className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-slate-950 dark:text-white">অনুমোদন স্ট্যাটাস:</span>{' '}
                          <span className={`font-black px-2.5 py-1 rounded-full text-xs shadow-sm ${user.isApproved ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-450 animate-pulse'}`}>
                            {user.isApproved ? '✓ অনুমোদিত (Approved / Active)' : '⏳ এডমিন অনুমোদনের অপেক্ষমাণ (Pending)'}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Joint NID copies preview container */}
                    {(user.nidFrontBase64 || user.nidBackBase64) && (
                      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block mb-2">সংযুক্ত এনআইডি ডকুমেন্ট কপি:</span>
                        <div className="flex gap-4">
                          {user.nidFrontBase64 && (
                            <div className="flex-1 text-center scale-95 hover:scale-100 transition-all">
                              <span className="text-[10px] text-slate-500 font-semibold block mb-1">সামনের পৃষ্ঠা</span>
                              <img src={user.nidFrontBase64} alt="NID Front" className="h-16 w-full object-cover rounded border border-slate-300 dark:border-slate-700 shadow-sm cursor-pointer" onClick={() => window.open(user.nidFrontBase64, '_blank')} />
                              <a href={user.nidFrontBase64} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline mt-1 inline-block">পূর্ণাঙ্গ ভিউ (Front)</a>
                            </div>
                          )}
                          {user.nidBackBase64 && (
                            <div className="flex-1 text-center scale-95 hover:scale-100 transition-all">
                              <span className="text-[10px] text-slate-500 font-semibold block mb-1">পেছনের পৃষ্ঠা</span>
                              <img src={user.nidBackBase64} alt="NID Back" className="h-16 w-full object-cover rounded border border-slate-300 dark:border-slate-700 shadow-sm cursor-pointer" onClick={() => window.open(user.nidBackBase64, '_blank')} />
                              <a href={user.nidBackBase64} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline mt-1 inline-block">পূর্ণাঙ্গ ভিউ (Back)</a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {user.role !== 'admin' && user.pendingRenewStatus === 'pending' && (
                      <div className="mt-4 p-5 bg-amber-50/70 dark:bg-amber-950/25 border-2 border-amber-500/30 dark:border-amber-500/20 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 shadow-sm">
                        <div className="space-y-2">
                          <p className="font-black text-amber-850 dark:text-amber-300 flex items-center gap-1.5 text-sm">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                            ⏳ অপেক্ষমান সাবস্ক্রিপশন নবায়ন অনুরোধ (Pending Renewal Request):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-semibold text-slate-705 dark:text-slate-300 mt-2">
                            <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/20 shadow-xs">
                              <p className="text-[10px] text-slate-450 block uppercase tracking-wider mb-0.5">প্যাকেজ (Package)</p>
                              <p className="font-black text-indigo-600 dark:text-indigo-400">{user.pendingRenewPackage}</p>
                            </div>
                            <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/20 shadow-xs">
                              <p className="text-[10px] text-slate-450 block uppercase tracking-wider mb-0.5">পেমেন্ট মাধ্যম (Gateway)</p>
                              <p className="font-black uppercase text-pink-600 dark:text-pink-400">{user.pendingRenewMethod}</p>
                            </div>
                            <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/20 shadow-xs">
                              <p className="text-[10px] text-slate-450 block uppercase tracking-wider mb-0.5">পরিমাণ (Amount)</p>
                              <p className="font-black text-emerald-600 dark:text-emerald-400">৳{user.pendingRenewAmount}</p>
                            </div>
                          </div>
                          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-1.5 items-center text-xs text-slate-700 dark:text-slate-300">
                            <p className="font-bold">
                              TrxID: <span className="font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded select-all font-black border border-indigo-100/30 underline decoration-pink-500 decoration-2">{user.pendingRenewTrxId}</span>
                            </p>
                            {user.pendingRenewSubmittedAt && (
                              <p className="text-[10px] text-slate-500 font-bold">
                                অনুরোধের সময়: {new Date(user.pendingRenewSubmittedAt).toLocaleString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 w-full lg:w-auto">
                          <button
                            onClick={async () => {
                              await approveSubscriptionRenewal(user.id);
                            }}
                            className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>নবায়ন এপ্রুভ করুন</span>
                          </button>
                          <button
                            onClick={async () => {
                              await rejectSubscriptionRenewal(user.id);
                            }}
                            className="flex-1 lg:flex-none px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 rounded-xl text-xs font-black active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>বাতিল</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {user.id !== currentUser.id && (
                    <div className="flex flex-wrap gap-2 text-sm mt-4 md:mt-0 shrink-0">
                        {user.role !== 'admin' && (
                          <button
                            onClick={async () => {
                              await sendRenewalEmailManual(user.id);
                            }}
                            className="px-3.5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-655 hover:from-violet-700 hover:to-indigo-700 hover:shadow-indigo-500/10 text-white rounded-xl font-bold text-xs shadow-sm transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 transform active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5 animate-pulse" />
                            <span>রিনিউ ইমেইল পাঠান</span>
                          </button>
                        )}
                        {!user.isApproved ? (
                          <>
                            <button
                              onClick={() => {
                                updateProfile(user.id, { isApproved: true, nidStatus: user.nidStatus === 'pending' ? 'verified' : user.nidStatus });
                                toast.success('ব্যবহারকারী সফলভাবে অনুমোদিত হয়েছে!');
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer"
                            >
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => {
                                deleteUser(user.id);
                                toast.success('ব্যবহারকারী বাতিল ও সফলভাবে মুছে ফেলা হয়েছে।');
                              }}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm hover:shadow-rose-600/10 transition-all cursor-pointer"
                            >
                              বাতিল করুন
                            </button>
                          </>
                        ) : (
                          <>
                            {deleteConfirmUserId === user.id ? (
                              <div className="flex items-center gap-1.5 border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-xl">
                                <span className="text-xs text-red-600 dark:text-red-400 font-bold">মুছে ফেলবেন?</span>
                                <button
                                  onClick={() => {
                                    deleteUser(user.id);
                                    setDeleteConfirmUserId(null);
                                  }}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                >
                                  হ্যাঁ
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmUserId(null)}
                                  className="px-2 py-1 bg-slate-200 dark:bg-slate-705 text-slate-750 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-300 transition-colors"
                                >
                                  না
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirmUserId(user.id)} className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-all cursor-pointer">মুছে ফেলুন</button>
                            )}
                          </>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'manage-banners' && isAdmin && (
          <ManageBanners />
        )}

        {activeTab === 'manage-video' && isAdmin && (
          <ManageVideo />
        )}

        {activeTab === 'manage-posts' && isAdmin && (
          <ManagePosts />
        )}

        {activeTab === 'manage-homepage' && isAdmin && (
          <div className="space-y-4">
             <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="text-xl font-bold mb-4">ডেটা সিডার</h3>
                <button
                   onClick={() => {
                     const demoProperties = [
                       { id: generateId(), ownerId: currentUser.id, title: 'Modern 2BHK Flat', description: 'Very cozy and modern.', location: MAIN_LOCATIONS[0], address: 'Mirpur 10', type: 'Flat', price: 15000, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'], isAvailable: true, createdAt: new Date().toISOString(), contactNumber: '01700000000' },
                       { id: generateId(), ownerId: currentUser.id, title: 'Sunny Single Room', description: 'Great sunlight.', location: MAIN_LOCATIONS[0], address: 'Dhanmondi', type: 'Single Room', price: 5000, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'], isAvailable: true, createdAt: new Date().toISOString(), contactNumber: '01700000000' },
                       { id: generateId(), ownerId: currentUser.id, title: 'Student Mess Seat', description: 'Quiet environment.', location: MAIN_LOCATIONS[0], address: 'Farmgate', type: 'Seat', price: 2000, images: ['https://images.unsplash.com/photo-15024428134df-7d4726027ece?w=400'], isAvailable: true, createdAt: new Date().toISOString(), contactNumber: '01700000000' }
                     ];
                     const demoTutors = [
                       { id: generateId(), userId: currentUser.id, name: 'Rahim Ahmed', subjects: ['Math', 'English'], education: 'B.Sc in CSE', availableDays: ['Sun', 'Mon'], availableTime: 'Morning', location: MAIN_LOCATIONS[0], salaryExpected: 3000, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', isVerified: true, contactNumber: '01800000000' },
                       { id: generateId(), userId: currentUser.id, name: 'Fatima Islam', subjects: ['Physics', 'Chemistry'], education: 'B.Sc in Physics', availableDays: ['Tue', 'Wed'], availableTime: 'Evening', location: MAIN_LOCATIONS[0], salaryExpected: 4000, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', isVerified: true, contactNumber: '01800000000' },
                       { id: generateId(), userId: currentUser.id, name: 'Karim Ullah', subjects: ['Biology'], education: 'MBBS Student', availableDays: ['Fri'], availableTime: 'Afternoon', location: MAIN_LOCATIONS[0], salaryExpected: 2500, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', isVerified: true, contactNumber: '01800000000' }
                     ];
                     demoProperties.forEach(addProperty);
                     demoTutors.forEach(addTutor);
                     toast.success(' ৬টি ডেমো পোস্ট সফলভাবে যোগ করা হয়েছে!');
                   }}
                   className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 font-sans cursor-pointer shadow-sm transition-all"
                >
                  ৬টি ডেমো পোস্ট যোগ করুন
                </button>
             </div>
             <ManageHomepage />
          </div>
        )}

        {activeTab === 'admin-add-content' && isAdmin && (
           <AddContentForm role="admin" onAddProperty={addProperty} onAddTutor={addTutor} ownerId={currentUser.id} />
        )}

        {activeTab === 'add-content' && currentUser.nidStatus === 'verified' && !isAdmin && (
          isExpired ? (
            <div className="bg-rose-500/10 border-2 border-rose-300 dark:border-rose-900 rounded-3xl p-8 max-w-2xl text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">আপনার সাবস্ক্রিপশন মেয়াদ শেষ হয়ে গিয়েছে!</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                আপনার অ্যাকাউন্টের ১ মাসের মেয়াদ শেষ হয়ে যাওয়ার কারণে আপনি নতুন কোনো পোস্ট (প্রপার্টি বিজ্ঞাপন বা টিউটর প্রোফাইল) সাইটে যুক্ত করতে পারবেন না। সেবাগুলো পুনরায় সচল করার জন্য অনুগ্রহ করে আপনার সাবস্ক্রিপশন নবায়ন করুন।
              </p>
              <button onClick={() => setActiveTab('subscription')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer">
                সাবস্ক্রিপশন নবায়ন করুন
              </button>
            </div>
          ) : (
            <AddContentForm role={currentUser.role} onAddProperty={addProperty} onAddTutor={addTutor} ownerId={currentUser.id} />
          )
        )}

        {activeTab === 'subscription' && !isAdmin && (
          <SubscriptionPayment user={currentUser} addInvoice={addInvoice} invoices={invoices.filter(i => i.userId === currentUser.id)} role={currentUser.role} updateSubscription={updateSubscription} isExpired={isExpired} />
        )}
        {activeTab === 'profile' && (
          <ProfileSettings user={currentUser} updateProfile={updateProfile} />
        )}

      </div>
    </div>
  );
}

function ProfileSettings({ user, updateProfile }: { user: User, updateProfile: any }) {
  const [formData, setFormData] = useState({
    name: user.name,
    dob: user.dob || '',
    avatar: user.avatar || ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({...prev, avatar: compressed}));
      } catch (err) {
        console.error("Profile image compression failed:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({...prev, avatar: reader.result as string}));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(user.id, formData);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">প্রোফাইল সেটিংস</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
           <label className="block text-sm font-medium mb-2">প্রোফাইল ছবি</label>
           <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                 {formData.avatar ? (
                   <img src={formData.avatar} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                   <UserCircle className="w-full h-full text-slate-400" />
                 )}
              </div>
              <label className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                নতুন ছবি আপলোড করুন
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
              </label>
           </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">সম্পূর্ণ নাম</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">জন্ম তারিখ</label>
          <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent" />
        </div>

        <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
          সেভ করুন
        </button>
      </form>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: number }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
      <h4 className="text-slate-500 font-medium text-sm">{title}</h4>
      <p className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function AddContentForm({ role, onAddProperty, onAddTutor, ownerId }: any) {
  const isAdmin = role === 'admin';
  const [selectedType, setSelectedType] = useState<'property' | 'tutor'>(role === 'tutor' ? 'tutor' : 'property');
  const [formData, setFormData] = useState<any>({});
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState<string>('');

  const [isDragging, setIsDragging] = useState(false);
  const isTutor = selectedType === 'tutor';

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

    if (isTutor) {
      const file = files[0];
      if (!allowedTypes.includes(file.type)) {
        alert('শুধুমাত্র PNG, JPEG, JPG, WEBP এবং GIF ফরম্যাটের ছবি আপলোড করা সম্ভব!');
        return;
      }

      try {
        const compressed = await compressImage(file);
        setFormData((prev: any) => ({ ...prev, image: compressed }));
      } catch (err) {
        console.error("Content image compression failed:", err);
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev: any) => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      // Multiple image uploads for property
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!allowedTypes.includes(file.type)) {
          alert(`"${file.name}" - শুধুমাত্র PNG, JPEG, JPG, WEBP এবং GIF ফরম্যাটের ছবি আপলোড করা সম্ভব!`);
          continue;
        }

        try {
          const compressed = await compressImage(file);
          setUploadedImages(prev => [...prev, compressed]);
        } catch (err) {
          console.error("Content image compression failed:", err);
          const reader = new FileReader();
          reader.onload = () => {
            setUploadedImages(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      await processFiles(files);
    }
  };

  const removeSelectedImage = (index?: number) => {
    if (isTutor) {
      setFormData((prev: any) => ({ ...prev, image: '' }));
    } else if (typeof index === 'number') {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const submitProperty = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProperty({
      id: generateId(),
      ownerId,
      title: formData.title || '',
      description: formData.description || '',
      location: formData.location || MAIN_LOCATIONS[0],
      address: formData.address || '',
      type: Array.isArray(formData.type) ? formData.type : (formData.type ? [formData.type] : [PROPERTY_TYPES[0]]),
      price: Number(formData.price) || 0,
      images: uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
      isAvailable: true,
      createdAt: new Date().toISOString(),
      ownerPhoneNumber: formData.ownerPhoneNumber || ''
    });
    setFormData({});
    setUploadedImages([]);
    setUrlInput('');
  };

  const submitTutor = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTutor({
      id: generateId(),
      userId: ownerId,
      name: formData.title || '',
      subjects: (formData.subjects || '').split(',').map((s: string) => s.trim()),
      education: formData.education || '',
      availableDays: ['Flexible'],
      availableTime: formData.availableTime || 'Negotiable',
      location: formData.location || MAIN_LOCATIONS[0],
      salaryExpected: Number(formData.price) || 0,
      image: formData.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      isVerified: true,
      phoneNumber: formData.phoneNumber || '',
      whatsappNumber: formData.whatsappNumber || '',
      daysPerWeek: formData.daysPerWeek || '৩ দিন',
      gender: formData.gender || 'male',
      experience: formData.experience || ''
    });
    setFormData({});
  };

  return (
    <form className="space-y-6 max-w-xl bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" onSubmit={isTutor ? submitTutor : submitProperty}>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {isAdmin ? 'নতুন পোস্ট যুক্ত করুন' : isTutor ? 'টিউটর প্রোফাইল তৈরি করুন' : 'নতুন প্রপার্টি যোগ করুন'}
      </h2>

      {isAdmin && (
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1.5 mb-6">
          <button
            type="button"
            onClick={() => { setSelectedType('property'); setFormData({}); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${selectedType === 'property' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
          >
            🏠 বাসা ভাড়া/মেস পোস্ট
          </button>
          <button
            type="button"
            onClick={() => { setSelectedType('tutor'); setFormData({}); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${selectedType === 'tutor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
          >
            🎓 হোম টিউটর পোস্ট
          </button>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">
          {isTutor ? 'হোম টিউটরের নাম' : 'বাসা ভাড়া বা মেসের টাইটেল'}
        </label>
        <input required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">এলাকা</label>
          <select value={formData.location || MAIN_LOCATIONS[0]} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-705 bg-transparent text-slate-900 dark:text-white focus:outline-none">
            {MAIN_LOCATIONS.map(l => <option key={l} value={l} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{isTutor ? 'প্রত্যাশিত বেতন (৳)' : 'মাসিক ভাড়া (৳)'}</label>
          <input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
        </div>
      </div>

      {!isTutor && (
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">বাসার ধরনসমূহ (একাধিক ক্লিক করে সিলেক্ট করতে পারবেন)</label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                {PROPERTY_TYPES.map(t => {
                  const currentTypes = Array.isArray(formData.type) 
                    ? formData.type 
                    : formData.type 
                      ? [formData.type] 
                      : [PROPERTY_TYPES[0]];
                  const isChecked = currentTypes.includes(t);
                  
                  const handleCheckboxChange = (checked: boolean) => {
                    let nextTypes;
                    if (checked) {
                      nextTypes = [...currentTypes, t];
                    } else {
                      nextTypes = currentTypes.filter(x => x !== t);
                    }
                    if (nextTypes.length === 0) {
                      nextTypes = [PROPERTY_TYPES[0]]; // force at least one
                    }
                    setFormData({...formData, type: nextTypes});
                  };

                  let displayLabel = t;
                  if (t === 'Family Flat') displayLabel = 'ফ্যামিলি ফ্ল্যাট';
                  else if (t === 'Female Mess') displayLabel = 'ছাত্রী মেস';
                  else if (t === 'Male Mess') displayLabel = 'ছাত্র মেস';
                  else if (t === 'Bachelor Flat') displayLabel = 'ব্যাচেলর ফ্ল্যাট';

                  return (
                    <label key={t} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={e => handleCheckboxChange(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span>{displayLabel}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">বিস্তারিত ঠিকানা</label>
              <input required value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">মালিকের ফোন নাম্বার (Owner Phone Number)</label>
            <input required type="tel" placeholder="যেমন: 017xxxxxxxx" value={formData.ownerPhoneNumber || ''} onChange={e => setFormData({...formData, ownerPhoneNumber: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
          </div>
        </div>
      )}

      {isTutor && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">বিষয়সমূহ (কমা দিয়ে লিখুন)</label>
            <input required value={formData.subjects || ''} onChange={e => setFormData({...formData, subjects: e.target.value})} placeholder="যেমন: Math, Physics, English" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">শিক্ষাগত যোগ্যতা</label>
            <input required value={formData.education || ''} onChange={e => setFormData({...formData, education: e.target.value})} placeholder="যেমন: B.Sc in CSE, Mymensingh College" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ফোন নাম্বার (Phone)</label>
              <input required type="tel" placeholder="যেমন: 017xxxxxxxx" value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">হোয়াটসঅ্যাপ নাম্বার (WhatsApp)</label>
              <input required type="tel" placeholder="যেমন: 017xxxxxxxx" value={formData.whatsappNumber || ''} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">সপ্তাহে কত দিন পড়াতে পারবেন?</label>
            <select 
              value={formData.daysPerWeek || '৩ দিন'} 
              onChange={e => setFormData({...formData, daysPerWeek: e.target.value})} 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-705 bg-transparent text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="১ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">১ দিন (1 Day/Week)</option>
              <option value="২ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">২ দিন (2 Days/Week)</option>
              <option value="৩ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৩ দিন (3 Days/Week)</option>
              <option value="৪ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৪ দিন (4 Days/Week)</option>
              <option value="৫ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৫ দিন (5 Days/Week)</option>
              <option value="৬ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৬ দিন (6 Days/Week)</option>
              <option value="৭ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৭ দিন (7 Days/Week)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">পড়ানোর সময় (Available Time)</label>
            <input required placeholder="যেমন: বিকেল ৩টা - সন্ধ্যা ৬টা" value={formData.availableTime || ''} onChange={e => setFormData({...formData, availableTime: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">লিঙ্গ (Gender)</label>
            <select 
              value={formData.gender || 'male'} 
              onChange={e => setFormData({...formData, gender: e.target.value})} 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-705 bg-transparent text-slate-900 dark:text-white"
            >
              <option value="male">ছেলে</option>
              <option value="female">মেয়ে</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">অভিজ্ঞতা (Experience)</label>
            <input placeholder="যেমন: ৩ বছরের অভিজ্ঞতা..." value={formData.experience || ''} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
          </div>
        </>
      )}

      {!isTutor && (
        <div>
          <label className="block text-sm font-medium mb-1">বিস্তারিত বিবরণ</label>
          <textarea required rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
        </div>
      )}
      
      {/* Upload/URL section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            {isTutor ? 'প্রোফাইল ছবি' : 'বাসা/মেসের ছবি'}
          </label>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setUploadMethod('file')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${uploadMethod === 'file' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm font-semibold' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              গ্যালারি থেকে
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('url')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${uploadMethod === 'url' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm font-semibold' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              লিংক বসান
            </button>
          </div>
        </div>

        {isTutor ? (
          uploadMethod === 'file' ? (
            <div>
              {!formData.image ? (
                <label 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 px-4 text-center cursor-pointer transition-all ${isDragging ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-550'}`}
                >
                  <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isDragging ? 'এখানে ড্রপ করে দিন!' : 'ছবি নির্বাচন করতে এখানে ক্লিক করুন অথবা ড্রাগ অ্যান্ড ড্রপ করুন'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    PNG, JPEG, JPG, WEBP (সর্বোচ্চ ৪ মেগাবাইট)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 p-2 group">
                  <img
                    src={formData.image}
                    alt="Uploaded Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedImage()}
                    className="absolute top-4 right-4 bg-red-650 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    title="ছবি মুছে ফেলুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="p-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    ✓ ছবি সফলভাবে আপলোড হয়েছে
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                value={formData.image || ''}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
              />
              {formData.image && formData.image.startsWith('http') && (
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-2 bg-slate-50 dark:bg-slate-900">
                  <img
                    src={formData.image}
                    alt="URL Preview"
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedImage()}
                    className="absolute top-4 right-4 bg-red-650 hover:bg-red-700 text-white p-1.5 rounded-full shadow cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )
        ) : (
          /* Property - multi image uploads */
          <div className="space-y-4">
            {uploadMethod === 'file' ? (
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 px-4 text-center cursor-pointer transition-all ${isDragging ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-550'}`}
              >
                <Upload className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mb-2 animate-bounce" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isDragging ? 'গ্রুপ অফ ইমেজ ড্রপ করুন!' : 'বাসার একাধিক ছবি যুক্ত করতে মাউস দিয়ে ড্রাগ করুন অথবা এখানে ক্লিক করুন'}
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-400 mt-1">
                  PNG, JPEG, JPG, WEBP (একসাথে একাধিক ফাইল মাউস ড্র্যাগ বা কিবোর্ড দিয়ে সিলেক্ট করতে পারেন)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) {
                      setUploadedImages(prev => [...prev, urlInput.trim()]);
                      setUrlInput('');
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold whitespace-nowrap"
                >
                  যোগ করুন
                </button>
              </div>
            )}

            {/* Render uploaded list of multiple images */}
            {uploadedImages.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  যুক্ত করা ছবিসমূহ ({uploadedImages.length}টি):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 group">
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(idx)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1.5 left-2 bg-slate-900/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-mono font-bold">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg transform active:scale-[0.99] flex justify-center items-center gap-1.5">
        <PlusCircle className="w-5 h-5" />
        পাবলিশ করুন
      </button>
    </form>
  );
}



function SubscriptionPayment({ user, addInvoice, invoices, role, updateSubscription, isExpired }: { user: User, addInvoice: any, invoices: Invoice[], role: string, updateSubscription: any, isExpired: boolean }) {
  const [trxId, setTrxId] = useState('');
  const [method, setMethod] = useState<'bkash'|'nagad'|'rocket'>('bkash');
  const { language } = useLanguage();
  const { updateProfile } = useApp();
  
  const amount = role === 'visitor' ? 25 : 50;
  const packageType = role === 'visitor' ? 'সাধারণ ভিজিটর প্ল্যান' : role === 'tutor' ? 'টিউটর প্ল্যান' : 'প্রপার্টি মালিক প্ল্যান';

  const userEnd = user?.subscriptionEnd ? new Date(user.subscriptionEnd) : null;
  const isCurrentlySubscribed = userEnd ? userEnd > new Date() : false;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      toast.error(language === 'bn' ? 'সঠিক ট্রানজ্যাকশন আইডি দিন!' : 'Please enter a valid Transaction ID!');
      return;
    }
    
    updateProfile(user.id, {
      pendingRenewStatus: 'pending',
      pendingRenewTrxId: trxId,
      pendingRenewMethod: method,
      pendingRenewPackage: packageType,
      pendingRenewAmount: amount,
      pendingRenewSubmittedAt: new Date().toISOString()
    }, false);

    setTrxId('');

    toast.success(
      language === 'bn' 
        ? 'সাবস্ক্রিপশন নবায়নের অনুরোধ সফলভাবে পাঠানো হয়েছে! অ্যাডমিন প্যানেল থেকে ট্রানজ্যাকশন আইডি ও পেমেন্ট মিলিয়ে খুব শীঘ্রই এটি এপ্রুভ বা সক্রিয় করে দেওয়া হবে।' 
        : 'Subscription renewal request submitted! It will be verified and approved by system admin shortly.',
      { duration: 8050 }
    );
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {language === 'bn' ? 'সাবস্ক্রিপশন ও বিলিং' : 'Subscription & Billing'}
      </h2>

      {isExpired && (
        <div className="bg-rose-500/10 border-2 border-rose-300 dark:border-rose-900/60 p-5 rounded-2xl mb-6 flex gap-3 items-start shadow-sm leading-relaxed font-semibold text-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-sm text-red-900 dark:text-red-300">
              {language === 'bn' ? 'সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে!' : 'Subscription Expired!'}
            </p>
            <p className="mt-1">
              {language === 'bn' 
                ? 'আপনার চলমান ১ মাসের মেয়াদ শেষ হওয়ার কারণে অন্যান্য প্যাকেজের ইনফরমেশন ও সেটিংস লক করা রয়েছে। শুধুমাত্র আপনার বর্তমান প্রধান প্যাকেজটি নবায়ন করতে পারবেন। নবায়ন সম্পন্ন হলে বাকি ফিচার ও অন্য প্যাকেজসমূহ পুনরায় সচল হবে। ' 
                : 'Since your current 1-month plan has expired, information on other packages is locked. You can only renew your current primary package to unlock all systems.'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-indigo-805 dark:text-indigo-300 font-extrabold text-lg mb-1">{packageType} প্রিমিয়াম</h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
          {language === 'bn' ? 'মেয়াদ কাল: ১ মাস / ৩০ দিন' : 'Validity: 1 Month / 30 Days'}
        </p>
        <p className="text-3xl font-extrabold text-slate-950 dark:text-white mb-4">৳{amount} <span className="text-sm font-normal text-slate-500">/{language === 'bn' ? 'মাস' : 'Month'}</span></p>
        
        {isCurrentlySubscribed && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-450 p-5 rounded-2xl border-2 border-emerald-250 dark:border-emerald-900 leading-relaxed mb-6">
            <p className="font-extrabold flex items-center gap-1.5 text-base">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              {language === 'bn' ? 'আপনার সাবস্ক্রিপশন সফলভাবে সচল আছে!' : 'Your Subscription is Active!'}
            </p>
            <p className="text-xs mt-2 text-slate-650 dark:text-slate-300 font-semibold">
              {language === 'bn' 
                ? `মেয়াদ শেষ হওয়ার সময়: ${new Date(user.subscriptionEnd!).toLocaleString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                : `Expiration date: ${new Date(user.subscriptionEnd!).toLocaleString()}`}
            </p>
          </div>
        )}

        {user.pendingRenewStatus === 'pending' ? (
          <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 p-5 rounded-2xl border-2 border-amber-200 dark:border-amber-900/60 leading-relaxed space-y-2 animate-pulse">
            <p className="font-bold text-base flex items-center gap-1.5 text-amber-850 dark:text-amber-200">
              <RefreshCw className="w-5 h-5 animate-spin" />
              {language === 'bn' ? 'নবায়ন অনুরোধ মূল্যায়নাধীন রয়েছে (Verification Pending)' : 'Renewal Verifying by Admin'}
            </p>
            <p className="text-xs">
              {language === 'bn' 
                ? 'আপনার রিনিউ requête বা পেমেন্ট মিলানোর অনুরোধটি সফলভাবে সিস্টেমে জমা নেওয়া হয়েছে। অ্যাডমিন ম্যানুয়ালি যাচাই করার পর এটি এপ্রুভ করে দেবেন। সাধারণত ১০-৩০ মিনিট সময় লাগতে পারে।' 
                : 'Your payment verification request has been logged. Admin will review the transaction ID and activate your plan shortly.'}
            </p>
            <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 text-xs space-y-1 font-mono">
              <p>Trx ID: <span className="font-bold underline">{user.pendingRenewTrxId}</span></p>
              <p>Gateway: <span className="font-bold capitalize">{user.pendingRenewMethod}</span></p>
              <p>Amount: <span className="font-bold">৳{user.pendingRenewAmount}</span></p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {user.pendingRenewStatus === 'rejected' && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 p-4 rounded-xl text-xs flex gap-2 border border-red-200 dark:border-red-900/50">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-555" />
                <div>
                  <p className="font-bold">{language === 'bn' ? 'পূর্ববর্তী নবায়ন অনুরোধটি বাতিল হয়েছে' : 'Renewal Request Disapproved'}</p>
                  <p className="mt-1">{language === 'bn' ? 'আপনার পূর্ববর্তী প্রদত্ত ট্রানজ্যাকশন আইডিটি সঠিক পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডিটি দিয়ে আবারো সাবমিট করুন।' : 'Your previous transaction ID could not be verified. Please double-check your payment app receipt and submit again.'}</p>
                </div>
              </div>
            )}

            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 sm:p-5 rounded-xl text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-normal font-medium border border-indigo-100/70 dark:border-indigo-900/50 shadow-sm">
              <p className="font-bold text-slate-900 dark:text-white mb-2 text-xs sm:text-sm flex items-center gap-1.5">
                <span>👇</span> {language === 'bn' ? 'ফি পরিশোধের সহজ নির্দেশিকা:' : 'Payment Guide:'}
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-800 dark:text-slate-300">
                <li>
                  {language === 'bn' ? (
                    <>বিকাশ/নগদ/রকেট (Personal) নাম্বারঃ <strong className="text-pink-600 dark:text-pink-400 text-sm sm:text-base font-extrabold tracking-wide selection:bg-pink-100 select-all">০১৪০১৯৯৬৬৭৪</strong> এ সেন্ড মানি (Send Money) করুন।</>
                  ) : (
                    <>Send money to (Personal Number): <strong className="text-pink-600 dark:text-pink-400 text-sm sm:text-base font-mono font-extrabold select-all">01401996674</strong> via bKash/Nagad/Rocket.</>
                  )}
                  <button 
                    type="button" 
                    onClick={() => {
                      navigator.clipboard.writeText('01401996674');
                      toast.success(language === 'bn' ? 'নাম্বার কপি করা হয়েছে!' : 'Number copied!');
                    }}
                    className="ml-2.5 mr-1 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950 rounded-md hover:bg-indigo-200 transition-colors inline-flex items-center"
                  >
                    {language === 'bn' ? 'কপি' : 'Copy'}
                  </button>
                </li>
                <li>{language === 'bn' ? 'পেমেন্ট শেষ হয়ে গেলে আপনার অ্যাপ বা মেসেজ থেকে ট্রানজ্যাকশন আইডি (Transaction ID) কপি করুন।' : 'Copy the transaction ID from your confirmation message.'}</li>
                <li>{language === 'bn' ? 'নিচে আপনার পেমেন্ট মাধ্যম সিলেক্ট করে সঠিক ট্রানজ্যাকশন আইডি বসিয়ে সাবমিট করুন।' : 'Select payment gateway below, enter your TRX ID, and click submit.'}</li>
              </ul>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {language === 'bn' ? '১. পেমেন্ট মাধ্যম সিলেক্ট করুন' : '1. Select Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button type="button" onClick={() => setMethod('bkash')} className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none ${method === 'bkash' ? 'bg-[#DF146E] text-white shadow-md shadow-[#DF146E]/30 ring-2 ring-[#DF146E] ring-offset-1 dark:ring-offset-slate-900 scale-[1.02]' : 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#DF146E] hover:text-[#DF146E]'}`}>
                    <img src="/bkash.png" alt="bKash" className="h-5 sm:h-6 w-auto object-contain" referrerPolicy="no-referrer" />
                    <span>{language === 'bn' ? 'বিকাশ' : 'bKash'}</span>
                  </button>
                  <button type="button" onClick={() => setMethod('nagad')} className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none ${method === 'nagad' ? 'bg-[#EC2227] text-white shadow-md shadow-[#EC2227]/30 ring-2 ring-[#EC2227] ring-offset-1 dark:ring-offset-slate-900 scale-[1.02]' : 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#EC2227] hover:text-[#EC2227]'}`}>
                    <img src="/nagad.png" alt="Nagad" className="h-5 sm:h-6 w-auto object-contain" referrerPolicy="no-referrer" />
                    <span>{language === 'bn' ? 'নগদ' : 'Nagad'}</span>
                  </button>
                  <button type="button" onClick={() => setMethod('rocket')} className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none ${method === 'rocket' ? 'bg-[#8C3494] text-white shadow-md shadow-[#8C3494]/30 ring-2 ring-[#8C3494] ring-offset-1 dark:ring-offset-slate-900 scale-[1.02]' : 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#8C3494] hover:text-[#8C3494]'}`}>
                    <img src="/rocket.png" alt="Rocket" className="h-5 sm:h-6 w-auto object-contain" referrerPolicy="no-referrer" />
                    <span>{language === 'bn' ? 'রকেট' : 'Rocket'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  {language === 'bn' ? '২. পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID) বসান' : '2. Enter Payment Transaction ID (TrxID)'}
                </label>
                <div className="relative">
                  <input required placeholder={language === 'bn' ? 'যেমন: 8N79OLKWP' : 'Example: 8N79OLKWP'} value={trxId} onChange={e => setTrxId(e.target.value)} className="w-full pl-3 pr-10 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white text-sm font-bold uppercase tracking-wider placeholder:tracking-normal focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm placeholder:lowercase" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Send className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base">
                <RefreshCw className="w-4 h-4" />
                {language === 'bn' ? 'নবায়নের অনুরোধ পাঠান' : 'Submit Renewal Request'}
              </button>
            </form>
          </div>
        )}
      </div>

      <h3 className="font-extrabold text-lg mb-4">{language === 'bn' ? 'পেমেন্ট ও ইনভয়েস লগ' : 'Payment & Invoice History'}</h3>
      {invoices.length > 0 ? (
        <div className="space-y-3">
          {invoices.map((inv: Invoice) => (
            <div key={inv.id} className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">INV-{inv.id.toUpperCase()}</p>
                <p className="text-xs text-slate-500">{new Date(inv.date).toLocaleDateString()} via {inv.method && inv.method.toUpperCase()} &bull; Trx: {inv.trxId || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-slate-900 dark:text-white">৳{inv.amount}</p>
                <div className="flex flex-col items-end gap-1.5 mt-1">
                  <span className={`text-[10px] px-2.5 py-0.5 font-bold rounded-full ${
                    inv.status === 'paid'
                      ? 'text-emerald-600 dark:text-emerald-450 bg-emerald-100/50 dark:bg-emerald-950/20'
                      : 'text-amber-600 dark:text-amber-450 bg-amber-100/50 dark:bg-amber-950/20'
                  }`}>
                    {inv.status === 'paid'
                      ? (language === 'bn' ? 'এপ্রুভ' : 'Approved')
                      : (language === 'bn' ? 'যাচাইধীন' : 'Pending')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">
          {language === 'bn' ? 'কোনো পেমেন্ট হিস্ট্রি পাওয়া যায়নি।' : 'No payment history found.'}
        </p>
      )}
    </div>
  );
}
