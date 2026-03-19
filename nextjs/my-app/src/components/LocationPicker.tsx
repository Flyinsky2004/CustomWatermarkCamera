'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Coordinates } from '@/types';
import { reverseGeocode, nearbyPlaces, type AmapPoi } from '@/lib/amap';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: string, coords: Coordinates) => void;
  amapKey: string;
  amapSecurityKey: string;
}

interface PoiItem {
  id: string;
  name: string;
  sublabel: string;
  coords: Coordinates;
}

type Phase = 'locating' | 'ready' | 'error';

export default function LocationPicker({ isOpen, onClose, onSelect, amapKey, amapSecurityKey }: Props) {
  const [phase, setPhase] = useState<Phase>('locating');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [pois, setPois] = useState<PoiItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toItem = (p: AmapPoi, coords: Coordinates): PoiItem => ({
    id: p.id,
    name: p.name,
    sublabel: [p.address, p.distance ? `${p.distance}m` : ''].filter(Boolean).join('  ·  '),
    coords,
  });

  /* ── Initial load: GPS + reverse geocode + nearby POIs ── */
  const load = useCallback(() => {
    setPhase('locating');
    setErrorMsg('');
    setPois([]);
    setCurrentAddress('');
    setSearchText('');
    setPageIndex(1);
    setHasMore(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentCoords(coords);
        try {
          const [address, result] = await Promise.all([
            reverseGeocode(coords.lat, coords.lng, amapKey, amapSecurityKey),
            nearbyPlaces(coords.lat, coords.lng, amapKey, amapSecurityKey, { pageIndex: 1 }),
          ]);
          setCurrentAddress(address);
          setPois(result.pois.map((p) => toItem(p, coords)));
          setHasMore(result.hasMore);
          setPageIndex(1);
          setPhase('ready');
        } catch (e) {
          setErrorMsg(e instanceof Error ? e.message : '获取地址失败');
          setPhase('error');
        }
      },
      (err) => {
        setErrorMsg(`定位失败: ${err.message}`);
        setPhase('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [amapKey, amapSecurityKey]);

  /* ── Load next page (append) ── */
  const loadMore = useCallback(async () => {
    if (!currentCoords || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pageIndex + 1;
      const result = await nearbyPlaces(currentCoords.lat, currentCoords.lng, amapKey, amapSecurityKey, {
        pageIndex: nextPage,
        keyword: searchText,
      });
      setPois((prev) => [...prev, ...result.pois.map((p) => toItem(p, currentCoords))]);
      setHasMore(result.hasMore);
      setPageIndex(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }, [currentCoords, loadingMore, hasMore, pageIndex, searchText, amapKey, amapSecurityKey]);

  /* ── Keyword search (reset list) ── */
  const doSearch = useCallback(async (keyword: string) => {
    if (!currentCoords) return;
    setSearching(true);
    setPois([]);
    setPageIndex(1);
    setHasMore(false);
    try {
      const result = await nearbyPlaces(currentCoords.lat, currentCoords.lng, amapKey, amapSecurityKey, {
        pageIndex: 1,
        keyword,
        radius: keyword ? 5000 : 1000,
      });
      setPois(result.pois.map((p) => toItem(p, currentCoords)));
      setHasMore(result.hasMore);
      setPageIndex(1);
    } finally {
      setSearching(false);
    }
  }, [currentCoords, amapKey, amapSecurityKey]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 500);
  };

  const clearSearch = () => {
    setSearchText('');
    clearTimeout(debounceRef.current);
    doSearch('');
  };

  /* ── IntersectionObserver for infinite scroll sentinel ── */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || phase !== 'ready') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: scrollRef.current, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [phase, loadMore]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      clearTimeout(debounceRef.current);
      setSearchText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (name: string, coords: Coordinates) => {
    onSelect(name, coords);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl flex flex-col"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '80vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-white font-semibold text-base">选择位置</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search box — only when ready */}
        {phase === 'ready' && (
          <div className="px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="relative flex items-center">
              <svg className="absolute left-3 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="搜索地点…"
                autoComplete="off"
                data-form-type="other"
                className="w-full h-9 pl-9 pr-8 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-orange-500"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              {searchText ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {/* Locating */}
          {phase === 'locating' && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              <p className="text-gray-400 text-sm">正在定位…</p>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-gray-400 text-sm">{errorMsg}</p>
              <button type="button" onClick={load} className="px-5 py-2 rounded-full text-sm font-medium text-white cursor-pointer" style={{ background: '#f97316' }}>
                重试
              </button>
            </div>
          )}

          {/* Ready */}
          {phase === 'ready' && (
            <>
              {/* Search loading spinner */}
              {searching && (
                <div className="flex items-center justify-center gap-2 py-6">
                  <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                  <span className="text-gray-400 text-sm">搜索中…</span>
                </div>
              )}

              {/* Current location pin — hide when searching by keyword */}
              {!searchText && !searching && currentAddress && currentCoords && (
                <PoiButton
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                  }
                  title="当前位置"
                  subtitle={currentAddress}
                  accent
                  onClick={() => handleSelect(currentAddress, currentCoords)}
                />
              )}

              {/* Section label */}
              {!searching && pois.length > 0 && (
                <p className="text-gray-500 text-xs px-5 pt-3 pb-1.5 tracking-widest uppercase">
                  {searchText ? `"${searchText}" 的搜索结果` : '附近地点'}
                </p>
              )}

              {/* POI list */}
              {!searching && pois.map((item) => (
                <PoiButton
                  key={item.id}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  }
                  title={item.name}
                  subtitle={item.sublabel}
                  onClick={() => handleSelect(item.name, item.coords)}
                />
              ))}

              {/* Empty state */}
              {!searching && pois.length === 0 && searchText && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="text-gray-500 text-sm">未找到相关地点</p>
                </div>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-1" />

              {/* Load more indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                  <span className="text-gray-500 text-xs">加载更多…</span>
                </div>
              )}

              {/* No more hint */}
              {!hasMore && !loadingMore && pois.length > 0 && (
                <p className="text-center text-gray-600 text-xs py-4">已加载全部结果</p>
              )}

              <div className="h-4" />
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Reusable POI row button ── */
function PoiButton({
  icon,
  title,
  subtitle,
  accent = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start gap-3 px-5 py-3.5 text-left cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = accent ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.04)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${accent ? 'text-white' : 'text-gray-100'}`}>{title}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5 truncate">{subtitle}</p>}
      </div>
      <svg className="flex-shrink-0 mt-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
