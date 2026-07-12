'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
  overview: {
    users: number; authors: number; articles: number; published: number;
    totalViews: number; totalEarnings: number; newUsers30d: number;
    sourcedArticles: number; inHouseArticles: number;
  };
  topArticles: { title: string; slug: string; viewCount: number; likeCount: number }[];
  revenueMonths: { label: string; value: number }[];
  topAuthors: { initials: string; name: string; articles: number; views: string }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-indicator">
      <div className="loading-dots"><span /><span /><span /></div>
      <span>Loading analytics...</span>
    </div>
  );

  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>No data available.</p>;

  const maxRev = Math.max(...data.revenueMonths.map(d => d.value), 1);
  const maxViews = Math.max(...(data.topArticles?.map(a => a.viewCount) || [1]), 1);

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Analytics</h1>
          <p className="dash-subtitle">Platform-wide performance metrics and trends</p>
        </div>
      </div>

      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Total Users</div>
          <div className="dash-stat-value">{data.overview.users}</div>
          <span className="dash-stat-change up">↑ +{data.overview.newUsers30d} this month</span>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Total Articles</div>
          <div className="dash-stat-value">{data.overview.articles}</div>
          <span className="dash-stat-change up">{data.overview.published} published</span>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Total Views</div>
          <div className="dash-stat-value">{data.overview.totalViews >= 1000 ? `${(data.overview.totalViews / 1000).toFixed(1)}K` : data.overview.totalViews}</div>
          <span className="dash-stat-change up">{data.overview.sourcedArticles} sourced</span>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Total Earnings</div>
          <div className="dash-stat-value">${data.overview.totalEarnings.toLocaleString()}</div>
          <span className="dash-stat-change up">{data.overview.inHouseArticles} in-house</span>
        </div>
      </div>

      <div className="dash-content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Revenue (Last 6 Months)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '20px 0 30px' }}>
            {data.revenueMonths.map((m) => {
              const pct = (m.value / maxRev) * 100;
              return (
                <div key={m.label} style={{ flex: 1, borderRadius: '4px 4px 0 0', background: 'var(--primary)', minHeight: 4, height: `${pct}%`, position: 'relative', opacity: 0.7, transition: 'opacity 0.2s' }}
                  title={`${m.label}: $${m.value.toLocaleString()}`}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.7'; }}>
                  <span style={{ position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{m.label}</span>
                  <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>${m.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Top Articles</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.topArticles || []).slice(0, 5).map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: 'var(--bg-base)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', width: 20 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{a.viewCount >= 1000 ? `${(a.viewCount / 1000).toFixed(1)}K` : a.viewCount}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{a.likeCount} likes</div>
                </div>
              </div>
            ))}
            {(!data.topArticles || data.topArticles.length === 0) && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No articles yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Top Authors</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Author</th>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Articles</th>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Views</th>
              </tr>
            </thead>
            <tbody>
              {data.topAuthors.map((a, i) => (
                <tr key={i}>
                  <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `oklch(50% 0.14 ${(i * 60 + 200) % 360})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0 }}>{a.initials}</div>
                      <span style={{ fontWeight: 500 }}>{a.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)', fontFeatureSettings: '"tnum"' }}>{a.articles}</td>
                  <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)', fontFeatureSettings: '"tnum"' }}>{a.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
