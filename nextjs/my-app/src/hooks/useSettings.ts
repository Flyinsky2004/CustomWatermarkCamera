'use client';

import { useState, useEffect } from 'react';
import type { AppSettings } from '@/types';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    setLoaded(true);
  }, []);

  const updateSettings = (updates: Partial<AppSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    saveSettings(next);
  };

  return { settings, updateSettings, loaded };
}
