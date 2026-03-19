export async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> {
  const url = `https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${lng},${lat}&radius=100&extensions=base&output=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Amap request failed: ${res.status}`);
  const data = await res.json();
  if (data.status !== '1') throw new Error(data.info || 'Amap error');
  return data.regeocode?.formatted_address ?? '';
}
