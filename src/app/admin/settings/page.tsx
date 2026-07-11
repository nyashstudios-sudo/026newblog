'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState({
    authorShare: 70,
    platformShare: 30,
    withdrawalThreshold: 50,
    autoFlag: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || {};
        const rev = s.revenue_share_pct as { author?: number; platform?: number } | undefined;
        const thresh = s.withdrawal_threshold_usd as { amount?: number } | undefined;
        const mod = s.moderation as { autoFlag?: boolean } | undefined;
        setSettings({
          authorShare: rev?.author ?? 70,
          platformShare: rev?.platform ?? 30,
          withdrawalThreshold: thresh?.amount ?? 50,
          autoFlag: mod?.autoFlag ?? true,
        });
      })
      .catch(() => {});
  }, [user]);

  const save = async () => {
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        revenue_share_pct: { author: settings.authorShare, platform: settings.platformShare },
        withdrawal_threshold_usd: { amount: settings.withdrawalThreshold },
        moderation: { autoFlag: settings.autoFlag, requireReview: false },
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return null;

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Platform Settings</h1>
          <p className="dash-subtitle">Configure platform parameters</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="dash-card">
          <h2 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Revenue split</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Author %</label>
              <input type="number" value={settings.authorShare}
                onChange={(e) => setSettings((s) => ({ ...s, authorShare: +e.target.value, platformShare: 100 - +e.target.value }))}
                style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Platform %</label>
              <input type="number" value={settings.platformShare} readOnly
                style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)', opacity: 0.6 }} />
            </div>
          </div>
        </div>

        <div className="dash-card">
          <h2 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Withdrawals</h2>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Minimum threshold (USD)</label>
          <input type="number" value={settings.withdrawalThreshold}
            onChange={(e) => setSettings((s) => ({ ...s, withdrawalThreshold: +e.target.value }))}
            style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)' }} />
        </div>

        <div className="dash-card">
          <h2 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Moderation</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.autoFlag} onChange={(e) => setSettings((s) => ({ ...s, autoFlag: e.target.checked }))} />
            Auto-flag suspicious content
          </label>
        </div>

        <Button onClick={save} className="w-full">{saved ? 'Saved!' : 'Save settings'}</Button>
      </div>
    </>
  );
}
