export interface AppSettings {
  enableAmap: boolean;
  amapKey: string;
  amapSecurityKey: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WatermarkData {
  useCustomTime: boolean;
  customTime: string; // datetime-local value "YYYY-MM-DDTHH:mm"
  note: string;
  location: string;
  coordinates: Coordinates | null;
}
