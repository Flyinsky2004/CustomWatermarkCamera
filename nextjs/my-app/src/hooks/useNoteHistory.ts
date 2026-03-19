'use client';

import { useState, useEffect } from 'react';
import { getNotesHistory, addNoteToHistory } from '@/lib/storage';

export function useNoteHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getNotesHistory());
  }, []);

  const commitNote = (note: string) => {
    if (!note.trim()) return;
    const updated = addNoteToHistory(note);
    setHistory(updated);
  };

  const refreshHistory = () => {
    setHistory(getNotesHistory());
  };

  return { history, commitNote, refreshHistory };
}
