'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { StatsCard } from '@/components/dashboard/stats-card';
import { AnalyticsChart } from '@/components/dashboard/analytics-chart';
import { Button } from '@/components/ui/button';
import { Eye, Heart, MessageCircle, DollarSign } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function AuthorAnalyticsPage() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [data, setData] = useState<{
    totals: { views: number; likes: number; comments: number; shares: number };
    monthlyEarnings: number;
    dailyViews: { date: string; count: number }[];
    topArticles: { title: string; slug: string; viewCount: number; likeCount: number }[];
  } | null>(null);

  useEffect(() => {
    if (!user || !['author', 'admin'].includes(user.role)) return;
    fetch('/api/author/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [user]);

  if (loading) return null;

  if (!user || !['author', 'admin'].includes(user.role)) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{user ? 'Author access required.' : 'Sign in to view analytics.'}</p>
        <Link href="/author/apply"><Button>Apply as author</Button></Link>
      </div>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const navItems = [
    { href: '/author/dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { href: '/author/editor', label: 'Editor', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
    { href: '/author/analytics', label: 'Analytics', icon: 'M18 20V10 M12 20V4 M6 20v-6' },
    { href: '/author/withdraw', label: 'Withdrawals', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  ];

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-logo"><span>026</span>Newsblog</Link>
        <div className="dash-sidebar-role">Author</div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Main</div>
          <nav className="dash-sidebar-nav">
            {navItems.map(item => {
              const active = pathname === item.href;
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
          <div className="dash-sidebar-label">Quick Links</div>
          <nav className="dash-sidebar-nav">
            <Link href="/" className="dash-sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Public Home
            </Link>
            <Link href="/settings" className="dash-sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              Settings
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
            <h1 className="dash-title">Analytics</h1>
            <p className="dash-subtitle">Track your article performance</p>
          </div>
        </div>

        {data ? (
          <>
            <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Total views</div>
                <div className="dash-stat-value">{formatNumber(data.totals.views)}</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Total likes</div>
                <div className="dash-stat-value">{formatNumber(data.totals.likes)}</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Comments</div>
                <div className="dash-stat-value">{formatNumber(data.totals.comments)}</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Monthly earnings</div>
                <div className="dash-stat-value">${data.monthlyEarnings.toFixed(2)}</div>
              </div>
            </div>

            <div className="dash-card" style={{ marginBottom: 24 }}>
              <AnalyticsChart data={data.dailyViews} />
            </div>

            <div className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title">Top articles</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.topArticles.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/article/${a.slug}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', padding: 10, borderRadius: 8,
                      border: '1px solid var(--border-subtle)', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{a.title}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginLeft: 12, flexShrink: 0 }}>
                      {formatNumber(a.viewCount)} views · {a.likeCount} likes
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
        )}
      </main>
    </div>
  );
}
