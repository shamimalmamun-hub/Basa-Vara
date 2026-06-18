import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { ShieldCheck, PlusCircle, CreditCard, LayoutDashboard, CheckCircle2, UserCircle, Settings, Megaphone, Upload, X, Image, Video, AlertTriangle } from 'lucide-react';
import { MAIN_LOCATIONS, PROPERTY_TYPES, generateId, compressImage } from '../lib/utils';
import { Property, Tutor, Invoice, User } from '../types';
import ManageBanners from '../components/ManageBanners';
import ManageVideo from '../components/ManageVideo';
import ManageHomepage from '../components/ManageHomepage';

export default function Dashboard() {
  const { currentUser, users, properties, invoices, addProperty, addTutor, addInvoice, updateUserNID, updateProfile, updateSubscription, deleteUser, apiUrl, updateApiUrl, sendRenewalEmailManual } = useApp();
  const { language } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null);
  const [inputApiUrl, setInputApiUrl] = useState('');

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
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
                   <StatCard title="মোট ব্যবহারকারী" value={users.length} />
                   <StatCard title="অ্যাক্টিভ পেইড প্ল্যান" value={invoices.filter(i => i.status === 'paid').length} />
                   <StatCard title="মোট প্রপার্টি" value={properties.length} />
                   <StatCard title="অপেক্ষমাণ এনআইডি" value={users.filter(u => u.nidStatus === 'pending').length} />
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">ব্যবহারকারী ম্যানেজমেন্ট</h2>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex flex-col md:flex-row justify-between md:items-start gap-4 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-2 text-lg">
                      {user.name} 
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-1 rounded-full capitalize">{user.role === 'user' ? 'প্রপার্টি মালিক' : user.role === 'tutor' ? 'টিউটর' : user.role === 'visitor' ? 'সাধারণ ভিজিটর' : 'এডমিন'}</span>
                    </h4>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                      <p><span className="font-extrabold text-slate-950 dark:text-white">ইমেইল:</span> {user.email}</p>
                      <p><span className="font-extrabold text-slate-950 dark:text-white">পাসওয়ার্ড:</span> {user.password || 'N/A'}</p>
                      {user.role !== 'admin' && (
                        <p><span className="font-extrabold text-slate-950 dark:text-white">ট্রানজ্যাকশন আইডি:</span> {user.transactionId || 'N/A'}</p>
                      )}
                      {user.role !== 'admin' && (
                        <p>
                          <span className="font-extrabold text-slate-950 dark:text-white">পেমেন্ট মাধ্যম:</span>{' '}
                          {user.paymentMethod ? (
                            <span className="capitalize font-extrabold text-pink-600 dark:text-pink-400">
                              {user.paymentMethod === 'bkash' ? 'বিকাশ (bKash)' : user.paymentMethod === 'nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)'}
                            </span>
                          ) : <span className="text-slate-400 italic">N/A</span>}
                        </p>
                      )}
                      {user.role !== 'admin' && (
                        <>
                          <p className="whitespace-normal break-words overflow-visible block">
                            <span className="font-extrabold text-slate-950 dark:text-white">সাবস্ক্রিপশন প্যাকেজ:</span>{' '}
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold whitespace-normal break-words overflow-visible">{user.subscriptionType || 'কোনো সচল প্ল্যান নেই'}</span>
                            <span className="font-extrabold text-slate-950 dark:text-white">সাবস্ক্রিপশন ও লগইন অনুমোদন:</span> 
                            <span className={`font-extrabold px-2.5 py-1 rounded-full text-xs ${user.isApproved ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 animate-pulse'}`}>
                              {user.isApproved ? '✓ অনুমোদিত (Approved / Active)' : '⏳ এডমিন অনুমোদনের অপেক্ষমাণ (Pending)'}
                            </span>
                          </p>
                        </>
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
                              <a href={user.nidBackBase64} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-650 dark:text-indigo-400 font-semibold hover:underline mt-1 inline-block">পূর্ণাঙ্গ ভিউ (Back)</a>
                            </div>
                          )}
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
                            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 dark:text-indigo-350 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>📧 রিনিউ ইমেইল পাঠান</span>
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
                              <button onClick={() => setDeleteConfirmUserId(user.id)} className="px-3.5 py-2 bg-red-105 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-all cursor-pointer">মুছে ফেলুন</button>
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
                   className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700"
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
           <AddContentForm role={currentUser.role} onAddProperty={addProperty} onAddTutor={addTutor} ownerId={currentUser.id} />
        )}

        {activeTab === 'subscription' && !isAdmin && (
          <SubscriptionPayment user={currentUser} addInvoice={addInvoice} invoices={invoices.filter(i => i.userId === currentUser.id)} role={currentUser.role} updateSubscription={updateSubscription} />
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
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
        const base64String = reader.result as string;
        setFormData((prev: any) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setFormData((prev: any) => ({ ...prev, image: '' }));
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
      type: formData.type || PROPERTY_TYPES[0],
      price: Number(formData.price) || 0,
      images: [formData.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
      isAvailable: true,
      createdAt: new Date().toISOString()
    });
    setFormData({});
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
      availableTime: 'Negotiable',
      location: formData.location || MAIN_LOCATIONS[0],
      salaryExpected: Number(formData.price) || 0,
      image: formData.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      isVerified: true
    });
    setFormData({});
  };

  const isTutor = selectedType === 'tutor';

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
          <select value={formData.location || MAIN_LOCATIONS[0]} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
            {MAIN_LOCATIONS.map(l => <option key={l} value={l} className="dark:bg-slate-800">{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{isTutor ? 'প্রত্যাশিত বেতন (৳)' : 'মাসিক ভাড়া (৳)'}</label>
          <input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
        </div>
      </div>

      {!isTutor && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ধরন</label>
            <select value={formData.type || PROPERTY_TYPES[0]} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
              {PROPERTY_TYPES.map(t => <option key={t} value={t} className="dark:bg-slate-800">{t === 'Flat' ? 'ফ্ল্যাট' : t === 'Seat' ? 'সিট' : t === 'Single Room' ? 'সিঙ্গেল রুম' : 'মেস'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">বিস্তারিত ঠিকানা</label>
            <input required value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
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

        {uploadMethod === 'file' ? (
          <div>
            {!formData.image ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl py-8 px-4 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-550 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2 animate-pulse" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  ছবি নির্বাচন করতে এখানে ক্লিক করুন
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
                  onClick={removeSelectedImage}
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
                  onClick={removeSelectedImage}
                  className="absolute top-4 right-4 bg-red-650 hover:bg-red-700 text-white p-1.5 rounded-full shadow cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
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



function SubscriptionPayment({ user, addInvoice, invoices, role, updateSubscription }: { user: User, addInvoice: any, invoices: Invoice[], role: string, updateSubscription: any }) {
  const [trxId, setTrxId] = useState('');
  const [method, setMethod] = useState<'bkash'|'nagad'|'rocket'>('bkash');
  const { language } = useLanguage();
  const { updateProfile, logout } = useApp();
  
  const amount = role === 'visitor' ? 25 : 50;
  const packageType = role === 'visitor' ? 'সাধারণ ভিজিটর প্ল্যান' : role === 'tutor' ? 'টিউটর প্ল্যান' : 'প্রপার্টি মালিক প্ল্যান';

  const userEnd = user?.subscriptionEnd ? new Date(user.subscriptionEnd) : null;
  const isCurrentlySubscribed = userEnd ? userEnd > new Date() : false;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // We set subscription duration to exactly next 30 days
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    addInvoice({
      id: generateId(), 
      userId: user.id, 
      amount, 
      status: 'paid', 
      date: new Date().toISOString(), 
      trxId, 
      method
    });
    
    updateSubscription(user.id, packageType, futureDate.toISOString());
    updateProfile(user.id, { isApproved: false, transactionId: trxId, paymentMethod: method }, false);
    setTrxId('');
    
    toast.success(
      language === 'bn' 
        ? 'সাবস্ক্রিপশন ক্রয় সফল হয়েছে! অ্যাকাউন্টটি অনুমোদনের জন্য অ্যাডমিন প্যানেলে পাঠানো হয়েছে। অনুমোদন শেষে লগইন করতে পারবেন।' 
        : 'Subscription purchase request submitted! Sent to admin for approval. You can log in again after approval.', 
      { duration: 8000 }
    );

    setTimeout(() => {
      logout();
    }, 4000);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {language === 'bn' ? 'সাবস্ক্রিপশন ও বিলিং' : 'Subscription & Billing'}
      </h2>

      <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-indigo-805 dark:text-indigo-300 font-extrabold text-lg mb-1">{packageType} প্রিমিয়াম</h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
          {language === 'bn' ? 'মেয়াদ কাল: ১ মাস / ৩০ দিন' : 'Validity: 1 Month / 30 Days'}
        </p>
        <p className="text-3xl font-extrabold text-slate-950 dark:text-white mb-4">৳{amount} <span className="text-sm font-normal text-slate-500">/{language === 'bn' ? 'মাস' : 'Month'}</span></p>
        
        {isCurrentlySubscribed ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-450 p-5 rounded-2xl border-2 border-emerald-250 dark:border-emerald-900 leading-relaxed">
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
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-100/40 p-4 rounded-xl text-xs text-amber-900 dark:text-amber-300 leading-relaxed mb-2 font-semibold">
              💡 {language === 'bn' 
                ? 'আপনার পেমেন্ট করার পর ট্রানজ্যাকশন আইডি (TrxID) নিচের বক্সে দিয়ে ভেরিফাই করুন। আমাদের সিস্টেম ১ মাসের জন্য সাবস্ক্রিপশন সচল করে দেবে।' 
                : 'Please select a gateway, transfer the monthly subscription fee, and insert the transaction ID to activate your plan.'}
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white">
                <option value="bkash">বিকাশ (Personal - 019XXXXXXXX)</option>
                <option value="nagad">নগদ (Personal - 019XXXXXXXX)</option>
                <option value="rocket">রকেট (Personal - 019XXXXXXXX)</option>
              </select>
              <input required placeholder={language === 'bn' ? 'Transaction ID (TrxID) দিন' : 'Enter Transaction ID (TrxID)'} value={trxId} onChange={e => setTrxId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold transition-all shadow cursor-pointer">
                {language === 'bn' ? 'সাবস্ক্রিপশন সচল করুন' : 'Verify & Activate Sub'}
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
                <span className="text-xs text-emerald-600 dark:text-emerald-450 px-2.5 py-0.5 bg-emerald-100/50 dark:bg-emerald-950/20 font-bold rounded-full">Approved</span>
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
