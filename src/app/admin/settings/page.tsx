'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const pathname = usePathname();
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

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'A';
  const navItems = [
    { href: '/admin', label: 'Overview', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { href: '/admin/authors', label: 'Authors', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
    { href: '/admin/rss', label: 'RSS Feeds', icon: 'M4 11a9 9 0 0 1 9 9 M4 4a16 16 0 0 1 16 16 M5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
    { href: '/admin/settings', label: 'Settings', icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
    { href: '/admin/moderation', label: 'Moderation', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  ];

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-logo"><span>026</span>Newsblog</Link>
        <div className="dash-sidebar-role">Admin</div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Main</div>
          <nav className="dash-sidebar-nav">
            {navItems.map(item => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={`dash-sidebar-link${active ? ' active' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Quick</div>
          <nav className="dash-sidebar-nav">
            <Link href="/" className="dash-sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Public Home
            </Link>
          </nav>
        </div>
        {user && <div className="dash-sidebar-footer">
          <Link href={`/profile/${user.username}`} className="dash-sidebar-profile" style={{ textDecoration: 'none' }}>
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className="dash-sidebar-profile-info">
              <div className="dash-sidebar-profile-name">{user.firstName} {user.lastName}</div>
              <div className="dash-sidebar-profile-role">{user.role}</div>
            </div>
          </Link>
        </div>}
      </aside>

      <main className="dash-main">
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
                <input
                  type="number"
                  value={settings.authorShare}
                  onChange={(e) => setSettings((s) => ({ ...s, authorShare: +e.target.value, platformShare: 100 - +e.target.value }))}
                  style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Platform %</label>
                <input
                  type="number"
                  value={settings.platformShare}
                  readOnly
                  style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)', opacity: 0.6 }}
                />
              </div>
            </div>
          </div>

          <div className="dash-card">
            <h2 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Withdrawals</h2>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Minimum threshold (USD)</label>
            <input
              type="number"
              value={settings.withdrawalThreshold}
              onChange={(e) => setSettings((s) => ({ ...s, withdrawalThreshold: +e.target.value }))}
              style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="dash-card">
            <h2 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Moderation</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.autoFlag}
                onChange={(e) => setSettings((s) => ({ ...s, autoFlag: e.target.checked }))}
              />
              Auto-flag suspicious content
            </label>
          </div>

          <Button onClick={save} className="w-full">
            {saved ? 'Saved!' : 'Save settings'}
          </Button>
        </div>
      </main>
    </div>
  );
}
