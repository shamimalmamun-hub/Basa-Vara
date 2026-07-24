import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ref, uploadBytes, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const MAIN_LOCATIONS = [
  "Madhupur",
  "Mymensingh Sadar",
  "Muktagacha",
  "Bhaluka",
  "Trishal",
  "Dhaka"
];

export const PROPERTY_TYPES = ["Family Flat", "Female Mess", "Male Mess", "Bachelor Flat"];

/**
 * Compresses any File, Blob or base64 Data URL string to a lightweight JPEG Data URL before storage.
 */
export function compressImage(
  fileOrBlobOrString: File | Blob | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImageSource = (src: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };

    if (typeof fileOrBlobOrString === 'string') {
      processImageSource(fileOrBlobOrString);
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(fileOrBlobOrString);
      reader.onload = (event) => {
        processImageSource(event.target?.result as string);
      };
      reader.onerror = (err) => reject(err);
    }
  });
}

/**
 * Compresses image first, then uploads to Firebase Storage and returns the permanent HTTPS download URL.
 */
export async function uploadImageToFirebase(
  fileOrString: File | Blob | string,
  folder: string = 'uploads'
): Promise<string> {
  if (!fileOrString) return '';

  // 1. If it's already a hosted HTTP/HTTPS URL, return as is
  if (typeof fileOrString === 'string') {
    if (fileOrString.startsWith('http://') || fileOrString.startsWith('https://')) {
      return fileOrString;
    }
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}_${randomStr}.jpg`;
  const storageRef = ref(storage, `${folder}/${fileName}`);

  try {
    // MANDATORY COMPRESSION: Compress all images before uploading
    let compressedDataUrl = '';
    try {
      compressedDataUrl = await compressImage(fileOrString, 1200, 1200, 0.8);
    } catch (compressErr) {
      console.warn("Pre-upload compression warning, proceeding with raw data:", compressErr);
    }

    if (compressedDataUrl && compressedDataUrl.startsWith('data:')) {
      const snapshot = await uploadString(storageRef, compressedDataUrl, 'data_url');
      return await getDownloadURL(snapshot.ref);
    }

    // Fallbacks
    if (fileOrString instanceof File || fileOrString instanceof Blob) {
      const snapshot = await uploadBytes(storageRef, fileOrString);
      return await getDownloadURL(snapshot.ref);
    } else if (typeof fileOrString === 'string' && fileOrString.startsWith('data:')) {
      const snapshot = await uploadString(storageRef, fileOrString, 'data_url');
      return await getDownloadURL(snapshot.ref);
    }
  } catch (err) {
    console.error("Firebase Storage upload failed:", err);
    throw err;
  }

  return '';
}

/**
 * Deletes an image from Firebase Storage using its full HTTPS download URL or GS path.
 */
export async function deleteImageFromFirebase(url: string): Promise<void> {
  if (!url || typeof url !== 'string') return;

  // Only attempt deletion for Firebase Storage hosted files
  if (url.includes('firebasestorage.googleapis.com') || url.startsWith('gs://')) {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
      console.log('Successfully deleted image from Firebase Storage:', url);
    } catch (err) {
      console.warn('Could not delete image from Firebase Storage:', err);
    }
  }
}

