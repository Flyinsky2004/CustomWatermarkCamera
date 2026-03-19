'use client';

interface Props {
  dataUrl: string;
  onRetake: () => void;
}

export default function PhotoPreview({ dataUrl, onRetake }: Props) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `watermark_${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0d0d0d' }}>
      {/* Photo */}
      <div className="flex-1 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt="拍摄的照片"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Bottom actions */}
      <div
        className="flex items-center justify-between px-8 py-6 gap-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <button
          type="button"
          onClick={onRetake}
          className="flex-1 h-12 rounded-2xl text-white font-medium text-sm transition-colors cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          重拍
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 h-12 rounded-2xl text-white font-bold text-sm transition-opacity active:opacity-80 cursor-pointer flex items-center justify-center gap-2"
          style={{ background: '#f97316' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          保存
        </button>
      </div>
    </div>
  );
}
