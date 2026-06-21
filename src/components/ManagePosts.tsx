import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, MapPin, Phone, Trash2, Edit2, CheckCircle, XCircle, FileText, Briefcase, DollarSign, Calendar, SlidersHorizontal, ArrowUpDown, Image as ImageIcon, X, Upload, Plus } from 'lucide-react';
import { MAIN_LOCATIONS, PROPERTY_TYPES, compressImage } from '../lib/utils';
import { Property, Tutor } from '../types';
import toast from 'react-hot-toast';

export default function ManagePosts() {
  const { 
    properties, 
    tutors, 
    updateProperty, 
    deleteProperty, 
    updateTutor, 
    deleteTutor 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'properties' | 'tutors'>('properties');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [sortByPrice, setSortByPrice] = useState<'asc' | 'desc' | 'none'>('none');

  // Edit states
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editPropertyUrlInput, setEditPropertyUrlInput] = useState('');
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);

  // Delete confirm states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [isDraggingProperty, setIsDraggingProperty] = useState(false);

  const processFilesProperty = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    try {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`"${file.name}" - শুধুমাত্র PNG, JPEG, JPG, WEBP এবং GIF ফরম্যাটের ছবি আপলোড করা সম্ভব!`);
          continue;
        }
        const compressed = await compressImage(file);
        setEditingProperty(prev => {
          if (!prev) return null;
          const existingImages = prev.images || [];
          return {
            ...prev,
            images: [...existingImages, compressed]
          };
        });
      }
      toast.success('ছবি আপলোড সম্পন্ন হয়েছে!');
    } catch (err) {
      toast.error('ছবি প্রসেস করা সম্ভব হয়নি.');
    }
  };

  const handleFileChangeProperty = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFilesProperty(files);
    }
  };

  const handleDragOverProperty = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingProperty(true);
  };

  const handleDragLeaveProperty = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingProperty(false);
  };

  const handleDropProperty = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingProperty(false);
    const files = e.dataTransfer.files;
    if (files) {
      await processFilesProperty(files);
    }
  };

  // Handlers for Properties
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    updateProperty(editingProperty.id, {
      title: editingProperty.title,
      description: editingProperty.description,
      location: editingProperty.location,
      address: editingProperty.address,
      type: editingProperty.type,
      price: Number(editingProperty.price),
      contactNumber: editingProperty.contactNumber,
      ownerPhoneNumber: editingProperty.ownerPhoneNumber,
      isAvailable: editingProperty.isAvailable,
      images: editingProperty.images,
    });
    setEditingProperty(null);
  };

  const handleDeletePropertyConfirm = (id: string) => {
    deleteProperty(id);
    setDeleteConfirmId(null);
  };

  // Handlers for Tutors
  const handleSaveTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutor) return;
    updateTutor(editingTutor.id, {
      name: editingTutor.name,
      education: editingTutor.education,
      subjects: typeof editingTutor.subjects === 'string' 
        ? (editingTutor.subjects as string).split(',').map(s => s.trim())
        : editingTutor.subjects,
      salaryExpected: Number(editingTutor.salaryExpected),
      availableTime: editingTutor.availableTime,
      location: editingTutor.location,
      phoneNumber: editingTutor.phoneNumber,
      whatsappNumber: editingTutor.whatsappNumber,
      daysPerWeek: editingTutor.daysPerWeek,
      gender: editingTutor.gender,
      experience: editingTutor.experience,
      image: editingTutor.image,
      isVerified: editingTutor.isVerified,
    });
    setEditingTutor(null);
  };

  const handleFileChangeTutor = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setEditingTutor(prev => prev ? ({ ...prev, image: compressed }) : null);
        toast.success('ছবি আপলোড হয়েছে!');
      } catch (err) {
        toast.error('ছবি আপলোড ব্যর্থ হয়েছে.');
      }
    }
  };

  const handleDeleteTutorConfirm = (id: string) => {
    deleteTutor(id);
    setDeleteConfirmId(null);
  };

  // Filters logic
  const filteredProperties = (properties || []).filter(prop => {
    const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      prop.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      prop.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocationFilter === 'all' || prop.location === selectedLocationFilter;
    const matchesType = selectedTypeFilter === 'all' || prop.type === selectedTypeFilter;
    return matchesSearch && matchesLocation && matchesType;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortByPrice === 'asc') return a.price - b.price;
    if (sortByPrice === 'desc') return b.price - a.price;
    return 0;
  });

  const filteredTutors = (tutors || []).filter(tut => {
    const subjectsStr = Array.isArray(tut.subjects) ? tut.subjects.join(' ') : '';
    const matchesSearch = tut.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tut.education.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subjectsStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocationFilter === 'all' || tut.location === selectedLocationFilter;
    return matchesSearch && matchesLocation;
  });

  const sortedTutors = [...filteredTutors].sort((a, b) => {
    if (sortByPrice === 'asc') return a.salaryExpected - b.salaryExpected;
    if (sortByPrice === 'desc') return b.salaryExpected - a.salaryExpected;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Stats Option */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">পোস্ট ও কন্টেন্ট নিয়ন্ত্রণ</h2>
          <p className="text-sm text-slate-500">বাসা ভাড়া এবং হোম টিউশন বিজ্ঞাপনের তালিকা, সম্পাদনা এবং ডিলিট করার স্থান</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start md:self-auto">
          <button 
            type="button"
            onClick={() => {
              setActiveSubTab('properties');
              setSearchTerm('');
              setSelectedLocationFilter('all');
              setSelectedTypeFilter('all');
              setSortByPrice('none');
            }}
            className={`px-4.5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'properties' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <FileText className="w-4 h-4" />
            <span>বাসা ভাড়া ({properties?.length || 0})</span>
          </button>
          <button 
            type="button"
            onClick={() => {
              setActiveSubTab('tutors');
              setSearchTerm('');
              setSelectedLocationFilter('all');
              setSelectedTypeFilter('all');
              setSortByPrice('none');
            }}
            className={`px-4.5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'tutors' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Briefcase className="w-4 h-4" />
            <span>হোম টিউটর ({tutors?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Filters, Search, Sort */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={activeSubTab === 'properties' ? "ফ্ল্যাট, ঠিকানা বা বিবরণ লিখে খুঁজুন..." : "টিউটর নাম, প্রতিষ্ঠান বা বিষয় লিখে খুঁজুন..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-sans transition-all"
          />
        </div>

        <div>
          <select 
            value={selectedLocationFilter}
            onChange={e => setSelectedLocationFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300 focus:outline-none font-bold"
          >
            <option value="all">📍 সব এলাকা (All Locations)</option>
            {MAIN_LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {activeSubTab === 'properties' ? (
            <select 
              value={selectedTypeFilter}
              onChange={e => setSelectedTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300 focus:outline-none font-bold"
            >
              <option value="all">🏠 সব ধরন (All Types)</option>
              {PROPERTY_TYPES.map(t => (
                <option key={t} value={t}>{t === 'Flat' ? 'ফ্ল্যাট' : t === 'Seat' ? 'সিট' : t === 'Single Room' ? 'সিঙ্গেল রুম' : 'মেস'}</option>
              ))}
            </select>
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (sortByPrice === 'none') setSortByPrice('asc');
              else if (sortByPrice === 'asc') setSortByPrice('desc');
              else setSortByPrice('none');
            }}
            title="মূল্য অনুযায়ী সাজান"
            className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all cursor-pointer ${sortByPrice !== 'none' ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 text-indigo-600 text-sm' : 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-500'}`}
          >
            <ArrowUpDown className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-bold font-sans">
              {sortByPrice === 'none' ? 'বেতন/ভাড়া সাজান' : sortByPrice === 'asc' ? 'নিম্ন-উচ্চ' : 'উচ্চ-নিম্ন'}
            </span>
          </button>
        </div>
      </div>

      {/* Main List Display */}
      {activeSubTab === 'properties' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedProperties.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-4xl">🏜️</span>
              <p className="mt-3 text-slate-500 font-bold">কোনো বাসা ভাড়ার পোস্ট খুঁজে পাওয়া যায়নি!</p>
            </div>
          ) : (
            sortedProperties.map(property => (
              <div 
                key={property.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
                        {property.type === 'Flat' ? 'ফ্ল্যাট' : property.type === 'Seat' ? 'সিট' : property.type === 'Single Room' ? 'সিঙ্গেল রুম' : 'মেস'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug line-clamp-1">{property.title}</h4>
                    </div>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-sans whitespace-nowrap">
                      ৳{property.price}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{property.description}</p>

                  <div className="grid grid-cols-1 gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{property.location} • {property.address}</span>
                    </div>

                    {property.contactNumber && (
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />
                        <span>ভোক্তা ফোন: {property.contactNumber}</span>
                      </div>
                    )}

                    {property.ownerPhoneNumber && (
                      <div className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-500 shrink-0" />
                        <span>মালিক ফোন: {property.ownerPhoneNumber}</span>
                      </div>
                    )}

                    <div className="flex items-center mt-1">
                      {property.isAvailable ? (
                        <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md font-bold">
                          <CheckCircle className="w-3 h-3 mr-1" /> এভেইলেবল (Available)
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md font-bold">
                          <XCircle className="w-3 h-3 mr-1" /> বুকড (Booked/Unavailable)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  {deleteConfirmId === property.id ? (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 px-3 py-1.5 rounded-xl w-full justify-between">
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">চিরতরে ডিলিট?</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleDeletePropertyConfirm(property.id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-lg cursor-pointer transition-colors"
                        >
                          হ্যাঁ
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          না
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingProperty(property)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>সম্পাদনা করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(property.id)}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedTutors.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-4xl">🏜️</span>
              <p className="mt-3 text-slate-500 font-bold">কোনো হোম টিউটর পোস্ট খুঁজে পাওয়া যায়নি!</p>
            </div>
          ) : (
            sortedTutors.map(tutor => (
              <div 
                key={tutor.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img 
                      src={tutor.image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200'} 
                      referrerPolicy="no-referrer"
                      alt={tutor.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{tutor.name}</h4>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-sans whitespace-nowrap">
                          ৳{tutor.salaryExpected}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate leading-relaxed mt-0.5">{tutor.education}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {tutor.subjects.map((sub, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                        {sub}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />
                      <span>এলাকা: {tutor.location}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />
                      <span>মেয়াদ/সপ্তাহ: {tutor.daysPerWeek || '৩ দিন'} | {tutor.availableTime}</span>
                    </div>

                    {(tutor.phonenumber || tutor.phoneNumber || tutor.contactNumber) && (
                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />
                        <span>ফোন নম্বর: {tutor.phoneNumber || tutor.contactNumber || tutor.phonenumber}</span>
                      </div>
                    )}

                    {tutor.whatsappNumber && (
                      <div className="flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-3.5 h-3.5 mr-1.5 inline-block text-center text-xs">🟢</span>
                        <span>হোয়াটসঅ্যাপ: {tutor.whatsappNumber}</span>
                      </div>
                    )}

                    <div className="flex items-center mt-1">
                      {tutor.isVerified ? (
                        <span className="inline-flex items-center text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-md font-bold">
                          <CheckCircle className="w-3 h-3 mr-1" /> যাচাই করা (Verified Tutor)
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-bold">
                          <XCircle className="w-3 h-3 mr-1" /> নট ভেরিফাইড (Unverified)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  {deleteConfirmId === tutor.id ? (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 px-3 py-1.5 rounded-xl w-full justify-between">
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">চিরতরে ডিলিট?</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleDeleteTutorConfirm(tutor.id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-lg cursor-pointer transition-colors"
                        >
                          হ্যাঁ
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          না
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingTutor(tutor)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>সম্পাদনা করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(tutor.id)}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Property Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>বাসাভাড়া পোস্ট সমাধান করুন</span>
              </h3>
              <button 
                onClick={() => setEditingProperty(null)}
                className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-xl font-bold cursor-pointer transition-colors"
              >
                বন্ধ
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">বিজ্ঞাপন শিরোনাম (Title)</label>
                <input 
                  type="text" 
                  required
                  value={editingProperty.title}
                  onChange={e => setEditingProperty({...editingProperty, title: e.target.value})}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ভাড়া মূল্য (Price BDT)</label>
                <input 
                  type="number" 
                  required
                  value={editingProperty.price}
                  onChange={e => setEditingProperty({...editingProperty, price: Number(e.target.value)})}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white font-sans focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">এলাকা (Location)</label>
                  <select 
                    value={editingProperty.location}
                    onChange={e => setEditingProperty({...editingProperty, location: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  >
                    {MAIN_LOCATIONS.map(loc => (
                      <option key={loc} value={loc} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">বাসার ধরন (Type)</label>
                  <select 
                    value={editingProperty.type}
                    onChange={e => setEditingProperty({...editingProperty, type: e.target.value as any})}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t === 'Flat' ? 'ফ্ল্যাট' : t === 'Seat' ? 'সিট' : t === 'Single Room' ? 'সিঙ্গেল রুম' : 'মেস'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">বিস্তারিত ঠিকানা (Address)</label>
                <input 
                  type="text" 
                  required
                  value={editingProperty.address}
                  onChange={e => setEditingProperty({...editingProperty, address: e.target.value})}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ভোক্তা ফোন (Contact Phone)</label>
                  <input 
                    type="tel" 
                    value={editingProperty.contactNumber || ''}
                    onChange={e => setEditingProperty({...editingProperty, contactNumber: e.target.value})}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">মালিকের ফোন (Owner Phone)</label>
                  <input 
                    type="tel" 
                    value={editingProperty.ownerPhoneNumber || ''}
                    onChange={e => setEditingProperty({...editingProperty, ownerPhoneNumber: e.target.value})}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">বাসার ছবিসমূহ (Manage Images)</label>
                
                {/* Visual Image Grid with Delete Option */}
                {editingProperty.images && editingProperty.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 p-2 bg-slate-55 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl mb-2 max-h-[160px] overflow-y-auto">
                    {editingProperty.images.map((img, index) => (
                      <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-250 dark:border-slate-800 group bg-slate-100">
                        <img 
                          src={img} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProperty(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                images: (prev.images || []).filter((_, i) => i !== index)
                              };
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-650 hover:bg-red-700 text-white p-1 rounded-full shadow transition-transform hover:scale-110 cursor-pointer"
                          title="ছবি মুছে ফেলুন"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        <span className="absolute bottom-0.5 left-1 bg-slate-950/60 px-1 rounded text-[9px] text-white">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl mb-2">
                    কোনো ছবি যুক্ত করা নেই
                  </div>
                )}

                {/* Local upload & Web url inputs */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <label 
                      onDragOver={handleDragOverProperty}
                      onDragLeave={handleDragLeaveProperty}
                      onDrop={handleDropProperty}
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-4 px-3 text-center cursor-pointer transition-all ${isDraggingProperty ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30' : 'border-indigo-200 hover:border-indigo-500 dark:border-indigo-800 dark:hover:border-indigo-600 bg-indigo-50/10 hover:bg-indigo-50/20 dark:bg-indigo-950/5 dark:hover:bg-indigo-950/10'}`}
                    >
                      <Upload className="w-5 h-5 text-indigo-500 mb-1 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isDraggingProperty ? 'এখানে ড্রপ করে দিন!' : 'নতুন ছবি আপলোড করতে এখানে ক্লিক করুন অথবা ড্রাগ অ্যান্ড ড্রপ করুন'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPEG, WebP (একসাথে একাধিক ছবি মাউস দিয়ে ড্রাগ করুন)
                      </span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleFileChangeProperty}
                        className="hidden" 
                      />
                    </label>

                    <div className="flex gap-1.5 mt-1">
                      <input 
                        type="url"
                        value={editPropertyUrlInput}
                        onChange={e => setEditPropertyUrlInput(e.target.value)}
                        placeholder="সরাসরি লিংক (URL) লিখুন..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editPropertyUrlInput.trim()) {
                            setEditingProperty(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                images: [...(prev.images || []), editPropertyUrlInput.trim()]
                              };
                            });
                            setEditPropertyUrlInput('');
                            toast.success('লিংক যোগ করা হয়েছে!');
                          }
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                      >
                        যোগ
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">বাসার বিবরণ (Description)</label>
                <textarea 
                  rows={3}
                  required
                  value={editingProperty.description}
                  onChange={e => setEditingProperty({...editingProperty, description: e.target.value})}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-100/55 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 p-3 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="prop_isAvailable"
                  checked={editingProperty.isAvailable}
                  onChange={e => setEditingProperty({...editingProperty, isAvailable: e.target.checked})}
                  className="w-4.5 h-4.5 accent-indigo-600 rounded"
                />
                <label htmlFor="prop_isAvailable" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                  বাসাটি এখনো এভেইলেবল বা সক্রিয় আছে
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  সংরক্ষণ করুন (Save Changes)
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-sm font-bold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tutor Edit Modal */}
      {editingTutor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>টিউটর প্রোফাইল সংশোধন করুন</span>
              </h3>
              <button 
                onClick={() => setEditingTutor(null)}
                className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-xl font-bold cursor-pointer transition-colors"
              >
                বন্ধ
              </button>
            </div>

            <form onSubmit={handleSaveTutor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">টিউটরের নাম (Tutor Name)</label>
                <input 
                  type="text" 
                  required
                  value={editingTutor.name}
                  onChange={e => setEditingTutor({...editingTutor, name: e.target.value})}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">শিক্ষাগত যোগ্যতা (Education)</label>
                <input 
                  type="text" 
                  required
                  value={editingTutor.education}
                  onChange={e => setEditingTutor({...editingTutor, education: e.target.value})}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">প্রোফাইল পিকচার লিংক বা আপলোড (Profile Image)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={editingTutor.image || ''}
                    onChange={e => setEditingTutor({...editingTutor, image: e.target.value})}
                    className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    placeholder="URL..."
                  />
                  <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    আপলোড
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChangeTutor} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">পড়ানোর বিষয়সমূহ (Subjects - কমা দিয়ে আলাদা করুন)</label>
                <input 
                  type="text" 
                  required
                  value={Array.isArray(editingTutor.subjects) ? editingTutor.subjects.join(', ') : editingTutor.subjects}
                  onChange={e => setEditingTutor({...editingTutor, subjects: e.target.value as any})}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">আকাঙ্ক্ষিত বেতন (Salary Expected)</label>
                  <input 
                    type="number" 
                    required
                    value={editingTutor.salaryExpected}
                    onChange={e => setEditingTutor({...editingTutor, salaryExpected: Number(e.target.value)})}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white font-sans focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">এলাকা (Location)</label>
                  <select 
                    value={editingTutor.location}
                    onChange={e => setEditingTutor({...editingTutor, location: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  >
                    {MAIN_LOCATIONS.map(loc => (
                      <option key={loc} value={loc} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ফোন নাম্বার (Phone)</label>
                  <input 
                    type="tel" 
                    value={editingTutor.phoneNumber || editingTutor.contactNumber || ''}
                    onChange={e => setEditingTutor({...editingTutor, phoneNumber: e.target.value})}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">হোয়াটসঅ্যাপ (WhatsApp)</label>
                  <input 
                    type="tel" 
                    value={editingTutor.whatsappNumber || ''}
                    onChange={e => setEditingTutor({...editingTutor, whatsappNumber: e.target.value})}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">সময় (Available Time)</label>
                  <input 
                    type="text" 
                    value={editingTutor.availableTime}
                    onChange={e => setEditingTutor({...editingTutor, availableTime: e.target.value})}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">সপ্তাহে কত দিন (Days Per Week)</label>
                  <select 
                    value={editingTutor.daysPerWeek || '৩ দিন'} 
                    onChange={e => setEditingTutor({...editingTutor, daysPerWeek: e.target.value})} 
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="১ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">১ দিন</option>
                    <option value="২ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">২ দিন</option>
                    <option value="৩ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৩ দিন</option>
                    <option value="৪ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৪ দিন</option>
                    <option value="৫ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৫ দিন</option>
                    <option value="৬ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৬ দিন</option>
                    <option value="৭ দিন" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">৭ দিন</option>
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">লিঙ্গ (Gender)</label>
                   <select 
                    value={editingTutor.gender || 'male'} 
                    onChange={e => setEditingTutor({...editingTutor, gender: e.target.value as any})} 
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="male">ছেলে</option>
                    <option value="female">মেয়ে</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">অভিজ্ঞতা (Experience)</label>
                  <textarea 
                    value={editingTutor.experience || ''} 
                    onChange={e => setEditingTutor({...editingTutor, experience: e.target.value})} 
                    className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                    placeholder="উদাহরণ: ২ বছরের অভিজ্ঞতা..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-100/55 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 p-3 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="tut_isVerified"
                  checked={editingTutor.isVerified}
                  onChange={e => setEditingTutor({...editingTutor, isVerified: e.target.checked})}
                  className="w-4.5 h-4.5 accent-indigo-600 rounded"
                />
                <label htmlFor="tut_isVerified" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                  টিউটরের প্রোফাইলটি ভেরিফাইড (যাচাইকৃত) হিসেবে দেখান
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  সংরক্ষণ করুন (Save Changes)
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTutor(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-sm font-bold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
