import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { User, Property, Tutor, Invoice, AdBanner } from '../types';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc 
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

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const [selectedLocation, setSelectedLocationState] = useState<string | null>(() => {
    const saved = localStorage.getItem('basavara_selected_location');
    return saved === 'null' ? null : saved;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('basavara_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const setSelectedLocation = (loc: string | null) => {
    setSelectedLocationState(loc);
    if (loc) {
      localStorage.setItem('basavara_selected_location', loc);
    } else {
      localStorage.removeItem('basavara_selected_location');
    }
  };

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
        setState(prev => ({ ...prev, heroVideoUrl: data.heroVideoUrl || DEFAULT_VIDEO_URL }));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/global');
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
    };
  }, []);

  // Update localStorage current user if its state is modified in state.users
  useEffect(() => {
    if (currentUser) {
      const freshUser = state.users.find(u => u.id === currentUser.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
        localStorage.setItem('basavara_current_user', JSON.stringify(freshUser));
      }
    }
  }, [state.users, currentUser]);

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
      localStorage.setItem('basavara_current_user', JSON.stringify(user));
      toast.success('Successfully logged in!');
      return true;
    } else {
      toast.error('User not found. Please register.');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('basavara_current_user');
    toast.success('Logged out');
  };
  
  const sendEmailHelper = async (payload: { to?: string; subject: string; html: string; text?: string; notifyAdmin?: boolean }) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.warn('Email API returned non-200 status:', await response.text());
      } else {
        console.log(`[Email Notification] Successfully requested send for "${payload.subject}"`);
      }
    } catch (err) {
      console.error('[Email Notification] Connection error sending email:', err);
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
              <p>আপনার টিউটর প্রোফাইলটি সফলভাবে তালিকাভুক্ত করা হয়েছে:</p>
              <ul>
                <li><strong>শিক্ষা/প্রতিষ্ঠান:</strong> ${tutor.education}</li>
                <li><strong>বিষয়সমূহ:</strong> ${tutor.subjects.join(', ')}</li>
                <li><strong>প্রত্যাশিত বেতন:</strong> ৳${tutor.salaryExpected}</li>
                <li><strong>কাঙ্ক্ষিত লোকেশন:</strong> ${tutor.location}</li>
              </ul>
              <p>অভিভাবকরা এবং শিক্ষার্থীরা এখন হোম টিউটর খোঁজার পেইজ থেকে সরাসরি আপনার ঠিকানায় বা মোবাইলে যোগাযোগ করতে পারবেন।</p>
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
      toast.success('Invoice submitted successfully.');

      // ✉️ Send invoice submission confirmation to payer
      const payer = state.users.find(u => u.id === invoice.userId);
      if (payer) {
        sendEmailHelper({
          to: payer.email,
          subject: 'আপনার পেমেন্ট রিকোয়েস্ট জমা হয়েছে (Payment Invoice Submitted)',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5; text-align: center;">পেমেন্ট জমা দেওয়ার রিসিট</h2>
              <p>প্রিয় ${payer.name},</p>
              <p>আমরা সফলভাবে আপনার পেমেন্ট ভেরিফিকেশন আবেদনটি ড্যাশবোর্ড থেকে গ্রহণ করেছি:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">টাকার পরিমাণ (Amount):</td>
                  <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">৳${invoice.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">মেথড (Method):</td>
                  <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-transform: uppercase;">${invoice.method}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">ট্রানজ্যাকশন আইডি (TrxID):</td>
                  <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-family: monospace;">${invoice.trxId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">স্ট্যাটাস (Status):</td>
                  <td style="padding: 8px; border-bottom: 1px solid #edf2f7; color: #d97706; font-weight: bold;">যাচাইধীন (Pending Approval)</td>
                </tr>
              </table>
              <p>অ্যাডমিন যাচাই করার পর আপনার অ্যাকাউন্টটি সক্রিয় হয়ে যাবে। সাধারণত এটি ১০ থেকে ৩০ মিনিট সময় নিয়ে থাকে।</p>
              <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
              <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
            </div>
          `
        });
      }
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
      await updateDoc(userRef, updates);
      
      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        localStorage.setItem('basavara_current_user', JSON.stringify(updatedUser));
      }
      
      if (showToast) {
        toast.success('Profile updated successfully!');
      }

      // ✉️ Send approval email notification if approved
      if (data.isApproved === true) {
        const userSnap = await getDoc(userRef).catch(() => null);
        if (userSnap && userSnap.exists()) {
          const userData = userSnap.data() as User;
          sendEmailHelper({
            to: userData.email,
            subject: 'আপনার অ্যাকাউন্টটি অনুমোদিত হয়েছে! (Your account is approved!)',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #10b981; text-align: center;">অভিনন্দন! আপনার অ্যাকাউন্টটি অনুমোদিত হয়েছে।</h2>
                <p>প্রিয় ${userData.name},</p>
                <p>আমরা আনন্দের সাথে জানাচ্ছি যে আপনার বাসাভাড়া ও টিউটর অ্যাকাউন্টটি সফলভাবে অনুমোদিত এবং সচল হয়েছে।</p>
                <p>আপনি এখন আপনার অ্যাকাউন্ট ড্যাশবোর্ডে সম্পূর্ণ অ্যাক্সেস উপভোগ করতে পারবেন।</p>
                <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
                <p style="text-align: center; font-size: 12px; color: #718096;">© ${new Date().getFullYear()} Basavara. All rights reserved.</p>
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
        localStorage.setItem('basavara_current_user', JSON.stringify(updatedUser));
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
      updateHeroVideoUrl: updateHeroVideoUrl as any
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
