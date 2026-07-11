'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/lib/utils';

interface QueueItem {
  id: string;
  type: string;
  reason?: string | null;
  aiCategory?: string | null;
  status: string;
  createdAt: string;
}

type FilterTab = 'pending' | 'approved' | 'reported' | 'all';

export default function AdminModerationPage() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch('/api/admin/moderation')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});
  }, [user]);

  const moderate = async (id: string, action: 'approve' | 'reject') => {
    await fetch('/api/admin/moderation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'reported', label: 'Reported' },
    { key: 'all', label: 'All' },
  ];

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  const counts = {
    pending: items.filter((i) => i.status === 'pending').length,
    approved: items.filter((i) => i.status === 'approved').length,
    reported: items.filter((i) => i.status === 'reported').length,
    all: items.length,
  };

  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <Link href="/"><Button>Back to home</Button></Link>
      </div>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`;
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
        <div className="dash-sidebar-footer">
          <Link href={`/profile/${user.username}`} className="dash-sidebar-profile" style={{ textDecoration: 'none' }}>
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className="dash-sidebar-profile-info">
              <div className="dash-sidebar-profile-name">{user.firstName} {user.lastName}</div>
              <div className="dash-sidebar-profile-role">{user.role}</div>
            </div>
          </Link>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Moderation Queue</h1>
            <p className="dash-subtitle">Review flagged comments and articles before they go live</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="dash-stats" style={{ marginBottom: 24 }}>
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className="dash-stat-card"
              style={{ cursor: 'pointer', ...(activeTab === tab.key ? { borderColor: 'var(--primary)' } : {}) }}
              onClick={() => setActiveTab(tab.key)}
            >
              <div className="dash-stat-label">{tab.label}</div>
              <div className="dash-stat-value">{counts[tab.key]}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          background: 'var(--bg-surface)',
          padding: 4,
          borderRadius: 10,
          border: '1px solid var(--border-subtle)',
          width: 'fit-content',
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 7,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'oklch(98% 0.005 175)' : 'var(--text-tertiary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-inset)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {tab.label}
                {tab.key === 'pending' && counts.pending > 0 && (
                  <span style={{
                    fontSize: '0.6rem',
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: isActive ? 'oklch(98% 0.005 175 / 0.3)' : 'var(--error)',
                    color: isActive ? 'oklch(98% 0.005 175)' : 'oklch(98% 0.005 25)',
                    fontWeight: 700,
                  }}>
                    {counts.pending}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Queue Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: 20,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 10,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: item.type === 'comment' ? 'var(--primary-light)' : item.type === 'spam' ? 'var(--error-light)' : 'var(--warning-light)',
                  color: item.type === 'comment' ? 'var(--primary)' : item.type === 'spam' ? 'var(--error)' : 'var(--warning)',
                }}>
                  {item.type}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flex: 1 }}>
                  {item.reason || 'Flagged for review'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                  {formatRelativeDate(item.createdAt)}
                </span>
              </div>

              {/* AI Flag */}
              {item.aiCategory && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: 'var(--warning-light)',
                  borderRadius: 8,
                  fontSize: '0.72rem',
                  color: 'oklch(45% 0.12 80)',
                  marginBottom: 14,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  AI detected: {item.aiCategory}
                </div>
              )}

              {/* Content / Reason */}
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-inset)',
                borderRadius: 10,
                marginBottom: 14,
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}>
                {item.reason || 'Awaiting review'}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => moderate(item.id, 'approve')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    border: 'none',
                    background: 'var(--success)',
                    color: 'oklch(98% 0.005 145)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Approve
                </button>
                <button
                  onClick={() => moderate(item.id, 'reject')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    border: 'none',
                    background: 'var(--error)',
                    color: 'oklch(98% 0.005 25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: 48 }}>
              No items in this queue.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
