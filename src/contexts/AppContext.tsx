import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { User, Property, Tutor, Invoice, AdBanner } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  properties: Property[];
  tutors: Tutor[];
  invoices: Invoice[];
  banners: AdBanner[];
  heroVideoUrl: string;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  selectedLocation: string | null;
  setSelectedLocation: (loc: string | null) => void;
  login: (email: string, password?: string, isAdminAttempt?: boolean) => boolean;
  logout: () => void;
  registerUser: (user: User) => void;
  addProperty: (property: Property) => void;
  addTutor: (tutor: Tutor) => void;
  addInvoice: (invoice: Invoice) => void;
  updateUserNID: (userId: string, status: 'pending' | 'verified' | 'rejected') => void;
  updateProfile: (userId: string, data: Partial<User>, showToast?: boolean) => void;
  updateSubscription: (userId: string, type: string, endDate: string) => void;
  deleteUser: (userId: string) => void;
  updateBanner: (id: string, data: Partial<AdBanner>) => void;
  addBanner: (banner: AdBanner) => void;
  deleteBanner: (id: string) => void;
  updateHeroVideoUrl: (url: string) => void;
}

const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=c0yFdX4VRKI&t=127s';

const defaultState: AppState = {
  currentUser: null,
  users: [],
  properties: [],
  tutors: [],
  invoices: [],
  banners: [],
  heroVideoUrl: DEFAULT_VIDEO_URL,
  isLoading: true,
};

const DEFAULT_BANNERS: AdBanner[] = [
  {
    id: 'banner1',
    badgeBn: 'নিরাপদ ফ্ল্যাট বুকিং',
    badgeEn: 'Secure Home Rental',
    titleBn: 'বাসা ভাড়া ডটকম ভেরিফাইড ফ্ল্যাট!',
    titleEn: 'BasaVara Verified Homes!',
    descBn: 'কোনো মধ্যস্বত্বভোগী ছাড়াই সরাসরি বাড়িওয়ালার সাথে যোগাযোগ সাপেক্ষে বুকিং করুন নিরাপদে।',
    descEn: 'Contact verified property owners directly without any middleman safely and easily.',
    buttonTextBn: 'বিজ্ঞাপনগুলো দেখুন',
    buttonTextEn: 'Explore Rentals',
    link: '/rentals',
    image: '',
    gradientFrom: 'teal-500',
    gradientTo: 'emerald-600',
    iconEmoji: '🏡',
    secondaryEmoji: '⚡'
  },
  {
    id: 'banner2',
    badgeBn: 'অভিজ্ঞ গৃহশিক্ষক',
    badgeEn: 'Expert Home Tutors',
    titleBn: 'সেরা টিউটর খুঁজছেন আপনার সন্তানের জন্য?',
    titleEn: 'Looking for the Best Tutor?',
    descBn: 'এনআইডি এবং সার্টিফিকেট ভেরিফাইড অভিজ্ঞ হোম টিউটর খুঁজে নিন আজই।',
    descEn: 'Find background-checked and NID verified experienced tutors in just a few clicks.',
    buttonTextBn: 'টিউটর খুঁজুন',
    buttonTextEn: 'Hire a Tutor',
    link: '/tutors',
    image: '',
    gradientFrom: 'rose-500',
    gradientTo: 'pink-600',
    iconEmoji: '🎓',
    secondaryEmoji: '🎯'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Initial Data
const MOCK_PROPERTIES: Property[] = [
  { id: 'p1', ownerId: 'u1', title: 'Bright 2BHK Flat', description: 'South facing, fully tiled.', location: 'Mymensingh Sadar', address: '12/A Charpara', type: 'Flat', price: 12000, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'], isAvailable: true, createdAt: new Date().toISOString(), contactNumber: '017XXXXXXXX' },
  { id: 'p2', ownerId: 'u2', title: '1 Seat in Standard Mess', description: '3 seats in one room. Food excluded.', location: 'Madhupur', address: 'Munsur Ali Road', type: 'Seat', price: 1500, images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'], isAvailable: true, createdAt: new Date().toISOString(), contactNumber: '018XXXXXXXX' },
];

const MOCK_TUTORS: Tutor[] = [
  { id: 't1', userId: 'u3', name: 'Md. Rakibul Islam', subjects: ['Mathematics', 'Physics'], education: 'B.Sc in EEE, BAU', availableDays: ['Sunday', 'Tuesday', 'Thursday'], availableTime: '5:00 PM - 8:00 PM', location: 'Mymensingh Sadar', salaryExpected: 4000, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', isVerified: true, contactNumber: '019XXXXXXXX' },
];

const MOCK_ADMIN: User = { id: 'admin1', name: 'System Admin', email: 'admin@basavara.com', password: 'admin', role: 'admin', nidStatus: 'verified', isApproved: true };

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const [selectedLocation, setSelectedLocationState] = useState<string | null>(() => {
    return localStorage.getItem('basavara_selected_location');
  });

  const setSelectedLocation = (loc: string | null) => {
    setSelectedLocationState(loc);
    if (loc) {
      localStorage.setItem('basavara_selected_location', loc);
    } else {
      localStorage.removeItem('basavara_selected_location');
    }
  };

  // Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem('basavara_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (!parsed.banners || parsed.banners.length === 0) {
        parsed.banners = DEFAULT_BANNERS;
      }
      if (parsed.heroVideoUrl === undefined || 
          parsed.heroVideoUrl === 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-31414-large.mp4' ||
          parsed.heroVideoUrl === 'https://assets.mixkit.co/videos/preview/mixkit-realtor-showing-apartment-to-couple-40332-large.mp4') {
        parsed.heroVideoUrl = DEFAULT_VIDEO_URL;
      }
      setState({ ...parsed, isLoading: false });
    } else {
      const initialState = {
        ...defaultState,
        users: [MOCK_ADMIN],
        properties: MOCK_PROPERTIES,
        tutors: MOCK_TUTORS,
        banners: DEFAULT_BANNERS,
        heroVideoUrl: DEFAULT_VIDEO_URL,
        isLoading: false
      };
      setState(initialState);
      localStorage.setItem('basavara_data', JSON.stringify(initialState));
    }
  }, []);

  // Save to LocalStorage whenever state changes (excluding isLoading)
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('basavara_data', JSON.stringify({
        ...state,
        isLoading: false
      }));
    }
  }, [state]);

  const login = (email: string, password?: string, isAdminAttempt?: boolean) => {
    const user = state.users.find(u => u.email === email);
    if (user) {
      if (password && user.password && user.password !== password) {
         toast.error('ভুল পাসওয়ার্ড (Incorrect password)');
         return false;
      }
      if (!isAdminAttempt && user.role === 'admin') {
         toast.error('এডমিন লগইন এই পেইজ থেকে দেওয়া যাবে না। (Admin login restricted here)');
         return false;
      }
      if (isAdminAttempt && user.role !== 'admin') {
         toast.error('আপনি এডমিন নন! (You are not an Admin!)');
         return false;
      }
      
      // Checking Admin Approval Status
      if (user.role !== 'admin' && !user.isApproved) {
         toast.error('আপনার অ্যাকাউন্টটি অ্যাডমিন কর্তৃক অনুমোদিত নয়। অনুমোদন পাওয়ার পর লগইন করতে পারবেন। (Your account is not approved yet by admin)');
         return false;
      }
      
      setState(prev => ({ ...prev, currentUser: user }));
      toast.success('Successfully logged in!');
      return true;
    } else {
      toast.error('User not found. Please register.');
      return false;
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    toast.success('Logged out');
  };

  const registerUser = (user: User) => {
    const newUser = { ...user, isApproved: user.role === 'admin' ? true : false };
    setState(prev => {
      const isFirst = prev.users.length === 0;
      if(isFirst && newUser.email === 'admin@basavara.com') {
        newUser.role = 'admin';
        newUser.isApproved = true;
      }
      return { ...prev, users: [...prev.users, newUser] };
    });
    
    if (newUser.role === 'visitor') {
      toast.success('ভিজিটর রেজিস্ট্রেশন সফল হয়েছে এবং অ্যাকাউন্টটি সিস্টেম এডমিন অনুমোদনের অপেক্ষায় রয়েছে!', { duration: 6000 });
    } else {
      toast.success('রেজিস্ট্রেশন এবং পেমেন্ট সম্পন্ন হয়েছে। এডমিন ড্যাশবোর্ড থেকে অনুমোদিত হওয়ার পর আপনি লগইন করতে পারবেন।', { duration: 6000 });
    }
  };

  const addProperty = (property: Property) => {
    setState(prev => ({ ...prev, properties: [property, ...prev.properties] }));
    toast.success('Property details added.');
  };

  const addTutor = (tutor: Tutor) => {
    setState(prev => ({ ...prev, tutors: [tutor, ...prev.tutors] }));
    toast.success('Tutor profile added.');
  };

  const addInvoice = (invoice: Invoice) => {
    setState(prev => ({ ...prev, invoices: [...prev.invoices, invoice] }));
    toast.success('Invoice submitted successfully.');
  };

  const updateUserNID = (userId: string, status: 'pending' | 'verified' | 'rejected') => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, nidStatus: status, isApproved: status === 'verified' ? true : u.isApproved } : u)
    }));
    toast.success(status === 'verified' ? 'এনআইডি যাচাই ও অ্যাকাউন্ট অনুমোদিত হয়েছে!' : 'এনআইডি স্ট্যাটাস হালনাগাদ করা হয়েছে।');
  };

  const updateProfile = (userId: string, data: Partial<User>, showToast = true) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => u.id === userId ? { ...u, ...data } : u);
      const updatedCurrentUser = prev.currentUser?.id === userId ? { ...prev.currentUser, ...data } : prev.currentUser;
      return { ...prev, users: updatedUsers, currentUser: updatedCurrentUser };
    });
    if (showToast) {
      toast.success('Profile updated successfully!');
    }
  };

  const updateSubscription = (userId: string, type: string, endDate: string) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => u.id === userId ? { ...u, subscriptionType: type, subscriptionEnd: endDate } : u);
      const updatedCurrentUser = prev.currentUser?.id === userId ? { ...prev.currentUser, subscriptionType: type, subscriptionEnd: endDate } : prev.currentUser;
      return { ...prev, users: updatedUsers, currentUser: updatedCurrentUser };
    });
  };

  const deleteUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
    toast.success('ব্যবহারকারী মুচে ফেলা হয়েছে (User deleted).');
  };

  const updateBanner = (id: string, data: Partial<AdBanner>) => {
    setState(prev => ({
      ...prev,
      banners: (prev.banners && prev.banners.length > 0 ? prev.banners : DEFAULT_BANNERS).map(b => b.id === id ? { ...b, ...data } : b)
    }));
    toast.success('বিজ্ঞাপন ব্যানার সফলভাবে আপডেট করা হয়েছে');
  };

  const addBanner = (banner: AdBanner) => {
    setState(prev => ({
      ...prev,
      banners: [...(prev.banners && prev.banners.length > 0 ? prev.banners : DEFAULT_BANNERS), banner]
    }));
    toast.success('বিজ্ঞাপন ব্যানার সফলভাবে যোগ করা হয়েছে');
  };

  const deleteBanner = (id: string) => {
    setState(prev => ({
      ...prev,
      banners: (prev.banners && prev.banners.length > 0 ? prev.banners : DEFAULT_BANNERS).filter(b => b.id !== id)
    }));
    toast.success('বিজ্ঞাপন ব্যানার সফলভাবে মুছে ফেলা হয়েছে');
  };

  const updateHeroVideoUrl = (url: string) => {
    setState(prev => ({
      ...prev,
      heroVideoUrl: url
    }));
    toast.success('হোম পেইজ ব্যাকগ্রাউন্ড ভিডিও আপডেট করা হয়েছে');
  };

  return (
    <AppContext.Provider value={{
      ...state,
      selectedLocation,
      setSelectedLocation,
      login, logout, registerUser, addProperty, addTutor, addInvoice, updateUserNID, updateProfile, updateSubscription, deleteUser, updateBanner, addBanner, deleteBanner, updateHeroVideoUrl
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};
