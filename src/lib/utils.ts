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
  "Mymensingh Sadar"
];

export const PROPERTY_TYPES = ["Family Flat", "Female Mess", "Male Mess", "Bachelor Flat"];

export const IMAGE_ACCEPT_TYPES = "image/*, .jfif, .pjpeg, .pjp, .jpg, .jpeg, .png, .gif, .webp, .avif, .heic, .heif, .bmp, .svg";

export function isImageFile(file: File): boolean {
  if (!file) return false;
  if (file.type && (file.type.startsWith('image/') || file.type.includes('jfif') || file.type.includes('pjpeg'))) {
    return true;
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext) return true;
  const imageExtensions = [
    'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'gif', 'webp',
    'bmp', 'svg', 'avif', 'heic', 'heif', 'tiff', 'tif', 'ico'
  ];
  return imageExtensions.includes(ext);
}

/**
 * Compresses any File, Blob or base64 Data URL string to a lightweight JPEG Data URL before storage.
 * Optimized for speed and low file size (~70KB - 120KB).
 */
export function compressImage(
  fileOrBlobOrString: File | Blob | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 4-second safety guard against hanging file reading/canvas rendering
    const compressionTimer = setTimeout(() => {
      reject(new Error("Image compression timed out"));
    }, 4000);

    const cleanup = () => clearTimeout(compressionTimer);

    const processImageSource = (src: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width || 800;
          let height = img.height || 600;

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
          cleanup();
          resolve(compressedBase64);
        } catch (err) {
          cleanup();
          reject(err);
        }
      };
      img.onerror = (err) => {
        cleanup();
        reject(err);
      };
      img.src = src;
    };

    if (typeof fileOrBlobOrString === 'string') {
      if (fileOrBlobOrString.startsWith('data:') || fileOrBlobOrString.startsWith('blob:')) {
        processImageSource(fileOrBlobOrString);
      } else {
        cleanup();
        resolve(fileOrBlobOrString);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          processImageSource(result);
        } else {
          cleanup();
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = (err) => {
        cleanup();
        reject(err);
      };
      reader.readAsDataURL(fileOrBlobOrString);
    }
  });
}

/**
 * Compresses image first, then uploads to Firebase Storage with a strict 2-second timeout fallback.
 * If Firebase Storage is slow or network hangs, instantly returns the compressed base64 image.
 */
export async function uploadImageToFirebase(
  fileOrString: File | Blob | string,
  folder: string = 'uploads'
): Promise<string> {
  if (!fileOrString) return '';

  // 1. If it's already an HTTP/HTTPS URL, return immediately
  if (typeof fileOrString === 'string') {
    if (fileOrString.startsWith('http://') || fileOrString.startsWith('https://')) {
      return fileOrString;
    }
  }

  // 2. Fast client-side image compression
  let compressedDataUrl = '';
  try {
    compressedDataUrl = await compressImage(fileOrString, 1000, 1000, 0.72);
  } catch (compressErr) {
    console.warn("Fast compression failed, using fallback:", compressErr);
    if (typeof fileOrString === 'string' && fileOrString.startsWith('data:')) {
      compressedDataUrl = fileOrString;
    }
  }

  if (!compressedDataUrl) {
    return '';
  }

  // 3. Attempt Firebase Storage upload with a strict 2-second timeout
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileName = `${timestamp}_${randomStr}.jpg`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    const storageUploadTask = async (): Promise<string> => {
      const snapshot = await uploadString(storageRef, compressedDataUrl, 'data_url');
      return await getDownloadURL(snapshot.ref);
    };

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Firebase Storage timeout')), 2000);
    });

    const firebaseUrl = await Promise.race([storageUploadTask(), timeoutPromise]);
    if (firebaseUrl) {
      return firebaseUrl;
    }
  } catch (err) {
    console.warn("Firebase Storage upload skipped or timed out, using fast compressed image:", err);
  }

  // Immediate return: lightweight compressed base64 JPEG (~70KB - 120KB)
  return compressedDataUrl;
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

