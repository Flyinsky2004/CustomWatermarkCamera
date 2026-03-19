'use client';

import { useEffect, useRef } from 'react';
import { toDatetimeLocalValue, fromDatetimeLocalValue, formatDisplayDate, formatDisplayTime } from '@/lib/time';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  useCustomTime: boolean;
  customTime: string;
  onToggleTime: (v: boolean) => void;
  onTimeChange: (v: string) => void;
  note: string;
  onNoteChange: (v: string) => void;
  noteHistory: string[];
}

export default function ControlDrawer({
  isOpen, onClose,
  useCustomTime, customTime, onToggleTime, onTimeChange,
  note, onNoteChange, noteHistory,
}: Props) {
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => noteRef.current?.focus(), 320);
  }, [isOpen]);

  const handleToggleTime = () => {
    if (!useCustomTime) onTimeChange(toDatetimeLocalValue(new Date()));
    onToggleTime(!useCustomTime);
  };

  const resolvedTime = useCustomTime && customTime ? fromDatetimeLocalValue(customTime) : new Date();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
          onClick={onClose}
        />
      )}

      <div
        className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl flex flex-col"
        style={{
          background: '#181818',
          border: '1px solid rgba(255,255,255,0.09)',
          minHeight: '60vh',
          maxHeight: '88vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white font-semibold text-lg">编辑水印信息</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

          {/* ── Time ── */}
          <section className="space-y-3">
            <SectionLabel icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }>时间</SectionLabel>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium" style={{ color: '#f3f4f6' }}>自定义时间</p>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    {useCustomTime && customTime
                      ? `${formatDisplayDate(resolvedTime)}  ${formatDisplayTime(resolvedTime)}`
                      : '使用拍摄时设备当前时间'}
                  </p>
                </div>
                <Toggle checked={useCustomTime} onChange={handleToggleTime} />
              </div>

              {useCustomTime && (
                <div
                  className="px-5 py-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <input
                    type="datetime-local"
                    value={customTime}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="w-full h-11 rounded-xl px-4 text-sm text-white outline-none focus:ring-1 focus:ring-orange-500"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ── Note ── */}
          <section className="space-y-3">
            <SectionLabel icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
              </svg>
            }>备注</SectionLabel>

            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <input
                ref={noteRef}
                type="text"
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="添加水印备注…"
                maxLength={100}
                autoComplete="off"
                data-form-type="other"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#f3f4f6' }}
              />
              {note && (
                <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xs" style={{ color: '#6b7280' }}>{note.length}/100</span>
                  <button
                    type="button"
                    onClick={() => onNoteChange('')}
                    className="text-xs cursor-pointer transition-colors"
                    style={{ color: '#6b7280' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#9ca3af')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
                  >
                    清空
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ── History ── */}
          {noteHistory.length > 0 && (
            <section className="space-y-3">
              <SectionLabel icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" />
                </svg>
              }>历史备注</SectionLabel>

              <div className="flex flex-wrap gap-2">
                {noteHistory.map((n, i) => {
                  const active = note === n;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { onNoteChange(n); noteRef.current?.focus(); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm cursor-pointer transition-all active:scale-95"
                      style={{
                        background: active ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${active ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.1)'}`,
                        color: active ? '#fb923c' : '#d1d5db',
                      }}
                    >
                      <span className="truncate" style={{ maxWidth: 200 }}>{n}</span>
                      {active && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#6b7280' }}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative cursor-pointer flex-shrink-0 rounded-full"
      style={{ width: 44, height: 26, background: checked ? '#f97316' : 'rgba(255,255,255,0.15)', transition: 'background 0.2s' }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white"
        style={{ width: 22, height: 22, left: checked ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
      />
    </button>
  );
}
