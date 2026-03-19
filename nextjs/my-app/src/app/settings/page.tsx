'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSettings } from '@/hooks/useSettings';
import { useNoteHistory } from '@/hooks/useNoteHistory';
import { clearAllData } from '@/lib/storage';

export default function SettingsPage() {
  const { settings, updateSettings, loaded } = useSettings();
  const { history, refreshHistory } = useNoteHistory();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearAll = () => {
    clearAllData();
    refreshHistory();
    setShowClearConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  if (!loaded) {
    return (
      <main className="fixed inset-0 flex items-center justify-center" style={{ background: '#0d0d0d' }}>
        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-y-auto" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4"
        style={{ background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Link
          href="/"
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.09)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-white font-semibold text-lg">设置</h1>
      </div>

      <div className="px-5 py-8 space-y-8 max-w-lg mx-auto pb-16">

        {/* === Location section === */}
        <Section title="位置服务">
          <SettingRow
            label="使用高德地图"
            description="启用后可将 GPS 坐标解析为中文地址"
          >
            <Toggle
              checked={settings.enableAmap}
              onChange={(v) => updateSettings({ enableAmap: v })}
            />
          </SettingRow>

          {settings.enableAmap && (
            <div className="mt-1 pt-4 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: '#9ca3af' }}>API Key</label>
                <input
                  type="text"
                  value={settings.amapKey}
                  onChange={(e) => updateSettings({ amapKey: e.target.value })}
                  placeholder="输入高德地图 API Key"
                  autoComplete="off"
                  data-form-type="other"
                  className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: '#9ca3af' }}>安全密钥（JS API）</label>
                <input
                  type="password"
                  value={settings.amapSecurityKey}
                  onChange={(e) => updateSettings({ amapSecurityKey: e.target.value })}
                  placeholder="输入安全密钥"
                  autoComplete="new-password"
                  data-form-type="other"
                  className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                在高德开放平台创建&nbsp;
                <span style={{ color: '#f97316' }}>Web 端（JS API）</span>
                &nbsp;类型的应用，将 API Key 与安全密钥填入即可。
              </p>
            </div>
          )}
        </Section>

        {/* === Notes history === */}
        <Section title={`备注历史（${history.length} 条）`}>
          {history.length === 0 ? (
            <p className="text-sm py-1" style={{ color: '#6b7280' }}>暂无历史备注</p>
          ) : (
            <div className="space-y-2">
              {history.map((note, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: '#f97316' }}>#{i + 1}</span>
                  <span className="text-sm truncate" style={{ color: '#e5e7eb' }}>{note}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* === Data management === */}
        <Section title="数据管理">
          <SettingRow
            label="存储策略"
            description="所有数据仅保存在本设备，不上传任何服务器"
          >
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)', color: '#9ca3af' }}>
              本地
            </span>
          </SettingRow>

          <div className="mt-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full h-12 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              >
                清除所有数据
              </button>
            ) : (
              <div
                className="rounded-xl p-5 space-y-4"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <p className="text-sm text-center" style={{ color: '#fca5a5' }}>
                  确认清除全部本地数据？此操作不可恢复。
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 h-11 rounded-xl text-sm cursor-pointer transition-colors"
                    style={{ background: 'rgba(255,255,255,0.09)', color: '#d1d5db' }}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex-1 h-11 rounded-xl text-sm font-semibold text-white cursor-pointer transition-colors"
                    style={{ background: '#ef4444' }}
                  >
                    确认清除
                  </button>
                </div>
              </div>
            )}
            {cleared && (
              <p className="text-center text-sm mt-3" style={{ color: '#4ade80' }}>已清除所有数据</p>
            )}
          </div>
        </Section>

        {/* === About === */}
        <Section title="关于">
          <SettingRow label="版本" description="">
            <span className="text-sm" style={{ color: '#6b7280' }}>1.0.0</span>
          </SettingRow>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <SettingRow label="数据隐私" description="所有数据仅保存在您的设备上">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </SettingRow>
          </div>
        </Section>

      </div>
    </main>
  );
}

/* ── Sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
        style={{ color: '#6b7280' }}
      >
        {title}
      </p>
      <div
        className="rounded-2xl px-5 py-4 space-y-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-5 py-1">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: '#f3f4f6' }}>{label}</p>
        {description && (
          <p className="text-sm mt-0.5 leading-snug" style={{ color: '#6b7280' }}>{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
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
