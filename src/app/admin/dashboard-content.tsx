'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export default function AdminDashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      fetch('/api/admin/analytics', { signal: ac.signal }).then(r => r.ok ? r.json() : null),
      fetch('/api/admin/rss', { signal: ac.signal }).then(r => r.ok ? r.json() : null),
    ]).then(([analytics, rss]) => {
      if (analytics) setData(analytics);
      if (rss?.feeds) setFeeds(rss.feeds);
    }).catch(() => {});
    return () => ac.abort();
  }, []);

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
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Total Users', value: o.users.toString(), change: `+${o.newUsers30d} this month`, up: true },
          { label: 'Authors', value: o.authors.toString(), change: `${o.pendingApplications} pending`, up: false },
          { label: 'Articles', value: o.published.toString(), change: '—', up: true },
          { label: 'Pending Review', value: (o.articles - o.published).toString(), change: '—', up: true },
          { label: 'Total Views', value: o.totalViews >= 1000 ? `${(o.totalViews / 1000).toFixed(1)}K` : o.totalViews.toString(), change: '—', up: true },
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

      <div className="dash-content-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">User Growth</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total Users', value: o.users.toLocaleString() },
              { label: 'Active Authors', value: o.authors.toLocaleString() },
              { label: 'New Users (30d)', value: `+${o.newUsers30d.toLocaleString()}`, color: 'var(--success)' },
              { label: 'Total Articles', value: o.articles.toLocaleString() },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: (s as any).color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">RSS Feeds</h2>
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
      </div>
    </>
  );
}
