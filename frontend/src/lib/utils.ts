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
  // Generate brighter colors by ensuring each channel has a minimum value
  // and at least one channel is at maximum brightness
  const r = Math.min(255, 100 + ((hash >> 24) & 0x7f));
  const g = Math.min(255, 100 + ((hash >> 16) & 0x7f));
  const b = Math.min(255, 100 + ((hash >> 8) & 0x7f));

  // Boost the brightest channel to make colors more vibrant
  const max = Math.max(r, g, b);
  let brightR = r;
  let brightG = g;
  let brightB = b;

  if (max === r) brightR = 255;
  else if (max === g) brightG = 255;
  else brightB = 255;

  const color =
    '#' +
    brightR.toString(16).padStart(2, '0') +
    brightG.toString(16).padStart(2, '0') +
    brightB.toString(16).padStart(2, '0');
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
    .replaceAll('â€“', '-')
    .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“', '-')
    .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢', "'")
    .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“', '"')
    .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬\u009d', '"')
    .replaceAll('ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ', '-');
}

export type Team = components['schemas']['Team'];
export type Course = components['schemas']['Course'];
export type ContentVersion = components['schemas']['ContentVersionResponse'];
export type EnrolledCourse = components['schemas']['LessonSessionFullResponse'];
export type Notification = components['schemas']['Notification'];
export type LearnerCourseMetadata = {
  currentIndex?: number;
};
