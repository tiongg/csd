export const PREFERENCE_OPTIONS = [
  'AI and Digital Life',
  'Gaming Culture',
  'Anime and Fandoms',
  'Music Trends',
  'Fashion and Aesthetics',
  'Sports Trends',
  'Memes and Online Culture',
  'Creator Culture',
  'Current Affairs',
] as const;

export const MAX_PREFERENCE_SELECTION = 3;

export type PreferenceOption = (typeof PREFERENCE_OPTIONS)[number];

export const PREFERENCE_EMOJI: Record<PreferenceOption, string> = {
  'AI and Digital Life': '🤖',
  'Gaming Culture': '🎮',
  'Anime and Fandoms': '🎌',
  'Music Trends': '🎵',
  'Fashion and Aesthetics': '👟',
  'Sports Trends': '🏅',
  'Memes and Online Culture': '😂',
  'Creator Culture': '🎬',
  'Current Affairs': '🗞️',
};
