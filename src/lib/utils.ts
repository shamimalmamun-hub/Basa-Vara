import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ref, uploadBytes, uploadString, getDownloadURL } from "firebase/storage";
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

export function compressImage(file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
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
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert with adjustable quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads an image (File, Blob or Data URL string) to Firebase Storage and returns the permanent HTTPS download URL.
 */
export async function uploadImageToFirebase(
  fileOrString: File | Blob | string,
  folder: string = 'uploads'
): Promise<string> {
  if (!fileOrString) return '';

  // 1. If it's already an HTTP/HTTPS URL, return directly
  if (typeof fileOrString === 'string') {
    if (fileOrString.startsWith('http://') || fileOrString.startsWith('https://')) {
      return fileOrString;
    }
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}_${randomStr}.jpg`;

  try {
    // 2. Data URL (Base64)
    if (typeof fileOrString === 'string' && fileOrString.startsWith('data:')) {
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const snapshot = await uploadString(storageRef, fileOrString, 'data_url');
      return await getDownloadURL(snapshot.ref);
    }

    // 3. File or Blob
    if (fileOrString instanceof File || fileOrString instanceof Blob) {
      let dataUrlToUpload = '';
      if (fileOrString instanceof File) {
        try {
          dataUrlToUpload = await compressImage(fileOrString, 1200, 1200, 0.82);
        } catch (e) {
          console.warn("Pre-compression failed, uploading raw file:", e);
        }
      }

      const storageRef = ref(storage, `${folder}/${fileName}`);

      if (dataUrlToUpload && dataUrlToUpload.startsWith('data:')) {
        const snapshot = await uploadString(storageRef, dataUrlToUpload, 'data_url');
        return await getDownloadURL(snapshot.ref);
      } else {
        const snapshot = await uploadBytes(storageRef, fileOrString);
        return await getDownloadURL(snapshot.ref);
      }
    }
  } catch (err) {
    console.error("Firebase Storage upload failed:", err);
    throw err;
  }

  return '';
}

