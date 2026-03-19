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
      setError('视频元素未就绪，请刷新重试');
      setIsStarting(false);
      return;
    }

    video.srcObject = stream;
    video.muted = true;

    const onCanPlay = () => {
      video.removeEventListener('canplay', onCanPlay);
      const p = video.play();
      if (p) p.catch(() => {});
      setIsReady(true);
      setIsStarting(false);
    };

    video.addEventListener('canplay', onCanPlay);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsReady(false);
    setIsStarting(false);
  }, []);

  return { videoRef, isReady, isStarting, error, startCamera, stopCamera };
}
