import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirst(word: string) {
  return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
}
