import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { User, Property, Tutor, Invoice, AdBanner, Visitor } from '../types';
import { db, auth } from '../lib/firebase';
import { generateId } from '../lib/utils';
import {   collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  deleteField
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}



const sendEmailHelper = async (payload: {
  to?: string;
  subject: string;
  html: string;
  notifyAdmin?: boolean;
  attachments?: { filename: string; content: string }[];
}): Promise<boolean> => {
  try {
    const workerUrl = (import.meta as any).env.VITE_EMAIL_WORKER_URL;
    const endpoint = (workerUrl && workerUrl.trim() !== '') ? workerUrl.trim() : '/api/send-email';
    
    console.log('[Email Client] Sending email via endpoint:', endpoint);
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return !!data?.success;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
};

interface AppState {
  currentUser: User | null;
  users: User[];
  properties: Property[];
  tutors: Tutor[];
  invoices: Invoice[];
  banners: AdBanner[];
  heroVideoUrl: string;
  apiUrl: string;
  visitors: Visitor[];
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
  updateApiUrl: (url: string) => void;
  sendRenewalEmailManual: (userId: string) => Promise<boolean>;
  approveSubscriptionRenewal: (userId: string) => Promise<boolean>;
  rejectSubscriptionRenewal: (userId: string) => Promise<boolean>;
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
  apiUrl: '',
  visitors: [],
  isLoading: true,
};

export const DEFAULT_BANNERS: AdBanner[] = [
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

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
};

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const [selectedLocation, setSelectedLocationState] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeLocalStorage.getItem('basavara_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const setSelectedLocation = (loc: string | null) => {
    setSelectedLocationState(loc);
  };

  const hasAutoCheckedRef = React.useRef(false);

  useEffect(() => {
    if (state.users.length > 0 && !hasAutoCheckedRef.current) {
      hasAutoCheckedRef.current = true;
      checkAndAutoNotifyExpiringSubscriptions(state.users);
    }
  }, [state.users]);

  // Setup Firestore synchronization
  useEffect(() => {
    let active = true;

    // Helper to seed database if empty
    const seedIfEmpty = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users')).catch(err => {
          handleFirestoreError(err, OperationType.GET, 'users');
          throw err;
        });
        if (usersSnap.empty) {
          await setDoc(doc(db, 'users', MOCK_ADMIN.id), MOCK_ADMIN).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${MOCK_ADMIN.id}`);
            throw err;
          });
        }
        
        const propertiesSnap = await getDocs(collection(db, 'properties')).catch(err => {
          handleFirestoreError(err, OperationType.GET, 'properties');
          throw err;
        });
        if (propertiesSnap.empty) {
           const demoProperties = [
             { id: 'p1', ownerId: 'u1', title: 'Modern 2BHK Flat', description: 'Very cozy and modern.', location: 'Dhaka', address: 'Mirpur 10', type: 'Flat', price: 15000, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'], isAvailable: true, createdAt: new Date().toISOString(), contactNumber: '01700000000' },
             { id: 'p2', ownerId: 'u1', title: 'Sunny Single Room', description: 'Great sunlight.', location: 'Mymensingh Sadar', address: 'Dhanmondi', type: 'Single Room', price: 5000, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'], isAvailable: true, createdAt: new Date().toISOString(), contactNumber: '01700000000' },
             { id: 'p3', ownerId: 'u1', title: 'Student Mess Seat', description: 'Quiet environment.', location: 'Madhupur', address: 'Farmgate', type: 'Seat', price: 2000, images: ['https://images.unsplash.com/photo-15024428134df-7d4726027ece?w=400'], isAvailable: true, createdAt: new Date().toISOString(), contactNumber: '01700000000' }
           ];
          for (const p of demoProperties) {
            await setDoc(doc(db, 'properties', p.id), p).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `properties/${p.id}`);
              throw err;
            });
          }
        } else {
          // Sync existing legacy data to match dropdown locations
          propertiesSnap.forEach(async (docSnap) => {
            const data = docSnap.data();
            let changed = false;
            let newLoc = data.location;
            if (newLoc === 'Mirpur 10') { newLoc = 'Dhaka'; changed = true; }
            else if (newLoc === 'Dhanmondi') { newLoc = 'Mymensingh Sadar'; changed = true; }
            else if (newLoc === 'Farmgate') { newLoc = 'Madhupur'; changed = true; }

            if (changed) {
              await setDoc(doc(db, 'properties', docSnap.id), { ...data, location: newLoc }, { merge: true });
            }
          });
        }

        const tutorsSnap = await getDocs(collection(db, 'tutors')).catch(err => {
          handleFirestoreError(err, OperationType.GET, 'tutors');
          throw err;
        });
        if (tutorsSnap.empty) {
          const demoTutors = [
            { id: 't1', userId: 'u1', name: 'Rahim Ahmed', subjects: ['Math', 'English'], education: 'B.Sc in CSE', availableDays: ['Sun', 'Mon'], availableTime: 'Morning', location: 'Dhaka', salaryExpected: 3000, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', isVerified: true, contactNumber: '01800000000' },
            { id: 't2', userId: 'u1', name: 'Fatima Islam', subjects: ['Physics', 'Chemistry'], education: 'B.Sc in Physics', availableDays: ['Tue', 'Wed'], availableTime: 'Evening', location: 'Mymensingh Sadar', salaryExpected: 4000, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', isVerified: true, contactNumber: '01800000000' },
            { id: 't3', userId: 'u1', name: 'Karim Ullah', subjects: ['Biology'], education: 'MBBS Student', availableDays: ['Fri'], availableTime: 'Afternoon', location: 'Madhupur', salaryExpected: 2500, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', isVerified: true, contactNumber: '01800000000' }
          ];
          for (const t of demoTutors) {
            await setDoc(doc(db, 'tutors', t.id), t).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `tutors/${t.id}`);
              throw err;
            });
          }
        } else {
          // Sync existing legacy data to match dropdown locations
          tutorsSnap.forEach(async (docSnap) => {
            const data = docSnap.data();
            let changed = false;
            let newLoc = data.location;
            if (newLoc === 'Mirpur 10') { newLoc = 'Dhaka'; changed = true; }
            else if (newLoc === 'Dhanmondi') { newLoc = 'Mymensingh Sadar'; changed = true; }
            else if (newLoc === 'Farmgate') { newLoc = 'Madhupur'; changed = true; }

            if (changed) {
              await setDoc(doc(db, 'tutors', docSnap.id), { ...data, location: newLoc }, { merge: true });
            }
          });
        }

        const bannersSnap = await getDocs(collection(db, 'banners')).catch(err => {
          handleFirestoreError(err, OperationType.GET, 'banners');
          throw err;
        });
        if (bannersSnap.empty) {
          for (const b of DEFAULT_BANNERS) {
            await setDoc(doc(db, 'banners', b.id), b).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `banners/${b.id}`);
              throw err;
            });
          }
        }

        const settingsSnap = await getDoc(doc(db, 'settings', 'global')).catch(err => {
          handleFirestoreError(err, OperationType.GET, 'settings/global');
          throw err;
        });
        if (!settingsSnap.exists()) {
          await setDoc(doc(db, 'settings', 'global'), { heroVideoUrl: DEFAULT_VIDEO_URL }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, 'settings/global');
            throw err;
          });
        }
      } catch (err) {
        console.error("Firestore seeding failed:", err);
      }
    };

    seedIfEmpty();

    // Setup active listeners
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach(doc => {
        usersList.push(doc.data() as User);
      });
      console.log('DEBUG: Loaded users', usersList.length);
      if (active) {
        setState(prev => ({ ...prev, users: usersList }));
      }
    }, (err) => {
      console.error('DEBUG: Error loading users', err);
      handleFirestoreError(err, OperationType.GET, 'users');
    });

    const unsubProperties = onSnapshot(collection(db, 'properties'), (snapshot) => {
      const propertiesList: Property[] = [];
      snapshot.forEach(doc => {
        propertiesList.push(doc.data() as Property);
      });
      console.log('DEBUG: Loaded properties', propertiesList.length);
      if (active) {
        setState(prev => ({ ...prev, properties: propertiesList }));
      }
    }, (err) => {
      console.error('DEBUG: Error loading properties', err);
      handleFirestoreError(err, OperationType.GET, 'properties');
    });

    const unsubTutors = onSnapshot(collection(db, 'tutors'), (snapshot) => {
      const tutorsList: Tutor[] = [];
      snapshot.forEach(doc => {
        tutorsList.push(doc.data() as Tutor);
      });
      console.log('DEBUG: Loaded tutors', tutorsList.length);
      if (active) {
        setState(prev => ({ ...prev, tutors: tutorsList }));
      }
    }, (err) => {
      console.error('DEBUG: Error loading tutors', err);
      handleFirestoreError(err, OperationType.GET, 'tutors');
    });

    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      const invoicesList: Invoice[] = [];
      snapshot.forEach(doc => {
        invoicesList.push(doc.data() as Invoice);
      });
      if (active) {
        setState(prev => ({ ...prev, invoices: invoicesList }));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'invoices');
    });

    const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const bannersList: AdBanner[] = [];
      snapshot.forEach(doc => {
        bannersList.push(doc.data() as AdBanner);
      });
      console.log('DEBUG: Loaded banners, count:', bannersList.length);
      if (active) {
        setState(prev => ({
          ...prev,
          banners: bannersList.length > 0 ? bannersList : DEFAULT_BANNERS
        }));
      }
    }, (err) => {
      console.error('DEBUG: Error loading banners', err);
      handleFirestoreError(err, OperationType.GET, 'banners');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists() && active) {
        const data = docSnap.data();
        setState(prev => ({ 
          ...prev, 
          heroVideoUrl: data.heroVideoUrl || DEFAULT_VIDEO_URL,
          apiUrl: data.apiUrl || ''
        }));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });

    const unsubVisitors = onSnapshot(collection(db, 'visitors'), (snapshot) => {
      const visitorsList: Visitor[] = [];
      snapshot.forEach(docSnap => {
        visitorsList.push(docSnap.data() as Visitor);
      });
      if (active) {
        setState(prev => ({ ...prev, visitors: visitorsList }));
      }
    }, (err) => {
      console.error('DEBUG: Error loading visitors', err);
    });

    setState(prev => ({ ...prev, isLoading: false }));

    return () => {
      active = false;
      unsubUsers();
      unsubProperties();
      unsubTutors();
      unsubInvoices();
      unsubBanners();
      unsubSettings();
      unsubVisitors();
    };
  }, []);

  // Update localStorage current user if its state is modified in state.users
  useEffect(() => {
    if (currentUser) {
      const freshUser = state.users.find(u => u.id === currentUser.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
        safeLocalStorage.setItem('basavara_current_user', JSON.stringify(freshUser));
      }
    }
  }, [state.users, currentUser]);

  // Real-time visitor tracking and heartbeat
  const location = useLocation();
  useEffect(() => {
    let visitorId = safeLocalStorage.getItem('basavara_visitor_id');
    let isNewVisitor = false;
    if (!visitorId) {
      visitorId = 'visitor_' + generateId();
      safeLocalStorage.setItem('basavara_visitor_id', visitorId);
      isNewVisitor = true;
    }

    const docRef = doc(db, 'visitors', visitorId);

    const getDeviceInfo = () => {
      const ua = navigator.userAgent;
      let browser = "Unknown Browser";
      let os = "Unknown OS";

      if (ua.indexOf("Firefox") > -1) {
        browser = "Firefox";
      } else if (ua.indexOf("SamsungBrowser") > -1) {
        browser = "Samsung Browser";
      } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
        browser = "Opera";
      } else if (ua.indexOf("Trident") > -1) {
        browser = "IE";
      } else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) {
        browser = "Edge";
      } else if (ua.indexOf("Chrome") > -1) {
        browser = "Chrome";
      } else if (ua.indexOf("Safari") > -1) {
        browser = "Safari";
      }

      if (ua.indexOf("Windows NT 10.0") > -1) os = "Windows 10/11";
      else if (ua.indexOf("Windows NT 6.2") > -1) os = "Windows 8";
      else if (ua.indexOf("Windows NT 6.1") > -1) os = "Windows 7";
      else if (ua.indexOf("Macintosh") > -1) os = "macOS";
      else if (ua.indexOf("Android") > -1) os = "Android";
      else if (ua.indexOf("iPhone") > -1) os = "iOS";
      else if (ua.indexOf("Linux") > -1) os = "Linux";

      return `${os} / ${browser}`;
    };

    const devInfo = getDeviceInfo();
    const uId = currentUser?.id || null;
    const uName = currentUser?.name || null;
    const uRole = currentUser?.role || 'guest';
    const currentPath = location.pathname;

    const updatePresence = async (isHeartbeat = false, status: 'online' | 'offline' = 'online') => {
      if (uRole === 'admin') {
        try {
          await deleteDoc(docRef);
        } catch {
          // Ignore
        }
        return;
      }
      const now = new Date().toISOString();
      try {
        const payload: any = {
          id: visitorId,
          currentPage: currentPath,
          lastActive: now,
          deviceInfo: devInfo,
          userId: uId,
          name: uName,
          role: uRole,
          status: status
        };
        
        if (isHeartbeat) {
          await setDoc(docRef, {
            currentPage: currentPath,
            lastActive: now,
            userId: uId,
            name: uName,
            role: uRole,
            status: status
          }, { merge: true });
        } else {
          // Absolute instant save - no getDoc needed
          const finalPayload = { ...payload };
          if (isNewVisitor) {
            finalPayload.createdAt = now;
          }
          await setDoc(docRef, finalPayload, { merge: true });
        }
      } catch (err) {
        console.error("Presence logging error:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(true, 'online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    updatePresence(false, 'online');

    const interval = setInterval(() => {
      updatePresence(true, 'online');
    }, 5000); // 5.0 seconds heartbeat frequency for stable, fast tracking

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname, currentUser]);

  // Check for expired subscriptions and send email notification
  useEffect(() => {
    if (!state.users || state.users.length === 0) return;

    const checkExpirations = async () => {
      const now = new Date();
      for (const u of state.users) {
        if (
          u.subscriptionEnd &&
          new Date(u.subscriptionEnd) < now &&
          !u.subscriptionExpiryNotified &&
          u.role !== 'admin'
        ) {
          console.log(`[Subscription Check] Expiry detected for ${u.name} (${u.email}) on ${u.subscriptionEnd}. Sending alert...`);
          try {
            await updateDoc(doc(db, 'users', u.id), { subscriptionExpiryNotified: true });
            
            sendEmailHelper({
              to: u.email,
              subject: 'বাসাভাড়া ও টিউটর প্ল্যাটফর্মে আপনার প্যাকেজের মেয়াদ শেষ হয়েছে (Subscription Expired)',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-radius: 8px;">
                  <h2 style="color: #ef4444; text-align: center;">প্যাকেজের মেয়াদ শেষ হয়েছে</h2>
                  <p>প্রিয় ${u.name},</p>
                  <p>আপনার বাসাভাড়া ও টিউটর প্ল্যাটফর্মের (Basavara) প্রিমিয়াম প্যাকেজের মেয়াদ শেষ হয়ে গিয়েছে।</p>
                  <p>আপনার ড্যাশবোর্ডে প্রিমিয়াম সুযোগ-সুবিধাসমূহ এবং বিজ্ঞাপনসমূহ সচল রাখতে দয়া করে আপনার একাউন্ট প্যানেল থেকে পুনরায় সাবস্ক্রিপশনটি নবায়ন করুন।</p>
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${window.location.origin}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">সাবস্ক্রিপশন নবায়ন করুন</a>
                  </div>
                  <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
                  <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
                </div>
              `
            });
          } catch (err) {
            console.error('Error handling subscription expiry email update:', err);
          }
        }
      }
    };

    const timer = setTimeout(() => {
      checkExpirations();
    }, 5000);

    return () => clearTimeout(timer);
  }, [state.users]);

  const login = (email: string, password?: string, isAdminAttempt?: boolean) => {
    const user = state.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
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
      
      setCurrentUser(user);
      safeLocalStorage.setItem('basavara_current_user', JSON.stringify(user));
      toast.success('Successfully logged in!');
      return true;
    } else {
      toast.error('User not found. Please register.');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    safeLocalStorage.removeItem('basavara_current_user');
    toast.success('সফলভাবে লগআউট করা হয়েছে।');
  };

  const checkAndAutoNotifyExpiringSubscriptions = async (usersList: User[]) => {
    const today = new Date();
    for (const u of usersList) {
      if (u.role === 'admin') continue;
      if (!u.subscriptionEnd) continue;
      if (u.subscriptionExpiryNotified) continue;

      const end = new Date(u.subscriptionEnd);
      const diffMs = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Auto notify 3 days before expiry
      if (diffDays > 0 && diffDays <= 3) {
        try {
          await updateDoc(doc(db, 'users', u.id), { subscriptionExpiryNotified: true });
        } catch (err) {
          console.error("Failed to mark subscriptionExpiryNotified in Firestore:", err);
          continue;
        }

        const amount = u.role === 'visitor' ? 25 : 50;

        await sendEmailHelper({
          to: u.email,
          subject: 'আপনার সাবস্ক্রিপশন মেয়াদ শেষ হচ্ছে রিনিউ করুন (Subscription Expiring Soon - Renew - Basavara)',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">সাবস্ক্রিপশন মেয়াদ শেষ হচ্ছে!</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">অ্যাকাউন্ট ভেরিফিকেশন ও প্রিমিয়াম সার্ভিস সচল রাখুন</p>
              </div>
              
              <p>প্রিয় <strong>${u.name}</strong>,</p>
              <p>আপনার বাসাভাড়া ও টিউটর প্ল্যাটফর্ম অ্যাকাউন্টটির সাবস্ক্রিপশন মেয়াদ আগামী <strong>${diffDays} দিনের মধ্যে</strong> শেষ হতে যাচ্ছে। নিরবচ্ছিন্নভাবে বিজ্ঞাপন বা টিউটর প্রোফাইল অ্যাক্টিভ রাখতে অনুগ্রহ করে সাবস্ক্রিপশনটি রিনিউ করুন।</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">সাবস্ক্রিপশন বিবরণ:</h4>
                <p style="margin: 6px 0; font-size: 14px;"><strong>ব্যবহারকারীর নাম:</strong> ${u.name}</p>
                <p style="margin: 6px 0; font-size: 14px;"><strong>অ্যাকাউন্ট টাইপ:</strong> <span style="text-transform: capitalize;">${u.role === 'user' ? 'প্রপার্টি মালিক' : u.role === 'tutor' ? 'টিউটর' : 'সাধারণ ভিজিটর'}</span></p>
                <p style="margin: 6px 0; font-size: 14px;"><strong>মেয়াদ উত্তীর্ণের তারিখ:</strong> ${new Date(u.subscriptionEnd).toLocaleDateString('bn-BD')}</p>
                <p style="margin: 6px 0; font-size: 14px;"><strong>নবায়ন ফি (Renew Fee):</strong> ৳${amount} টাকা (১ মাস / ৩০ দিন)</p>
              </div>
              
              <h4 style="color: #4f46e5; margin-bottom: 12px;">কিভাবে রিনিউ বা ফি পরিশোধ করবেন?</h4>
              <ol style="margin-left: 0; padding-left: 20px; font-size: 14px; color: #334155;">
                <li style="margin-bottom: 8px;">আপনার পছন্দের পেমেন্ট গেটওয়ে (বিকাশ/নগদ/রকেট) পার্সোনাল নাম্বারে <strong>৳${amount} টাকা</strong> সেন্ড মানি করুন।</li>
                <li style="margin-bottom: 8px;">বাসাভাড়া প্ল্যাটফর্মে আপনার অ্যাকাউন্টে লগইন করুন।</li>
                <li style="margin-bottom: 8px;">ড্যাশবোর্ড এর <strong>"সাবস্ক্রিপশন"</strong> সেকশনে গিয়ে পেমেন্ট মাধ্যম সিলেক্ট করে টাকা পাঠানোর <strong>ট্রানজ্যাকশন আইডি (Transaction ID)</strong> সাবমিট করুন।</li>
              </ol>
              
              <p style="margin-top: 25px; text-align: center;">
                <a href="${window.location.origin}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">ড্যাশবোর্ডে প্রবেশ করুন</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #edf2f7; margin: 25px 0;" />
              <p style="text-align: center; font-size: 12px; color: #64748b; margin: 0;">© ${new Date().getFullYear()} Basavara (বাসাভাড়া ও টিউটর প্ল্যাটফর্ম)। সর্বস্বত্ব সংরক্ষিত।</p>
            </div>
          `
        });
      }
    }
  };

  const sendRenewalEmailManual = async (userId: string): Promise<boolean> => {
    try {
      const u = state.users.find(user => user.id === userId);
      if (!u) {
        toast.error('ব্যবহারকারী খুঁজে পাওয়া যায়নি!');
        return false;
      }

      const amount = u.role === 'visitor' ? 25 : 50;

      await sendEmailHelper({
        to: u.email,
        subject: 'নবায়ন অনুরোধ - সাবস্ক্রিপশন রিনিউ করুন (Subscription Expiry Alert - Basavara)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">সাবস্ক্রিপশন মেয়াদ শেষ!</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 5px;">অ্যাকাউন্ট সচল রাখতে অনুগ্রহ করে সাবস্ক্রিপশনটি রিনিউ করুন</p>
            </div>
            
            <p>প্রিয় <strong>${u.name}</strong>,</p>
            <p>আপনার বাসাভাড়া ও টিউটর প্ল্যাটফর্ম অ্যাকাউন্টটির সাবস্ক্রিপশন মেয়াদ অতিবাহিত হয়েছে। আপনার বিজ্ঞাপন বা টিউটর প্রোফাইল এবং কন্টাক্ট নম্বরসমূহ পুনরায় সচল করতে নিচের ধাপগুলো অনুসরণ করে রিনিউ সম্পন্ন করুন:</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">সাবস্ক্রিপশন বিবরণ (Subscription Details):</h4>
              <p style="margin: 6px 0; font-size: 14px;"><strong>ব্যবহারকারীর নাম:</strong> ${u.name}</p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>অ্যাকাউন্ট টাইপ:</strong> <span style="text-transform: capitalize;">${u.role === 'user' ? 'প্রপার্টি মালিক' : u.role === 'tutor' ? 'টিউটর' : 'সাধারণ ভিজিটর'}</span></p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>নবায়ন ফি (Renew Fee):</strong> ৳${amount} টাকা (১ মাস / ৩০ দিন)</p>
            </div>
            
            <h4 style="color: #4f46e5; margin-bottom: 12px;">কিভাবে রিনিউ বা ফি পরিশোধ করবেন?</h4>
            <ol style="margin-left: 0; padding-left: 20px; font-size: 14px; color: #334155;">
              <li style="margin-bottom: 8px;">আপনার পছন্দের পেমেন্ট গেটওয়ে (বিকাশ/নগদ/রকেট) পার্সোনাল নাম্বারে <strong>৳${amount} টাকা</strong> সেন্ড মানি করুন।</li>
              <li style="margin-bottom: 8px;">বাসাভাড়া প্ল্যাটফর্মে আপনার অ্যাকাউন্টে লগইন করুন।</li>
              <li style="margin-bottom: 8px;">ড্যাশবোর্ড এর <strong>"সাবস্ক্রিপশন"</strong> সেকশনে গিয়ে পেমেন্ট মাধ্যম সিলেক্ট করে টাকা পাঠানোর <strong>ট্রানজ্যাকশন আইডি (Transaction ID)</strong> সাবমিট করুন।</li>
            </ol>
            
            <p style="margin-top: 25px; text-align: center;">
              <a href="${window.location.origin}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">ড্যাশবোর্ডে প্রবেশ করুন</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #edf2f7; margin: 25px 0;" />
            <p style="text-align: center; font-size: 12px; color: #64748b; margin: 0;">© ${new Date().getFullYear()} Basavara (বাসাভাড়া ও টিউটর প্ল্যাটফর্ম)। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        `
      });

      return true;
    } catch (err) {
      console.error("Failed to send renewal request manually:", err);
      toast.error('অনুরোধ পাঠানো ব্যর্থ হয়েছে।');
      return false;
    }
  };

  const approveSubscriptionRenewal = async (userId: string): Promise<boolean> => {
    try {
      const u = state.users.find(user => user.id === userId);
      if (!u) {
        toast.error('ব্যবহারকারী খুঁজে পাওয়া যায়নি!');
        return false;
      }

      const type = u.pendingRenewPackage || (u.role === 'visitor' ? 'Visitor Package (৳২৫/মাস)' : u.role === 'tutor' ? 'Tutor Package (৳৫০/মাস)' : 'Owner Package (৳৫০/মাস)');
      const amount = u.pendingRenewAmount || (u.role === 'visitor' ? 25 : 50);

      const currentEnd = u.subscriptionEnd ? new Date(u.subscriptionEnd) : new Date();
      const baseDate = currentEnd.getTime() > Date.now() ? currentEnd : new Date();
      baseDate.setDate(baseDate.getDate() + 30);
      const newEndDateString = baseDate.toISOString();
      const trxId = u.pendingRenewTrxId || 'N/A';
      
      const rawMethodVal = (u.pendingRenewMethod || 'bkash').toLowerCase();
      const method = (rawMethodVal === 'bkash' || rawMethodVal === 'nagad' || rawMethodVal === 'rocket' ? rawMethodVal : 'bkash') as 'bkash' | 'nagad' | 'rocket';
      
      const invoiceId = generateId();
      const invoiceDate = new Date().toISOString();

      // 1. Add permanent approved invoice
      await addInvoice({
        id: invoiceId, 
        userId: u.id, 
        amount, 
        status: 'paid', 
        date: invoiceDate, 
        trxId, 
        method
      });

      // 2. Update user profile to set active subscription and clear pending renewal
      const userRef = doc(db, 'users', u.id);
      const updates = { 
        subscriptionType: type, 
        subscriptionEnd: newEndDateString, 
        subscriptionExpiryNotified: false,
        isApproved: true,
        transactionId: trxId,
        paymentMethod: method,
        pendingRenewStatus: 'approved',
        pendingRenewTrxId: deleteField(),
        pendingRenewMethod: deleteField(),
        pendingRenewPackage: deleteField(),
        pendingRenewAmount: deleteField(),
        pendingRenewSubmittedAt: deleteField()
      };

      await updateDoc(userRef, updates);

      toast.success('সাবস্ক্রিপশন নবায়ন সফলভাবে অনুমোদিত হয়েছে!');

      // Send confirmation email
      sendEmailHelper({
        to: u.email,
        subject: 'আপনার সাবস্ক্রিপশন নবায়ন সফলভাবে অনুমোদিত হয়েছে! (Subscription Renewed - Basavara)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #10b981; margin: 0; font-size: 24px;">সাবস্ক্রিপশন নবায়ন সফল হয়েছে!</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 5px;">প্রিমিয়ার এবং বিজ্ঞাপন সেবাগুলো সচল করা হয়েছে</p>
            </div>
            
            <p>প্রিয় <strong>${u.name}</strong>,</p>
            <p>আমরা অত্যন্ত আনন্দের সাথে জানাচ্ছি যে আপনার পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID: <strong>${trxId}</strong>) মিলিয়ে আমাদের সিস্টেম অ্যাডমিন আপনার সাবস্ক্রিপশন নবায়ন আবেদনটি অনুমোদন করেছেন।</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">নবায়নকৃত সাবস্ক্রিপশন বিবরণ:</h4>
              <p style="margin: 6px 0; font-size: 14px;"><strong>ব্যবহারকারীর নাম:</strong> ${u.name}</p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>নতুন মেয়াদ উত্তীর্ণের তারিখ:</strong> ${new Date(newEndDateString).toLocaleDateString('bn-BD')}</p>
              <p style="margin: 6px 0; font-size: 14px;"><strong>পেমেন্ট মাধ্যম:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #ec4899;">${method}</span></p>
            </div>
            
            <p>আপনার বিজ্ঞাপন এবং কন্টেন্ট প্ল্যাটফর্মে সচরাচর ভিজিবল রয়েছে। ধন্যবাদ আমাদের সাথে থাকার জন্য!</p>
            
            <p style="margin-top: 25px; text-align: center;">
              <a href="${window.location.origin}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">ড্যাশবোর্ডে প্রবেশ করুন</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #edf2f7; margin: 25px 0;" />
            <p style="text-align: center; font-size: 12px; color: #64748b; margin: 0;">© ${new Date().getFullYear()} Basavara (বাসাভাড়া ও টিউটর প্ল্যাটফর্ম)। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        `
      });

      return true;
    } catch (err) {
      console.error("Failed to approve renewal:", err);
      toast.error('অনুমোদন ব্যর্থ হয়েছে।');
      return false;
    }
  };

  const rejectSubscriptionRenewal = async (userId: string): Promise<boolean> => {
    try {
      const u = state.users.find(user => user.id === userId);
      if (!u) {
        toast.error('ব্যবহারকারী খুঁজে পাওয়া যায়নি!');
        return false;
      }

      const userRef = doc(db, 'users', u.id);
      await updateDoc(userRef, {
        pendingRenewStatus: 'rejected',
        pendingRenewTrxId: deleteField(),
        pendingRenewMethod: deleteField(),
        pendingRenewPackage: deleteField(),
        pendingRenewAmount: deleteField(),
        pendingRenewSubmittedAt: deleteField()
      });

      toast.success('সাবস্ক্রিপশন নবায়ন বাতিল করা হয়েছে!');

      sendEmailHelper({
        to: u.email,
        subject: 'আপনার সাবস্ক্রিপশন রি-সাবমিশন বাতিল করা হয়েছে (Subscription Renewal Rejected - Basavara)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #ef4444; margin: 0; font-size: 24px;">সাবস্ক্রিপশন নবায়ন ডিক্লাইন বা বাতিল করা হয়েছে</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 5px;">প্রদত্ত ট্রানজ্যাকশন আইডি ও তথ্য সঠিক পাওয়া যায়নি</p>
            </div>
            
            <p>প্রিয় <strong>${u.name}</strong>,</p>
            <p>আপনার সাবস্ক্রিপশন নবায়ন করার জন্য প্রদত্ত ট্রানজ্যাকশন আইডি (TrxID) মিলিয়ে আমাদের সিস্টেম অ্যাডমিন কোনো সঠিক সেন্ট পেমেন্ট খুঁজে পানি। এই কারণে আপনার নবায়ন আবেদনটি সাময়িকভাবে বাতিল করা হয়েছে।</p>
            
            <p>অনুগ্রহ করে আপনার পেমেন্ট অ্যাপ চেক করে সঠিক ট্রানজ্যাকশন আইডি বসিয়ে ড্যাশবোর্ড থেকে আবারো সাবমিট করুন।</p>
            
            <p style="margin-top: 25px; text-align: center;">
              <a href="${window.location.origin}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);">পুনরায় ড্যাশবোর্ড থেকে সাবমিট করুন</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #edf2f7; margin: 25px 0;" />
            <p style="text-align: center; font-size: 12px; color: #64748b; margin: 0;">© ${new Date().getFullYear()} Basavara (বাসাভাড়া ও টিউটর প্ল্যাটফর্ম)। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        `
      });

      return true;
    } catch (err) {
      console.error("Failed to reject renewal:", err);
      toast.error('বাতিল করতে ব্যর্থ হয়েছে।');
      return false;
    }
  };

  const registerUser = async (user: User) => {
    try {
      const newUser = { ...user, isApproved: user.role === 'admin' ? true : false };
      const isFirst = state.users.length === 0;
      if (isFirst && newUser.email === 'admin@basavara.com') {
        newUser.role = 'admin';
        newUser.isApproved = true;
      }
      
      await setDoc(doc(db, 'users', newUser.id), newUser);
      
      if (newUser.role === 'visitor') {
        toast.success('ভিজিটর রেজিস্ট্রেশন সফল হয়েছে এবং অ্যাকাউন্টটি সিস্টেম এডমিন অনুমোদনের অপেক্ষায় রয়েছে!', { duration: 6000 });
      } else {
        toast.success('রেজিস্ট্রেশন এবং পেমেন্ট সম্পন্ন হয়েছে। এডমিন ড্যাশবোর্ড থেকে অনুমোদিত হওয়ার পর আপনি লগইন করতে পারবেন।', { duration: 6000 });
      }

      // ✉️ Send welcome email to user
      sendEmailHelper({
        to: newUser.email,
        subject: 'বাসাভাড়া ও টিউটর প্ল্যাটফর্মে স্বাগতম! (Welcome to Basavara)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; text-align: center;">বাসাভাড়া ও টিউটর প্ল্যাটফর্মে আপনাকে স্বাগতম!</h2>
            <p>প্রিয় ${newUser.name},</p>
            <p>আমাদের প্ল্যাটফর্মে সফলভাবে রেজিস্ট্রেশন করার জন্য ধন্যবাদ। আপনার অ্যাকাউন্টের বিবরণ নিচে দেওয়া হলো:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">নাম:</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${newUser.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">ইমেইল:</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${newUser.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">ভূমিকা (Role):</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-transform: capitalize;">${newUser.role}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">স্ট্যাটাস (Status):</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #d97706; font-weight: bold;">
                  ${newUser.isApproved ? 'অনুমোদিত (Approved)' : 'অনুমোদনের অপেক্ষায় (Pending Admin Approval)'}
                </td>
              </tr>
            </table>
            <p>আমাদের টিম আপনার ট্রানজ্যাকশন আইডি এবং এনআইডি কপিসমূহ যাচাই করার কাজ শুরু করেছে। অ্যাকাউন্ট অনুমোদিত হওয়ার পর আপনি ইমেইল নোটিফিকেশন পাবেন ও লগইন করতে পারবেন।</p>
            <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
            <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
          </div>
        `
      });

      // ✉️ Send alert email to Admin
      sendEmailHelper({
        notifyAdmin: true,
        subject: `New Signup Alerts: ${newUser.name} (${newUser.role}) Registration`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Pending User Registration</h2>
            <p>Hello System Admin,</p>
            <p>A new user has just registered on the Basavara platform and is pending approval:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px; font-weight: bold;">User Name:</td><td style="padding: 8px;">${newUser.name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">User Email:</td><td style="padding: 8px;">${newUser.email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Account Role:</td><td style="padding: 8px;">${newUser.role}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Transaction ID:</td><td style="padding: 8px;">${newUser.transactionId || 'None Provided'}</td></tr>
            </table>
            <p>Please log into your Admin Dashboard Portal to review resources/payments and approve this account.</p>
          </div>
        `
      });

    } catch (err) {
      console.error("User registration failed:", err);
      toast.error('রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      throw err;
    }
  };

  const addProperty = async (property: Property) => {
    try {
      await setDoc(doc(db, 'properties', property.id), property);
      toast.success('Property details added.');

      // ✉️ Send notification copy to owner
      const owner = state.users.find(u => u.id === property.ownerId);
      if (owner) {
        sendEmailHelper({
          to: owner.email,
          subject: `আপনার প্রপার্টি বিজ্ঞাপনটি যুক্ত হয়েছে (Property Added: ${property.title})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5; text-align: center;">আপনার প্রপার্টি বিজ্ঞাপন সফলভাবে যুক্ত হয়েছে!</h2>
              <p>প্রিয় ${owner.name},</p>
              <p>আপনার বাসা বা ফ্ল্যাট বিজ্ঞাপনটি বাসাভাড়া প্লাটফর্মে সফলভাবে তালিকাভুক্ত করা হয়েছে:</p>
              <blockquote style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 20px; margin: 20px 0; font-style: italic;">
                <strong>${property.title}</strong><br/>
                💵 মূল্য/ভাড়া: ৳${property.price}<br/>
                📍 ঠিকানা: ${property.address}, ${property.location}
              </blockquote>
              <p>আগ্রহী গ্রাহকগণ এখন বাসাভাড়া খোঁজার তালিকায় এটি দেখতে পাবেন এবং সরাসরি আপনার সাথে যোগাযোগ করতে পারবেন।</p>
              <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
              <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
            </div>
          `
        });
      }
    } catch (err) {
      console.error("Failed to add property:", err);
      toast.error('প্রপার্টি যোগ করতে ব্যর্থ হয়েছে।');
    }
  };

  const addTutor = async (tutor: Tutor) => {
    try {
      await setDoc(doc(db, 'tutors', tutor.id), tutor);
      toast.success('Tutor profile added.');

      // ✉️ Send notification to tutor
      const tutorUser = state.users.find(u => u.id === tutor.userId);
      if (tutorUser) {
        sendEmailHelper({
          to: tutorUser.email,
          subject: 'আপনার টিউটর প্রোফাইলটি তৈরি হয়েছে (Tutor Profile Configured)',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5; text-align: center;">আপনার টিউটর প্রোফাইল সফলভাবে তৈরি হয়েছে!</h2>
              <p>প্রিয় ${tutor.name},</p>
              <p>আপনার টিউটর প্রোফাইলটি সফলভাবে তালিকাভুক্ত করা হয়েছে।</p>
              <p>অভিভাবকগণ এখন টিউটর প্যানেল থেকে আপনার বিবরণ দেখে আপনার সাথে সরাসরি যোগাযোগ করতে পারবেন। ধন্যবাদ!</p>
              <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
              <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
            </div>
          `
        });
      }
    } catch (err) {
      console.error("Failed to add tutor:", err);
      toast.error('টিউটর প্রোফাইল যোগ করতে ব্যর্থ হয়েছে।');
    }
  };

  const addInvoice = async (invoice: Invoice) => {
    try {
      await setDoc(doc(db, 'invoices', invoice.id), invoice);
    } catch (err) {
      console.error("Failed to add invoice:", err);
      toast.error('ইনভয়েস বা পেমেন্ট ট্রানজ্যাকশন যোগ করতে ব্যর্থ হয়েছে।');
    }
  };

  const updateUserNID = async (userId: string, status: 'pending' | 'verified' | 'rejected') => {
    try {
      const userRef = doc(db, 'users', userId);
      const updates: Partial<User> = { nidStatus: status };
      if (status === 'verified') {
        updates.isApproved = true;
      }
      await updateDoc(userRef, updates);
      toast.success(status === 'verified' ? 'এনআইডি যাচাই ও অ্যাকাউন্ট অনুমোদিত হয়েছে!' : 'এনআইডি স্ট্যাটাস হালনাগাদ করা হয়েছে।');

      // ✉️ Send NID and account approval notifications
      const userSnap = await getDoc(userRef).catch(() => null);
      if (userSnap && userSnap.exists()) {
        const userData = userSnap.data() as User;
        if (status === 'verified') {
          sendEmailHelper({
            to: userData.email,
            subject: 'আপনার এনআইডি যাচাই ও অ্যাকাউন্ট অনুমোদিত হয়েছে! (NID Approved)',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #10b981; text-align: center;">অভিনন্দন! আপনার অ্যাকাউন্টটি অনুমোদিত হয়েছে।</h2>
                <p>প্রিয় ${userData.name},</p>
                <p>আমরা আনন্দের সাথে জানাচ্ছি যে আপনার বাসাভাড়া ও টিউটর অ্যাকাউন্ট এবং এনআইডি ডকুমেন্ট সফলভাবে ভেরিফাই ও অনুমোদিত হয়েছে।</p>
                <p>আপনি এখন আপনার ইমেইল ও পাসওয়ার্ড দিয়ে ড্যাশবোর্ডে লগইন করে আপনার সকল কাঙ্ক্ষিত সেবা উপভোগ করতে পারবেন।</p>
                <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
                <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
              </div>
            `
          });
        } else if (status === 'rejected') {
          sendEmailHelper({
            to: userData.email,
            subject: 'আপনার এনআইডি যাচাই বাতিল করা হয়েছে (NID Rejected)',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #ef4444; text-align: center;">এনআইডি যাচাই সম্পন্ন করা সম্ভব হয়নি</h2>
                <p>প্রিয় ${userData.name},</p>
                <p>আপনার প্রেরিত এনআইডি ডকুমেন্টসমূহ আমাদের নির্দেশিকার সাথে সামঞ্জস্যপূর্ণ না হওয়ায় তা বাতিল করা হয়েছে।</p>
                <p>অনুগ্রহ করে আপনার অ্যাকাউন্ট ড্যাশবোর্ডে পুনরায় লগইন করে সঠিক ও স্পষ্ট এনআইডি কপিসমূহ পুনরায় আপলোড করুন।</p>
                <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
                <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
              </div>
            `
          });
        }
      }
    } catch (err) {
      console.error("Failed to update user NID status:", err);
      toast.error('ব্যবহারকারীর তথ্য হালনাগাদ করতে ব্যর্থ হয়েছে।');
    }
  };

  const updateProfile = async (userId: string, data: Partial<User>, showToast = true) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updates = { ...data };
      if (updates.subscriptionEnd) {
        updates.subscriptionExpiryNotified = false;
      }

      // Check if registration approval transitions from unapproved to approved
      let becameApprovedNow = false;
      if (data.isApproved === true) {
        const uSnap = await getDoc(userRef).catch(() => null);
        if (uSnap && uSnap.exists()) {
          const uData = uSnap.data() as User;
          if (!uData.isApproved) {
            becameApprovedNow = true;
          }
        }
      }

      await updateDoc(userRef, updates);
      
      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        safeLocalStorage.setItem('basavara_current_user', JSON.stringify(updatedUser));
      }
      
      if (showToast) {
        toast.success('Profile updated successfully!');
      }

      // ✉️ Send approval email notification if approved
      if (becameApprovedNow) {
        const userSnap = await getDoc(userRef).catch(() => null);
        if (userSnap && userSnap.exists()) {
          const userData = userSnap.data() as User;
          
          const fee = userData.role === 'visitor' ? 25 : 50;
          const pkgName = userData.subscriptionType || (userData.role === 'visitor' ? 'Visitor Package (৳২৫/মাস)' : userData.role === 'tutor' ? 'Tutor Package (৳৫০/মাস)' : 'Owner Package (৳৫০/মাস)');
          const trxId = userData.transactionId || 'N/A';
          
          const rawMethodVal = (userData.paymentMethod || 'bkash').toLowerCase();
          const method = (rawMethodVal === 'bkash' || rawMethodVal === 'nagad' || rawMethodVal === 'rocket' ? rawMethodVal : 'bkash') as 'bkash' | 'nagad' | 'rocket';
          
          const invoiceId = generateId();
          const invoiceDate = new Date().toISOString();

          // Save invoice to database for client downloads list
          await addInvoice({
            id: invoiceId,
            userId: userData.id,
            amount: fee,
            status: 'paid',
            date: invoiceDate,
            trxId,
            method
          });

          // Send approval email notification
          sendEmailHelper({
            to: userData.email,
            subject: 'আপনার অ্যাকাউন্ট ও সাবস্ক্রিপশন অনুমোদিত হয়েছে! (Account Approved - Basavara)',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 25px;">
                  <h2 style="color: #10b981; margin: 0; font-size: 24px;">অভিনন্দন! আপনার অ্যাকাউন্ট ও সাবস্ক্রিপশন অনুমোদিত হয়েছে।</h2>
                  <p style="color: #64748b; font-size: 14px; margin-top: 5px;">প্রিমিয়ার এবং বিজ্ঞাপন সেবাগুলো সচল করা হয়েছে</p>
                </div>
                
                <p>প্রিয় <strong>${userData.name}</strong>,</p>
                <p>আমরা অত্যন্ত আনন্দের সাথে জানাচ্ছি যে আপনার পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID: <strong>${trxId}</strong>) মিলিয়ে আমাদের সিস্টেম অ্যাডমিন আপনার বাসাভাড়া ও টিউটর একাউন্ট ও সাবস্ক্রিপশনটি সফলভাবে অনুমোদন করেছেন।</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">অ্যাক্টিভেটেড সাবস্ক্রিপশন বিবরণ:</h4>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>ব্যবহারকারীর নাম:</strong> ${userData.name}</p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>সাবস্ক্রিপশন টাইপ:</strong> ${pkgName}</p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>পেমেন্ট মাধ্যম:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #ec4899;">${method}</span></p>
                </div>
                
                <p>আপনি এখন আপনার অ্যাকাউন্ট ড্যাশবোর্ডে সম্পূর্ণ অ্যাক্সেস উপভোগ করতে পারবেন। ধন্যবাদ আমাদের সাথে থাকার জন্য!</p>
                
                <p style="margin-top: 25px; text-align: center;">
                  <a href="${window.location.origin}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">ড্যাশবোর্ডে প্রবেশ করুন</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #edf2f7; margin: 25px 0;" />
                <p style="text-align: center; font-size: 12px; color: #64748b; margin: 0;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
              </div>
            `
          });
        }
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error('প্রোফাইল আপডেট ব্যর্থ হয়েছে।');
    }
  };

  const updateSubscription = async (userId: string, type: string, endDate: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updates = { subscriptionType: type, subscriptionEnd: endDate, subscriptionExpiryNotified: false };
      await updateDoc(userRef, updates);
      
      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        safeLocalStorage.setItem('basavara_current_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to update subscription:", err);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const u = state.users.find(user => user.id === userId);
      await deleteDoc(doc(db, 'users', userId));
      toast.success('ব্যবহারকারী মুচে ফেলা হয়েছে (User deleted).');
      
      if (u && u.email) {
        sendEmailHelper({
          to: u.email,
          subject: 'আপনার অ্যাকাউন্টটি মুছে ফেলা হয়েছে (Account Deleted - Basavara)',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-radius: 8px;">
              <h2 style="color: #ef4444; text-align: center;">অ্যাকাউন্ট মুছে ফেলা হয়েছে</h2>
              <p>প্রিয় ${u.name},</p>
              <p>আপনার বাসাভাড়া ও টিউটর প্ল্যাটফর্ম (Basavara) অ্যাকাউন্টটি সিস্টেম বা অ্যাডমিন কর্তৃক মুছে ফেলা হয়েছে।</p>
              <p>যদি এটি ভুলবশত হয়ে থাকে অথবা আপনার কোনো জিজ্ঞাসা বা মতামত থাকে, অনুগ্রহ করে সরাসরি আমাদের সাপোর্ট টিমে ইমেইলে যোগাযোগ করুন।</p>
              <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
              <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
            </div>
          `
        });
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error('ব্যবহারকারী মুছতে ব্যর্থ হয়েছে।');
    }
  };

  const updateBanner = async (id: string, data: Partial<AdBanner>) => {
    try {
      await updateDoc(doc(db, 'banners', id), data);
      toast.success('বিজ্ঞাপন ব্যানার সফলভাবে আপডেট করা হয়েছে');
    } catch (err) {
      console.error("Failed to update banner:", err);
      toast.error('ব্যানার আপডেট ব্যর্থ হয়েছে।');
    }
  };

  const addBanner = async (banner: AdBanner) => {
    try {
      await setDoc(doc(db, 'banners', banner.id), banner);
      toast.success('বিজ্ঞাপন ব্যানার সফলভাবে যোগ করা হয়েছে');
    } catch (err) {
      console.error("Failed to add banner:", err);
      toast.error('ব্যানার যোগ করতে ব্যর্থ হয়েছে।');
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'banners', id));
      toast.success('বিজ্ঞাপন ব্যানার সফলভাবে মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error("Failed to delete banner:", err);
      toast.error('ব্যানার মুছতে ব্যর্থ হয়েছে।');
    }
  };

  const updateHeroVideoUrl = async (url: string) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { heroVideoUrl: url }, { merge: true });
      toast.success('হোম পেইজ ব্যাকগ্রاؤنড ভিডিও আপডেট করা হয়েছে');
    } catch (err) {
      console.error("Failed to update hero video URL:", err);
      toast.error('ভিডিও আপডেট ব্যর্থ হয়েছে।');
    }
  };

  const updateApiUrl = async (url: string) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { apiUrl: url }, { merge: true });
      toast.success('এপিআই ইউআরএল সফলভাবে আপডেট করা হয়েছে');
    } catch (err) {
      console.error("Failed to update API URL:", err);
      toast.error('এপিআই ইউআরএল আপডেট করতে ব্যর্থ হয়েছে।');
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      currentUser,
      selectedLocation,
      setSelectedLocation,
      login, 
      logout,
      registerUser: registerUser as any, 
      addProperty: addProperty as any, 
      addTutor: addTutor as any, 
      addInvoice: addInvoice as any, 
      updateUserNID: updateUserNID as any, 
      updateProfile: updateProfile as any, 
      updateSubscription: updateSubscription as any, 
      deleteUser: deleteUser as any, 
      updateBanner: updateBanner as any, 
      addBanner: addBanner as any, 
      deleteBanner: deleteBanner as any, 
      updateHeroVideoUrl: updateHeroVideoUrl as any,
      updateApiUrl: updateApiUrl as any,
      sendRenewalEmailManual: sendRenewalEmailManual as any,
      approveSubscriptionRenewal: approveSubscriptionRenewal as any,
      rejectSubscriptionRenewal: rejectSubscriptionRenewal as any
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
