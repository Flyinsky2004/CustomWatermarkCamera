'use client';

import { toDatetimeLocalValue } from '@/lib/time';

interface Props {
  useCustomTime: boolean;
  customTime: string;
  onToggle: (v: boolean) => void;
  onTimeChange: (v: string) => void;
}

export default function TimeInput({ useCustomTime, customTime, onToggle, onTimeChange }: Props) {
  const handleToggle = () => {
    if (!useCustomTime) {
      // switching to custom: prefill with current time
      onTimeChange(toDatetimeLocalValue(new Date()));
    }
    onToggle(!useCustomTime);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        className="flex-shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs transition-colors cursor-pointer"
        style={{
          background: useCustomTime ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${useCustomTime ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: useCustomTime ? '#f97316' : '#9ca3af',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {useCustomTime ? '自定义时间' : '当前时间'}
      </button>

      {useCustomTime && (
        <input
          type="datetime-local"
          value={customTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className="flex-1 h-9 rounded-lg px-2 text-xs text-white outline-none focus:ring-1 focus:ring-orange-500 transition-all"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            colorScheme: 'dark',
          }}
        />
      )}
    </div>
  );
}
