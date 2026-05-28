/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  username: string;
  displayName: string;
  avatar: string; // Base64 image
}

export type ThemeType = 'dim' | 'dark' | 'light';
export type MobileNavStyle = 'drawer' | 'bottom';

export interface AppSettings {
  theme: ThemeType;
  fontSize: number; // 12 to 22
  fontFamily: string; // sans, serif, mono, system
  mobileNavStyle: MobileNavStyle;
  dailyPostLimit: number;
  dailyRepostLimit: number;
  dailyReplyLimit: number;
  dailyLikeLimit: number;
  brandColor?: string; // Hex color selector
  language?: 'fr' | 'en'; // Selected language
}

export interface PostDraft {
  id: string;
  text: string;
  scheduledTime?: string; // ISO String
  tags: string[];
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string; // ISO String
}

export interface DailyCount {
  date: string; // YYYY-MM-DD
  posts: number;
  reposts: number;
  replies: number;
  likes: number;
}

export interface HistoryItem {
  id: string;
  type: 'post' | 'repost' | 'reply' | 'like';
  text?: string;
  timestamp: string; // ISO String
}

export interface SavedTag {
  id: string;
  tag: string;
}

export const SYSTEM_FONTS = [
  { name: 'Inter (System)', value: 'Inter, "Segoe UI", system-ui, sans-serif' },
  { name: 'Segoe UI', value: '"Segoe UI", -apple-system, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Ubuntu', value: 'Ubuntu, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'Raleway', value: 'Raleway, sans-serif' },
  { name: 'Nunito', value: 'Nunito, sans-serif' },
  { name: 'Quicksand', value: 'Quicksand, sans-serif' },
  { name: 'Source Sans Pro', value: '"Source Sans Pro", sans-serif' }
];

export const OPTIMAL_TIMES = [
  { label: 'Matin (Engagement)', time: '08:00' },
  { label: 'Midi (Pause)', time: '12:30' },
  { label: 'Fin de journée', time: '18:00' },
  { label: 'Soirée (Pic d’audience)', time: '21:00' },
];
