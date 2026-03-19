import type { AppSettings } from '@/types';

const KEYS = {
  SETTINGS: 'wmc_settings',
  NOTES_HISTORY: 'wmc_notes_history',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  enableAmap: false,
  amapKey: '',
  amapSecurityKey: '',
};

const MAX_NOTES_HISTORY = 20;

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getSettings(): AppSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function getNotesHistory(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.NOTES_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addNoteToHistory(note: string): string[] {
  if (!isBrowser() || !note.trim()) return getNotesHistory();
  const trimmed = note.trim();
  const history = getNotesHistory().filter((n) => n !== trimmed);
  const updated = [trimmed, ...history].slice(0, MAX_NOTES_HISTORY);
  localStorage.setItem(KEYS.NOTES_HISTORY, JSON.stringify(updated));
  return updated;
}

export function clearAllData(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
