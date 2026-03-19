'use client';

import { useRef, useState, useCallback } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsReady(false);
    setIsStarting(true);

    let stream: MediaStream;

    // Try rear camera first, fall back to any camera
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '无法访问相机，请检查权限';
        setError(msg);
        setIsStarting(false);
        return;
      }
    }

    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) {
      // videoRef not mounted yet — retry once after a tick
      await new Promise((r) => setTimeout(r, 100));
      const v2 = videoRef.current;
      if (!v2) {
        setError('视频元素未就绪，请刷新重试');
        setIsStarting(false);
        return;
      }
      attachStream(v2, stream, setIsReady, setIsStarting);
      return;
    }

    attachStream(video, stream, setIsReady, setIsStarting);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsReady(false);
    setIsStarting(false);
  }, []);

  return { videoRef, isReady, isStarting, error, startCamera, stopCamera };
}

function attachStream(
  video: HTMLVideoElement,
  stream: MediaStream,
  setIsReady: (v: boolean) => void,
  setIsStarting: (v: boolean) => void,
) {
  video.srcObject = stream;
  video.setAttribute('playsinline', 'true');
  video.muted = true;

  // Use canplay event — more reliable than awaiting play() on mobile
  const onCanPlay = () => {
    video.removeEventListener('canplay', onCanPlay);
    // play() may return a promise; ignore rejection (autoplay policy)
    const p = video.play();
    if (p) p.catch(() => {});
    setIsReady(true);
    setIsStarting(false);
  };

  video.addEventListener('canplay', onCanPlay);

  // Fallback: if canplay never fires within 5s, try anyway
  setTimeout(() => {
    if (video.readyState >= 2) {
      onCanPlay();
    }
  }, 5000);
}
