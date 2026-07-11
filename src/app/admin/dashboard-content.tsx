'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';

interface Feed {
  id: string; name: string; url: string; status: string;
  itemsToday: number; totalItemsImported: number; lastFetchedAt?: string | null;
  category?: { name: string } | null;
}

interface DashboardData {
  overview: { users: number; authors: number; articles: number; published: number; pendingApplications: number; totalViews: number; totalEarnings: number; totalPayouts: number; newUsers30d: number };
  topArticles: { title: string; slug: string; viewCount: number; author: { firstName: string; lastName: string } }[];
  securityEvents: { eventType: string; createdAt: string; user?: { username: string } | null }[];
}

interface ActivityEvent {
  type: 'application' | 'article' | 'user' | 'rss' | 'payout';
  message: string;
  time: string;
  link?: string;
}

export default function AdminDashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [feeds, setFeeds] = useState<Feed[]>(null as any);
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  const fetchAll = useCallback(async () => {
    const [analytics, rssRes, appsRes] = await Promise.all([
      fetch('/api/admin/analytics').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/rss').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/authors?status=pending').then(r => r.ok ? r.json() : null),
    ]);
    if (analytics) setData(analytics);
    if (rssRes?.feeds) setFeeds(rssRes.feeds);
    if (appsRes?.applications) {
      setPendingApps(appsRes.applications);
      const events: ActivityEvent[] = appsRes.applications.map((a: any) => ({
        type: 'application' as const,
        message: `${a.user.firstName} ${a.user.lastName} applied to become an author`,
        time: a.createdAt,
        link: '/admin/authors',
      }));
      setActivity(prev => {
        const combined = [...events, ...prev].slice(0, 20);
        return combined;
      });
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (!data) {
    return (
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="dash-stat-card">
            <div style={{ height: 12, width: 80, background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 28, width: 60, background: 'var(--border-subtle)', borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  const o = data.overview;

  return (
    <>
      {/* Stats */}
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {[
          { label: 'Total Users', value: o.users.toString(), change: `+${o.newUsers30d} this month`, up: true },
          { label: 'Authors', value: o.authors.toString(), change: `${o.pendingApplications} pending apps`, up: o.pendingApplications === 0, href: '/admin/authors' },
          { label: 'Articles', value: o.articles.toString(), change: `${o.published} published`, up: true },
          { label: 'Pending Review', value: (o.articles - o.published).toString(), change: `${o.articles - o.published} need review`, up: false },
          { label: 'Total Views', value: o.totalViews >= 1000 ? `${(o.totalViews / 1000).toFixed(1)}K` : o.totalViews.toString(), change: 'all time', up: true },
          { label: 'Earnings', value: `$${(o.totalEarnings || 0).toLocaleString()}`, change: `$${(o.totalPayouts || 0)} paid out`, up: true },
        ].map(s => (
          <div key={s.label} className="dash-stat-card" style={s.href ? { cursor: 'pointer' } : undefined} onClick={() => s.href && window.location.assign(s.href)}>
            <div className="dash-stat-label">{s.label}</div>
            <div className="dash-stat-value">{s.value}</div>
            {s.change !== 'all time' && <span className={`dash-stat-change${s.up ? ' up' : ' down'}`}>{s.change}</span>}
          </div>
        ))}
      </div>

      {/* Pending Applications Alert */}
      {pendingApps.length > 0 && (
        <div style={{ background: 'var(--warning-light, #fef9c3)', border: '1px solid #eab308', borderRadius: 12, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          <span style={{ fontWeight: 600, flex: 1 }}>
            {pendingApps.length} author application{pendingApps.length > 1 ? 's' : ''} pending review
          </span>
          <Link href="/admin/authors" style={{ textDecoration: 'none' }}>
            <Button size="sm">Review Now</Button>
          </Link>
        </div>
      )}

      {/* Main grid: Top Articles + Revenue */}
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
              }}>
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
            <h2 className="dash-card-title">Revenue & Payouts</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Platform share: 30%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total Earnings', value: `$${(o.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: undefined },
              { label: 'Completed Payouts', value: `$${(o.totalPayouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: undefined },
              { label: 'Platform Revenue (30%)', value: `$${((o.totalEarnings || 0) * 0.3).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'var(--success)' },
              { label: 'Outstanding', value: `$${((o.totalEarnings || 0) - (o.totalPayouts || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'var(--warning)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second grid: Live Activity + Feeds */}
      <div className="dash-content-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Live Activity Feed</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Auto-refreshes every 30s</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pendingApps.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)', borderLeft: '3px solid var(--warning)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--warning)' }}>New application{pendingApps.length > 1 ? 's' : ''}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>
                  {pendingApps.length} author{pendingApps.length > 1 ? 's' : ''} pending
                </span>
                <Link href="/admin/authors" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Review</Link>
              </div>
            )}
            {data.securityEvents.slice(0, 5).map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600 }}>{ev.eventType}</span>
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>
                  {ev.user ? `by @${ev.user.username}` : ''}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{formatRelativeDate(ev.createdAt)}</span>
              </div>
            ))}
            {pendingApps.length === 0 && data.securityEvents.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No recent activity.</p>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">RSS Feeds</h2>
            <Link href="/admin/rss" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>Manage</Link>
          </div>
          {!feeds ? (
            <div style={{ padding: 16, textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Loading feeds...</div>
          ) : feeds.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No RSS feeds configured.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
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
      </div>

      {/* Third grid: User Growth */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Platform Growth</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Users', value: o.users.toLocaleString() },
            { label: 'Active Authors', value: o.authors.toLocaleString() },
            { label: 'New Users (30d)', value: `+${o.newUsers30d.toLocaleString()}`, color: 'var(--success)' },
            { label: 'Total Articles', value: o.articles.toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: (s as any).color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
