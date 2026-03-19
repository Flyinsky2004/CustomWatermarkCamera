'use client';

import { useState, useCallback } from 'react';
import type { Coordinates } from '@/types';
import { reverseGeocode } from '@/lib/amap';

interface GeolocationState {
  coordinates: Coordinates | null;
  location: string;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    location: '',
    loading: false,
    error: null,
  });

  const fetchLocation = useCallback(async (enableAmap: boolean, amapKey: string) => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: '设备不支持定位' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        let locationText = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;

        if (enableAmap && amapKey) {
          try {
            const address = await reverseGeocode(coords.lat, coords.lng, amapKey);
            if (address) locationText = address;
          } catch {
            // fallback to coordinates
          }
        }

        setState({ coordinates: coords, location: locationText, loading: false, error: null });
      },
      (err) => {
        setState((s) => ({ ...s, loading: false, error: `定位失败: ${err.message}` }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return { ...state, fetchLocation };
}
