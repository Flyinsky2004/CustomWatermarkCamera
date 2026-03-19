/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    _AMapSecurityConfig: { securityJsCode: string };
    AMap: any;
  }
}

export interface AmapPoi {
  id: string;
  name: string;
  address: string;
  distance: number;
}

let sdkLoading: Promise<void> | null = null;
let loadedKey = '';

/** Dynamically load Amap JS SDK v2.0 (must set security config first) */
export function ensureAmapSDK(apiKey: string, securityKey: string): Promise<void> {
  // Already loaded with the same key
  if (window.AMap && loadedKey === apiKey) return Promise.resolve();

  // Reuse in-flight load
  if (sdkLoading) return sdkLoading;

  sdkLoading = new Promise<void>((resolve, reject) => {
    // Security config MUST be set before the script tag loads
    window._AMapSecurityConfig = { securityJsCode: securityKey };

    // Remove stale script if key changed
    const old = document.getElementById('amap-sdk');
    if (old) old.remove();

    const script = document.createElement('script');
    script.id = 'amap-sdk';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}&plugin=AMap.Geocoder,AMap.PlaceSearch`;
    script.async = true;
    script.onload = () => {
      loadedKey = apiKey;
      sdkLoading = null;
      resolve();
    };
    script.onerror = () => {
      sdkLoading = null;
      reject(new Error('高德地图 SDK 加载失败，请检查 API Key'));
    };
    document.head.appendChild(script);
  });

  return sdkLoading;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string,
  securityKey: string
): Promise<string> {
  await ensureAmapSDK(apiKey, securityKey);
  return new Promise((resolve, reject) => {
    const geocoder = new window.AMap.Geocoder({ radius: 100 });
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        resolve(result.regeocode.formattedAddress as string);
      } else {
        reject(new Error('逆地理编码失败'));
      }
    });
  });
}

export interface NearbyResult {
  pois: AmapPoi[];
  hasMore: boolean;
  total: number;
}

export async function nearbyPlaces(
  lat: number,
  lng: number,
  apiKey: string,
  securityKey: string,
  options: { radius?: number; pageIndex?: number; keyword?: string } = {}
): Promise<NearbyResult> {
  await ensureAmapSDK(apiKey, securityKey);
  const { radius = 1000, pageIndex = 1, keyword = '' } = options;
  return new Promise((resolve) => {
    const ps = new window.AMap.PlaceSearch({ radius, pageSize: 20, pageIndex, extensions: 'base' });
    ps.searchNearBy(keyword, [lng, lat], radius, (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        const list = result.poiList;
        const pois: AmapPoi[] = (list?.pois ?? []).map((p: any) => ({
          id: p.id,
          name: p.name,
          address: typeof p.address === 'string' ? p.address : '',
          distance: p.distance ?? 0,
        }));
        resolve({ pois, hasMore: pageIndex < (list?.pageCount ?? 1), total: list?.count ?? pois.length });
      } else {
        resolve({ pois: [], hasMore: false, total: 0 });
      }
    });
  });
}
