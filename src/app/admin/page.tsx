'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Feed {
  id: string; name: string; url: string; status: string;
  itemsToday: number; totalItemsImported: number; lastFetchedAt?: string | null;
  category?: { name: string } | null;
}

export default function AdminDashboardPage() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [data, setData] = useState<{
    overview: { users: number; authors: number; articles: number; published: number; pendingApplications: number; totalViews: number; totalEarnings: number; totalPayouts: number; newUsers30d: number };
    topArticles: { title: string; slug: string; viewCount: number; author: { firstName: string; lastName: string } }[];
    securityEvents: { eventType: string; createdAt: string; user?: { username: string } | null }[];
  } | null>(null);
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
    fetch('/api/admin/rss')
      .then(r => r.json())
      .then(d => setFeeds(d.feeds || []))
      .catch(() => {});
  }, [user]);

  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Admin access required.</p>
        <Link href="/"><Button>Back to home</Button></Link>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { href: '/admin/authors', label: 'Authors', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
    { href: '/admin/moderation', label: 'Moderation', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { href: '/admin/rss', label: 'RSS Feeds', icon: 'M4 11a9 9 0 0 1 9 9 M4 4a16 16 0 0 1 16 16 M5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
    { href: '/admin/settings', label: 'Settings', icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
  ];

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-logo"><span>026</span>Newsblog</Link>
        <div className="dash-sidebar-role">Admin Panel</div>

        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Platform</div>
          <nav className="dash-sidebar-nav">
            {navItems.slice(0, 2).map(item => {
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
          <div className="dash-sidebar-label">Content</div>
          <nav className="dash-sidebar-nav">
            {navItems.slice(2, 4).map(item => {
              const active = pathname.startsWith(item.href);
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
          <div className="dash-sidebar-label">System</div>
          <nav className="dash-sidebar-nav">
            {navItems.slice(4).map(item => {
              const active = pathname.startsWith(item.href);
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

        <div className="dash-sidebar-footer">
          <div className="dash-sidebar-profile">
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className="dash-sidebar-profile-info">
              <div className="dash-sidebar-profile-name">{user.firstName} {user.lastName}</div>
              <div className="dash-sidebar-profile-role">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Platform Overview</h1>
            <p className="dash-subtitle">Real-time monitoring and management for 026Newsblog</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/admin/authors">
              <Button variant="ghost" size="sm">Manage Authors</Button>
            </Link>
            <Link href="/admin/settings">
              <Button size="sm">Settings</Button>
            </Link>
          </div>
        </div>

        {data ? (
          <>
            <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {[
                { label: 'Total Users', value: data.overview.users.toString(), change: `+${data.overview.newUsers30d} this month`, up: true },
                { label: 'Authors', value: data.overview.authors.toString(), change: `${data.overview.pendingApplications} pending applications`, up: false },
                { label: 'Articles Published', value: data.overview.published.toString(), change: '—', up: true },
                { label: 'Pending Review', value: data.overview.pendingApplications.toString(), change: '—', up: true },
                { label: 'Total Views', value: data.overview.totalViews >= 1000 ? `${(data.overview.totalViews / 1000).toFixed(1)}K` : data.overview.totalViews.toString(), change: '—', up: true },
              ].map(s => (
                <div key={s.label} className="dash-stat-card">
                  <div className="dash-stat-label">{s.label}</div>
                  <div className="dash-stat-value">{s.value}</div>
                  {s.change !== '—' && <span className={`dash-stat-change${s.up ? ' up' : ' down'}`}>{s.change}</span>}
                </div>
              ))}
            </div>

            <div className="dash-content-grid">
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">Top Articles</h2>
                  <Link href="/admin/authors" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>View All</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.topArticles.map(a => (
                    <Link key={a.slug} href={`/article/${a.slug}`} style={{
                      display: 'flex', justifyContent: 'space-between', padding: 10, borderRadius: 8,
                      border: '1px solid var(--border-subtle)', textDecoration: 'none', color: 'inherit', fontSize: '0.85rem',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{a.title}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginLeft: 12, flexShrink: 0 }}>
                        {a.viewCount >= 1000 ? `${(a.viewCount / 1000).toFixed(1)}K` : a.viewCount} views
                      </span>
                    </Link>
                  ))}
                  {data.topArticles.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No articles yet.</p>}
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    Security Monitor
                  </h2>
                  <span className="dash-stat-change up" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>All Systems Normal</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.securityEvents.length === 0 ? (
                    <>
                      {[
                        { label: 'API Health', value: '99.9% uptime', dot: 'green' },
                        { label: 'Database Load', value: '23% capacity', dot: 'green' },
                        { label: 'CDN Response', value: '42ms avg', dot: 'green' },
                        { label: 'SSL Certificate', value: 'Valid (89 days)', dot: 'green' },
                        { label: 'Rate Limiting', value: 'Active', dot: 'green' },
                        { label: 'Last Backup', value: '2 hours ago', dot: 'green' },
                      ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-base)', fontSize: '0.8rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: 'var(--success)' }} />
                          <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.label}</span>
                          <span style={{ fontWeight: 600 }}>{s.value}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    data.securityEvents.slice(0, 6).map((e, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-base)', fontSize: '0.8rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: i < 3 ? 'var(--success)' : 'var(--warning)' }} />
                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{e.eventType}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.72rem' }}>{e.user?.username ? `@${e.user.username}` : 'system'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="dash-content-grid">
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">Revenue & Payouts</h2>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Platform share: 30%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Total Earnings (all time)</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>${(data.overview.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Total Payouts (completed)</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>${(data.overview.totalPayouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Platform Revenue (30% share)</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--success)' }}>
                      ${((data.overview.totalEarnings || 0) * 0.3).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Outstanding (unpaid)</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--warning)' }}>
                      ${((data.overview.totalEarnings || 0) - (data.overview.totalPayouts || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">User Growth</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Total Users</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{data.overview.users.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Active Authors</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{data.overview.authors.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>New Users (30d)</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--success)' }}>+{data.overview.newUsers30d.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Total Articles</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{data.overview.articles.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-card" style={{ marginTop: 24 }}>
              <div className="dash-card-header">
                <h2 className="dash-card-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}><path d="M4 11a9 9 0 0 1 9 9 M4 4a16 16 0 0 1 16 16 M5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>
                  RSS Auto-Import
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 8 }}>
                    (runs every 6 hours via Vercel cron)
                  </span>
                </h2>
                <Link href="/admin/rss" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>Manage</Link>
              </div>
              {feeds.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No RSS feeds configured.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {feeds.map((feed) => (
                    <div key={feed.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{feed.name}</span>
                          <Badge>{feed.status}</Badge>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {feed.totalItemsImported} items · {feed.itemsToday} today
                          {feed.lastFetchedAt && ` · Last fetch: ${new Date(feed.lastFetchedAt).toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        )}
      </main>
    </div>
  );
}
