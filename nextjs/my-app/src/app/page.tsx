'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCamera } from '@/hooks/useCamera';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNoteHistory } from '@/hooks/useNoteHistory';
import { useSettings } from '@/hooks/useSettings';
import WatermarkOverlay from '@/components/WatermarkOverlay';
import PhotoPreview from '@/components/PhotoPreview';
import LocationPicker from '@/components/LocationPicker';
import ControlDrawer from '@/components/ControlDrawer';
import type { WatermarkData, Coordinates } from '@/types';
import { drawWatermark } from '@/lib/watermark';
import { fromDatetimeLocalValue, formatDisplayDate, formatDisplayTime } from '@/lib/time';

export default function CameraPage() {
  const { videoRef, isReady, isStarting, error: cameraError, startCamera, stopCamera } = useCamera();
  const { location: gpsLocation, coordinates: gpsCoords, loading: locLoading, fetchLocation } = useGeolocation();
  const { history, commitNote, refreshHistory } = useNoteHistory();
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [note, setNote] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [manualLocation, setManualLocation] = useState('');
  const [manualCoords, setManualCoords] = useState<Coordinates | null>(null);

  const location = manualLocation || gpsLocation;
  const coordinates = manualCoords || gpsCoords;
  const watermarkData: WatermarkData = { useCustomTime, customTime, note, location, coordinates };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleLocationBtn = useCallback(() => {
    if (settings.enableAmap && settings.amapKey) {
      setPickerOpen(true);
    } else {
      setManualLocation('');
      setManualCoords(null);
      fetchLocation(false, '');
    }
  }, [settings.enableAmap, settings.amapKey, fetchLocation]);

  const handlePickerSelect = (address: string, coords: Coordinates) => {
    setManualLocation(address);
    setManualCoords(coords);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    setCapturing(true);
    const resolvedTime = useCustomTime && customTime ? fromDatetimeLocalValue(customTime) : new Date();
    drawWatermark(canvasRef.current, videoRef.current, watermarkData, resolvedTime);
    const url = canvasRef.current.toDataURL('image/jpeg', 0.92);
    setCapturedUrl(url);
    if (note.trim()) { commitNote(note); refreshHistory(); }
    setCapturing(false);
  };

  const hasLocation = Boolean(location);
  const isLocating = locLoading && !settings.enableAmap;

  // Derive display strings for trigger bar
  const resolvedTime = useCustomTime && customTime ? fromDatetimeLocalValue(customTime) : new Date();
  const timeLabel = useCustomTime && customTime
    ? `${formatDisplayDate(resolvedTime)} ${formatDisplayTime(resolvedTime)}`
    : '当前时间';

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#0d0d0d' }}>
      <canvas ref={canvasRef} className="hidden" />

      {capturedUrl && <PhotoPreview dataUrl={capturedUrl} onRetake={() => setCapturedUrl(null)} />}

      <LocationPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        amapKey={settings.amapKey}
        amapSecurityKey={settings.amapSecurityKey}
      />

      <ControlDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        useCustomTime={useCustomTime}
        customTime={customTime}
        onToggleTime={setUseCustomTime}
        onTimeChange={setCustomTime}
        note={note}
        onNoteChange={setNote}
        noteHistory={history}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <h1 className="text-white font-bold text-base tracking-widest" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          水印相机
        </h1>
        <div className="flex items-center gap-3">
          {/* Location button */}
          <button
            type="button"
            onClick={handleLocationBtn}
            disabled={isLocating}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: hasLocation ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.1)' }}
            title={location || '获取位置'}
          >
            {isLocating ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={hasLocation ? '#f97316' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <video
          ref={videoRef}
          playsInline muted autoPlay
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isReady ? 'block' : 'none' }}
        />
        {isReady && <WatermarkOverlay data={watermarkData} />}

        {isStarting && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">正在启动相机…</p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <p className="text-gray-400 text-sm">{cameraError}</p>
            <button type="button" onClick={startCamera} className="px-5 py-2 rounded-full text-sm font-medium text-white cursor-pointer" style={{ background: '#f97316' }}>
              重试
            </button>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className="relative z-10 px-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        {/* Trigger bar — opens drawer */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 mt-3 mb-4 rounded-2xl cursor-pointer transition-opacity active:opacity-70"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          {/* Time chip */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={useCustomTime ? '#f97316' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs" style={{ color: useCustomTime ? '#f97316' : '#6b7280' }}>{timeLabel}</span>
          </div>

          <div className="w-px h-3.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />

          {/* Note preview */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={note ? '#f97316' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
            </svg>
            <span className="text-xs truncate" style={{ color: note ? '#e5e7eb' : '#6b7280' }}>
              {note || '添加备注…'}
            </span>
          </div>

          {/* Arrow */}
          <svg className="flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

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
            <span className="absolute inset-0 rounded-full" style={{ border: '3px solid white' }} />
            <span className="absolute rounded-full" style={{ inset: 6, background: 'white' }} />
          </button>
        </div>
      </div>
    </main>
  );
}
