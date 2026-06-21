export type Role = 'admin' | 'user' | 'tutor' | 'visitor';
export type PropertyType = 'Family Flat' | 'Female Mess' | 'Male Mess' | 'Bachelor Flat';
export type NIDStatus = 'pending' | 'verified' | 'rejected' | 'unsubmitted';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  transactionId?: string;
  role: Role;
  nidStatus: NIDStatus;
  nidFrontBase64?: string;
  nidBackBase64?: string;
  avatar?: string;
  dob?: string;
  subscriptionEnd?: string;
  subscriptionType?: string;
  subscriptionExpiryNotified?: boolean;
  isApproved?: boolean;
  paymentMethod?: string;
  pendingRenewStatus?: 'pending' | 'approved' | 'rejected' | null;
  pendingRenewTrxId?: string;
  pendingRenewMethod?: string;
  pendingRenewPackage?: string;
  pendingRenewAmount?: number;
  pendingRenewSubmittedAt?: string;
  phoneNumber?: string;     // Added phone number for tutor or property owners
  whatsappNumber?: string;  // Added whatsapp number for tutors
  daysPerWeek?: string;     // Added days per week for tutors
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  location: string;
  address: string;
  type: PropertyType | PropertyType[];
  price: number;
  images: string[];
  isAvailable: boolean;
  createdAt: string;
  contactNumber?: string;
  ownerPhoneNumber?: string; // Specifically owner's phone number
}

export type Gender = 'male' | 'female';

export interface Tutor {
  id: string;
  userId: string;
  name: string;
  subjects: string[];
  education: string;
  availableDays: string[];
  availableTime: string;
  location: string;
  salaryExpected: number;
  image: string;
  isVerified: boolean;
  contactNumber?: string;
  phoneNumber?: string;     // Added phone number
  whatsappNumber?: string;  // Added WhatsApp number
  daysPerWeek?: string;     // Added days per week "১ দিন" to "৭ দিন"
  gender?: Gender;          // Added gender
  experience?: string;      // Added experience
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  status: 'paid' | 'pending';
  date: string;
  trxId: string;
  method: 'bkash' | 'nagad' | 'rocket';
}

export interface AdBanner {
  id: string;
  badgeBn: string;
  badgeEn: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  buttonTextBn: string;
  buttonTextEn: string;
  link: string;
  image?: string; // base64 or URL
  gradientFrom: string;
  gradientTo: string;
  iconEmoji?: string;
  secondaryEmoji?: string;
}

export interface Visitor {
  id: string;
  userId?: string | null;
  name?: string | null;
  role?: string | null;
  currentPage: string;
  lastActive: string; // ISO string
  deviceInfo: string;
  createdAt: string; // ISO string
  status?: 'online' | 'offline';
}


