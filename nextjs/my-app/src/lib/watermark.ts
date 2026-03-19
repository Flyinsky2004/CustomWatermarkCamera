import type { WatermarkData } from '@/types';
import { formatDisplayTime, formatDisplayDate } from './time';

export function drawWatermark(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  data: WatermarkData,
  resolvedTime: Date
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw video frame
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dpr = canvas.width / 390; // scale relative to ~390px base width
  const barH = Math.round(130 * dpr);
  const y = canvas.height - barH;
  const pad = Math.round(16 * dpr);

  // Watermark background
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, y, canvas.width, barH);

  // Left accent bar
  ctx.fillStyle = '#f97316';
  ctx.fillRect(0, y, Math.round(4 * dpr), barH);

  // Date
  const dateStr = formatDisplayDate(resolvedTime);
  ctx.font = `bold ${Math.round(28 * dpr)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(dateStr, pad + Math.round(10 * dpr), y + Math.round(38 * dpr));

  // Time
  const timeStr = formatDisplayTime(resolvedTime);
  ctx.font = `${Math.round(20 * dpr)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#d1d5db';
  ctx.fillText(timeStr, pad + Math.round(10 * dpr), y + Math.round(65 * dpr));

  // Location
  if (data.location) {
    ctx.font = `${Math.round(16 * dpr)}px "IBM Plex Sans", sans-serif`;
    ctx.fillStyle = '#9ca3af';
    const maxW = canvas.width - pad * 2 - Math.round(10 * dpr) - Math.round(100 * dpr);
    const locText = truncateText(ctx, data.location, maxW);
    ctx.fillText(locText, pad + Math.round(10 * dpr), y + Math.round(90 * dpr));
  }

  // Note
  if (data.note) {
    ctx.font = `${Math.round(16 * dpr)}px "IBM Plex Sans", sans-serif`;
    ctx.fillStyle = '#f97316';
    const maxW = canvas.width - pad * 2 - Math.round(10 * dpr) - Math.round(100 * dpr);
    const noteText = truncateText(ctx, data.note, maxW);
    ctx.fillText(noteText, pad + Math.round(10 * dpr), y + Math.round(112 * dpr));
  }

  // App name (right side)
  ctx.font = `bold ${Math.round(14 * dpr)}px "IBM Plex Sans", sans-serif`;
  ctx.fillStyle = '#f97316';
  ctx.textAlign = 'right';
  ctx.fillText('水印相机', canvas.width - pad, y + Math.round(38 * dpr));
  ctx.textAlign = 'left';
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 0 && ctx.measureText(result + '…').width > maxWidth) {
    result = result.slice(0, -1);
  }
  return result + '…';
}
