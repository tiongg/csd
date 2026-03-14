import type { components } from '@/generated/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirst(word: string) {
  return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
}

export function generateColorFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color =
    '#' +
    ((hash >> 24) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 16) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 8) & 0xff).toString(16).padStart(2, '0');
  return color;
}

export function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export function cleanText(text: string) {
  return text
    .replaceAll('â€‘', '-')
    .replaceAll('â€™', "'")
    .replaceAll('â€œ', '"')
    .replaceAll('â€\u009d', '"')
    .replaceAll('â€“', '-');
}

export type Team = components['schemas']['Team'];
export type Course = components['schemas']['Course'];
export type ContentVersion = components['schemas']['ContentVersionResponse'];
export type EnrolledCourse = components['schemas']['LessonSessionFullResponse'];
export type LearnerCourseMetadata = {
  currentIndex?: number;
};
