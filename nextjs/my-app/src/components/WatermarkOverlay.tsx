'use client';

import { useEffect, useState } from 'react';
import type { WatermarkData } from '@/types';
import { formatDisplayDate, formatDisplayTime, fromDatetimeLocalValue } from '@/lib/time';

interface Props {
  data: WatermarkData;
}

export default function WatermarkOverlay({ data }: Props) {
  const [tick, setTick] = useState(0);

  // Live clock tick when not using custom time
  useEffect(() => {
    if (data.useCustomTime) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [data.useCustomTime]);

  const resolvedTime = data.useCustomTime && data.customTime
    ? fromDatetimeLocalValue(data.customTime)
    : new Date();

  // suppress unused warning
  void tick;

  const shadow = '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)';

  return (
    <div className="absolute bottom-0 left-0 right-0 select-none px-6 pb-7" style={{ pointerEvents: 'none' }}>
      <div className="flex items-end justify-between">
        {/* Left: time + location + note */}
        <div className="flex-1 min-w-0 pr-4">
          <p
            className="text-white font-bold leading-tight tracking-wide"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.15rem', textShadow: shadow }}
          >
            {formatDisplayDate(resolvedTime)}
          </p>
          <p
            className="leading-tight mt-0.5"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', color: '#e5e7eb', textShadow: shadow }}
          >
            {formatDisplayTime(resolvedTime)}
          </p>

          {data.location && (
            <p className="text-xs mt-1.5 truncate" style={{ color: '#d1d5db', textShadow: shadow }}>{data.location}</p>
          )}

          {data.note && (
            <p className="text-xs mt-0.5 truncate" style={{ color: '#fb923c', textShadow: shadow }}>{data.note}</p>
          )}
        </div>

        {/* Right: app name */}
        <span
          className="flex-shrink-0 font-bold text-xs tracking-widest"
          style={{ color: '#fb923c', textShadow: shadow }}
        >
          水印相机
        </span>
      </div>
    </div>
  );
}
