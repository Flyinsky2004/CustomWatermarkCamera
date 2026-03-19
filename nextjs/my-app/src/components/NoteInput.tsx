'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  history: string[];
}

export default function NoteInput({ value, onChange, history }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const select = (note: string) => {
    onChange(note);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* History dropdown */}
      {open && history.length > 0 && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden z-50"
          style={{ background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-gray-500 text-xs px-3 pt-2 pb-1">历史备注</p>
          <div className="max-h-48 overflow-y-auto">
            {history.map((note, i) => (
              <button
                key={i}
                type="button"
                onClick={() => select(note)}
                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors cursor-pointer truncate"
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* History toggle */}
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: open ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.08)' }}
            aria-label="历史备注"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={open ? '#f97316' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </button>
        )}

        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="添加备注…"
            maxLength={100}
            className="w-full h-9 rounded-lg px-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>
    </div>
  );
}
