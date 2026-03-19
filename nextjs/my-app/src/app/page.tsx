'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCamera } from '@/hooks/useCamera';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNoteHistory } from '@/hooks/useNoteHistory';
import { useSettings } from '@/hooks/useSettings';
import WatermarkOverlay from '@/components/WatermarkOverlay';
import NoteInput from '@/components/NoteInput';
import TimeInput from '@/components/TimeInput';
import PhotoPreview from '@/components/PhotoPreview';
import type { WatermarkData } from '@/types';
import { drawWatermark } from '@/lib/watermark';
import { fromDatetimeLocalValue } from '@/lib/time';

export default function CameraPage() {
  const { videoRef, isReady, isStarting, error: cameraError, startCamera, stopCamera } = useCamera();
  const { location, coordinates, loading: locLoading, fetchLocation } = useGeolocation();
  const { history, commitNote, refreshHistory } = useNoteHistory();
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [note, setNote] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');

  const watermarkData: WatermarkData = {
    useCustomTime,
    customTime,
    note,
    location,
    coordinates,
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleFetchLocation = useCallback(() => {
    fetchLocation(settings.enableAmap, settings.amapKey);
  }, [fetchLocation, settings.enableAmap, settings.amapKey]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    setCapturing(true);

    const resolvedTime = useCustomTime && customTime
      ? fromDatetimeLocalValue(customTime)
      : new Date();

    drawWatermark(canvasRef.current, videoRef.current, watermarkData, resolvedTime);

    const url = canvasRef.current.toDataURL('image/jpeg', 0.92);
    setCapturedUrl(url);
    if (note.trim()) {
      commitNote(note);
      refreshHistory();
    }
    setCapturing(false);
  };

  const handleRetake = () => {
    setCapturedUrl(null);
  };

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#0d0d0d' }}>
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview overlay */}
      {capturedUrl && <PhotoPreview dataUrl={capturedUrl} onRetake={handleRetake} />}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <h1
          className="text-white font-bold text-base tracking-widest"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          水印相机
        </h1>
        <div className="flex items-center gap-3">
          {/* Location button */}
          <button
            type="button"
            onClick={handleFetchLocation}
            disabled={locLoading}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: location ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.1)' }}
            title={location || '获取位置'}
          >
            {locLoading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={location ? '#f97316' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            )}
          </button>

          {/* Settings */}
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Camera viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <p className="text-gray-400 text-sm">{cameraError}</p>
            <button
              type="button"
              onClick={startCamera}
              className="px-5 py-2 rounded-full text-sm font-medium text-white cursor-pointer"
              style={{ background: '#f97316' }}
            >
              重试
            </button>
          </div>
        ) : isStarting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">正在启动相机…</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 w-full h-full object-cover"
            />
            {isReady && <WatermarkOverlay data={watermarkData} />}
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className="relative z-10 px-4"
        style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(16px)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)',
        }}
      >
        {/* Time + Note row */}
        <div className="flex flex-col gap-2 pt-3 pb-4">
          <TimeInput
            useCustomTime={useCustomTime}
            customTime={customTime}
            onToggle={setUseCustomTime}
            onTimeChange={setCustomTime}
          />
          <NoteInput value={note} onChange={setNote} history={history} />
        </div>

        {/* Capture button */}
        <div className="flex items-center justify-center pb-2">
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isReady || capturing}
            className="relative cursor-pointer transition-transform active:scale-95 disabled:opacity-40"
            style={{ width: 72, height: 72 }}
            aria-label="拍照"
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{ border: '3px solid white' }}
            />
            <span
              className="absolute rounded-full"
              style={{ inset: 6, background: 'white' }}
            />
          </button>
        </div>
      </div>
    </main>
  );
}
