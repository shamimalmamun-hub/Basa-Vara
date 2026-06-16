import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export const PROPERTY_TYPES = ["Flat", "Mess", "Single Room", "Seat"];
