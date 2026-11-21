import type { Area, Priority, ResourceKind, Status } from '../types';

export const CREATOR = {
  name: 'Naresh Yadav',
  initials: 'NY',
  role: 'B.Tech 2nd Year Student',
  github: 'https://github.com/naresh-yadav45',
};

export const AREA_META: Record<Area, { label: string; color: string; soft: string; text: string }> = {
  software: { label: 'Software', color: '#2563EB', soft: '#EFF6FF', text: '#1D4ED8' },
  hardware: { label: 'Hardware', color: '#EA580C', soft: '#FFF7ED', text: '#C2410C' },
  both: { label: 'Software + Hardware', color: '#7C3AED', soft: '#F5F3FF', text: '#6D28D9' },
  soft: { label: 'Soft Skills', color: '#059669', soft: '#ECFDF5', text: '#047857' },
  general: { label: 'Getting Started', color: '#64748B', soft: '#F1F5F9', text: '#475569' },
};

export const PRIORITY_META: Record<Priority, { label: string; color: string; soft: string; text: string; hint: string }> = {
  required: { label: 'Required', color: '#DB2777', soft: '#FDF2F8', text: '#BE185D', hint: 'Core knowledge most embedded roles expect.' },
  recommended: { label: 'Recommended', color: '#0891B2', soft: '#ECFEFF', text: '#0E7490', hint: 'Valuable for most paths; learn after the basics.' },
  optional: { label: 'Optional', color: '#64748B', soft: '#F1F5F9', text: '#475569', hint: 'Specialisation or nice-to-have topic.' },
};

export const STATUS_META: Record<Status, { label: string; color: string }> = {
  'not-started': { label: 'Not started', color: '#94A3B8' },
  'in-progress': { label: 'In progress', color: '#D97706' },
  completed: { label: 'Completed', color: '#059669' },
};

export const KIND_META: Record<ResourceKind, { label: string; group: string; action: string; badge: string }> = {
  'youtube-video': { label: 'YouTube Video', group: 'YouTube Videos', action: 'Watch on YouTube', badge: 'VIDEO' },
  'youtube-playlist': { label: 'YouTube Playlist', group: 'YouTube Playlists', action: 'Open Playlist', badge: 'PLAYLIST' },
  'youtube-channel': { label: 'YouTube Channel', group: 'YouTube Channels', action: 'Visit Channel', badge: 'CHANNEL' },
  'other-video': { label: 'Video / Training', group: 'Other Videos', action: 'Watch Now', badge: 'VIDEO' },
  coursera: { label: 'Coursera Course', group: 'Coursera Courses', action: 'Explore Course', badge: 'COURSE' },
  udemy: { label: 'Udemy Course', group: 'Udemy Courses', action: 'Explore Course', badge: 'COURSE' },
  course: { label: 'Online Course', group: 'Other Courses', action: 'Explore Course', badge: 'COURSE' },
  book: { label: 'Book', group: 'Books', action: 'View Book', badge: 'BOOK' },
  article: { label: 'Article / Website', group: 'Technical Articles', action: 'Read Article', badge: 'ARTICLE' },
  documentation: { label: 'Documentation', group: 'Documentation', action: 'Read Documentation', badge: 'DOCS' },
  datasheet: { label: 'Datasheet / PDF', group: 'Datasheets', action: 'Open Datasheet', badge: 'DATASHEET' },
  tool: { label: 'Development Tool', group: 'Development Tools', action: 'Open Tool', badge: 'TOOL' },
  repository: { label: 'Open-source Repository', group: 'Open Source Projects', action: 'View Repository', badge: 'PROJECT' },
};

export const KIND_ORDER: ResourceKind[] = [
  'youtube-video', 'youtube-playlist', 'youtube-channel', 'other-video', 'coursera', 'udemy', 'course',
  'book', 'documentation', 'datasheet', 'article', 'tool', 'repository',
];

export const AREA_ORDER: Area[] = ['software', 'both', 'hardware', 'soft', 'general'];
export const PRIORITY_ORDER: Priority[] = ['required', 'recommended', 'optional'];
