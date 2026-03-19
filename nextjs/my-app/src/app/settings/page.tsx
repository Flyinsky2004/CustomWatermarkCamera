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
    <main className="min-h-screen" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link
          href="/"
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-white font-semibold text-base">设置</h1>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">

        {/* === Location section === */}
        <Section title="位置服务">
          {/* Amap toggle */}
          <SettingRow
            label="使用高德地图"
            description="启用后可将 GPS 坐标解析为详细地址"
          >
            <Toggle
              checked={settings.enableAmap}
              onChange={(v) => updateSettings({ enableAmap: v })}
            />
          </SettingRow>

          {/* Keys */}
          {settings.enableAmap && (
            <div className="mt-3 space-y-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">API Key</label>
                <input
                  type="text"
                  value={settings.amapKey}
                  onChange={(e) => updateSettings({ amapKey: e.target.value })}
                  placeholder="输入高德地图 API Key"
                  className="w-full h-10 rounded-xl px-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">安全密钥 (JS API)</label>
                <input
                  type="password"
                  value={settings.amapSecurityKey}
                  onChange={(e) => updateSettings({ amapSecurityKey: e.target.value })}
                  placeholder="输入安全密钥"
                  className="w-full h-10 rounded-xl px-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                前往
                <span className="text-orange-500 mx-1">高德开放平台</span>
                创建 Web 服务类型的 Key，用于逆地理编码。安全密钥用于 JS API v2.0，本应用主要使用 REST API 接口。
              </p>
            </div>
          )}
        </Section>

        {/* === Notes history section === */}
        <Section title={`备注历史 (${history.length}条)`}>
          {history.length === 0 ? (
            <p className="text-gray-600 text-sm py-2">暂无历史备注</p>
          ) : (
            <div className="space-y-1">
              {history.map((note, i) => (
                <div
                  key={i}
                  className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 truncate"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <span className="text-orange-500 text-xs mr-2 flex-shrink-0">#{i + 1}</span>
                  <span className="truncate">{note}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* === Data management === */}
        <Section title="数据管理">
          <SettingRow
            label="存储策略"
            description="数据永久保存在本地，不上传任何服务器"
          >
            <span className="text-gray-500 text-xs">本地 localStorage</span>
          </SettingRow>

          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full h-11 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
              >
                清除所有数据
              </button>
            ) : (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <p className="text-red-400 text-sm text-center">确认清除全部本地数据？此操作不可恢复。</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 h-10 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex-1 h-10 rounded-lg text-sm font-semibold text-white cursor-pointer transition-colors"
                    style={{ background: '#ef4444' }}
                  >
                    确认清除
                  </button>
                </div>
              </div>
            )}

            {cleared && (
              <p className="text-center text-green-400 text-sm mt-2">已清除所有数据</p>
            )}
          </div>
        </Section>

        {/* === About === */}
        <Section title="关于">
          <SettingRow label="版本" description="">
            <span className="text-gray-500 text-xs">1.0.0</span>
          </SettingRow>
          <SettingRow label="数据隐私" description="所有数据仅保存在您的设备上">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </SettingRow>
        </Section>

      </div>
    </main>
  );
}

/* ── Small reusable sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 px-1">{title}</p>
      <div
        className="rounded-2xl px-4 py-3 space-y-1"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {description && <p className="text-gray-500 text-xs mt-0.5 leading-snug">{description}</p>}
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
      className="relative cursor-pointer transition-colors duration-200 rounded-full flex-shrink-0"
      style={{
        width: 44,
        height: 26,
        background: checked ? '#f97316' : 'rgba(255,255,255,0.15)',
      }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white transition-transform duration-200"
        style={{
          width: 22,
          height: 22,
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}
