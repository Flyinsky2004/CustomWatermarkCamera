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

  return (
    <div className="absolute bottom-0 left-0 right-0 select-none" style={{ pointerEvents: 'none' }}>
      <div
        className="relative"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(2px)' }}
      >
        {/* Left orange accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />

        <div className="flex items-start justify-between px-5 py-3 pl-6">
          {/* Left: time + location + note */}
          <div className="flex-1 min-w-0 pr-4">
            <p
              className="text-white font-bold leading-tight tracking-wide"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.15rem' }}
            >
              {formatDisplayDate(resolvedTime)}
            </p>
            <p
              className="text-gray-300 leading-tight mt-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem' }}
            >
              {formatDisplayTime(resolvedTime)}
            </p>

            {data.location ? (
              <p className="text-gray-400 text-xs mt-1.5 truncate">{data.location}</p>
            ) : null}

            {data.note ? (
              <p className="text-orange-400 text-xs mt-0.5 truncate">{data.note}</p>
            ) : null}
          </div>

          {/* Right: app name */}
          <div className="flex-shrink-0 flex flex-col items-end pt-0.5">
            <span className="text-orange-500 font-bold text-xs tracking-widest">水印相机</span>
          </div>
        </div>
      </div>
    </div>
  );
}
