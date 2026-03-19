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

  const dpr = canvas.width / 390;
  const pad = Math.round(28 * dpr);
  const textX = pad + Math.round(16 * dpr);
  const bot = canvas.height - Math.round(36 * dpr);

  // Helper: draw text with drop shadow for legibility on any background
  const drawText = (text: string, x: number, y: number) => {
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = Math.round(8 * dpr);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(1 * dpr);
    ctx.fillText(text, x, y);
    // Second pass — sharper inner shadow
    ctx.shadowBlur = Math.round(3 * dpr);
    ctx.fillText(text, x, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  const maxW = canvas.width - textX - Math.round(120 * dpr);

  // Note (bottom line)
  let curY = bot;
  if (data.note) {
    ctx.font = `${Math.round(16 * dpr)}px "IBM Plex Sans", sans-serif`;
    ctx.fillStyle = '#fb923c';
    drawText(truncateText(ctx, data.note, maxW), textX, curY);
    curY -= Math.round(24 * dpr);
  }

  // Location
  if (data.location) {
    ctx.font = `${Math.round(16 * dpr)}px "IBM Plex Sans", sans-serif`;
    ctx.fillStyle = '#e5e7eb';
    drawText(truncateText(ctx, data.location, maxW), textX, curY);
    curY -= Math.round(28 * dpr);
  }

  // Time
  const timeStr = formatDisplayTime(resolvedTime);
  ctx.font = `${Math.round(20 * dpr)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#e5e7eb';
  drawText(timeStr, textX, curY);
  curY -= Math.round(34 * dpr);

  // Date
  const dateStr = formatDisplayDate(resolvedTime);
  ctx.font = `bold ${Math.round(28 * dpr)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#ffffff';
  drawText(dateStr, textX, curY);

  // App name (bottom right)
  ctx.font = `bold ${Math.round(14 * dpr)}px "IBM Plex Sans", sans-serif`;
  ctx.fillStyle = '#fb923c';
  ctx.textAlign = 'right';
  drawText('水印相机', canvas.width - pad, bot);
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
