'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/lib/utils';

interface Feed {
  id: string; name: string; url: string; status: string;
  itemsToday: number; totalItemsImported: number; lastFetchedAt?: string | null;
  category?: { name: string } | null;
}

interface DashboardData {
  overview: { users: number; authors: number; articles: number; published: number; pendingApplications: number; totalViews: number; sourcedViews: number; totalEarnings: number; totalPayouts: number; newUsers30d: number; sourcedArticles: number; inHouseArticles: number };
  topArticles: { title: string; slug: string; viewCount: number; sourceName?: string | null; sourceUrl?: string | null; author: { firstName: string; lastName: string } }[];
  securityEvents: { eventType: string; createdAt: string; metadata?: Record<string, unknown> | null; user?: { username: string; email?: string } | null }[];
  revenueMonths: { label: string; value: number }[];
  topAuthors: { initials: string; name: string; email: string; color: string; articles: number; views: string; status: string }[];
  pendingPayouts: { author: string; amount: number; method: string }[];
  securityStatus: { label: string; dot: string; value: string }[];
}

interface ActivityEvent {
  type: 'application' | 'article' | 'user' | 'rss' | 'payout';
  message: string;
  time: string;
  link?: string;
}

const appColors = ['oklch(50% 0.14 200)', 'oklch(50% 0.14 320)', 'oklch(50% 0.14 90)', 'oklch(50% 0.14 160)', 'oklch(50% 0.14 260)'];

function getInitials(fn: string, ln: string) {
  return `${fn[0] || ''}${ln[0] || ''}`;
}

export default function AdminDashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [feeds, setFeeds] = useState<Feed[]>(null as any);
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [revSplit, setRevSplit] = useState('70');
  const [withdrawThreshold, setWithdrawThreshold] = useState('$50');
  const [autoApprove, setAutoApprove] = useState(false);
  const [contentMod, setContentMod] = useState(true);
  const [breakingNews, setBreakingNews] = useState(true);

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
  const totalRev = o.totalEarnings || 0;
  const platformShare = totalRev * 0.3;
  const authorPayouts = totalRev - platformShare;
  const maxRev = Math.max(...data.revenueMonths.map(d => d.value), 1);

  const severityCount = data.securityEvents.filter(e => {
    const meta = e.metadata as { severity?: string } | null;
    return meta?.severity === 'high' || meta?.severity === 'critical';
  }).length;

  const securityScore = Math.max(94 - severityCount * 5, 50);
  const securityWarnings = severityCount > 0 ? severityCount : 2;

  return (
    <>
      <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Total Traffic</div>
          <div className="dash-stat-value">{o.totalViews >= 1000 ? `${(o.totalViews / 1000).toFixed(1)}K` : o.totalViews.toString()}</div>
          <span className="dash-stat-change up">↑ {o.sourcedViews >= 1000 ? `${(o.sourcedViews / 1000).toFixed(1)}K` : o.sourcedViews} sourced</span>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Active Authors</div>
          <div className="dash-stat-value">{o.authors}</div>
          <span className="dash-stat-change up">↑ {o.pendingApplications} pending apps</span>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Platform Revenue</div>
          <div className="dash-stat-value">${platformShare.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
          <span className="dash-stat-change up">↑ 30% share</span>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Active Readers</div>
          <div className="dash-stat-value">{o.users >= 1000 ? `${(o.users / 1000).toFixed(1)}K` : o.users.toString()}</div>
          <span className="dash-stat-change up">↑ +{o.newUsers30d} new signups</span>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Security Score</div>
          <div className="dash-stat-value">{securityScore}/100</div>
          <span className="dash-stat-change" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>⚠ {securityWarnings} warnings</span>
        </div>
      </div>

      <div className="dash-content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Author Applications ({pendingApps.length} pending)</h2>
            <Link href="/admin/authors">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingApps.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No pending applications.</p>
            ) : (
              pendingApps.slice(0, 5).map((app: any, i: number) => (
                <div key={app.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: appColors[i % appColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0 }}>
                    {getInitials(app.user?.firstName || '', app.user?.lastName || '') || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{app.user?.firstName} {app.user?.lastName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      Applied {app.createdAt ? formatRelativeDate(app.createdAt) : 'recently'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="primary" size="sm">Approve</Button>
                    <Button variant="ghost" size="sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>Reject</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Security Monitor</h2>
            <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, background: 'var(--success-light)', color: 'var(--success)' }}>All Systems Normal</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.securityStatus.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)', fontSize: '0.8rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: s.dot === 'green' ? 'var(--success)' : s.dot === 'yellow' ? 'var(--warning)' : 'var(--error)' }} />
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontWeight: 600, fontFeatureSettings: '"tnum"' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-content-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Monthly Revenue (Platform Share: 30%)</h2>
            <Button variant="ghost" size="sm">Configure Split</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, paddingTop: 10 }}>
            {data.revenueMonths.map((m) => {
              const pct = (m.value / maxRev) * 100;
              return (
                <div key={m.label} style={{ flex: 1, borderRadius: '4px 4px 0 0', background: 'var(--primary-light)', minHeight: 4, height: `${pct}%`, position: 'relative', transition: 'background 0.2s' }}
                  title={`${m.label}: $${m.value.toLocaleString()}`}>
                  <span style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{m.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, padding: '16px 0 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Total Revenue (This Month)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>${totalRev.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Platform Share</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFeatureSettings: '"tnum"', color: 'var(--success)' }}>${platformShare.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Author Payouts</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>${authorPayouts.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Pending Payouts</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.pendingPayouts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-base)' }}>
                <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 500 }}>{p.author}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFeatureSettings: '"tnum"', color: 'var(--success)' }}>${p.amount.toFixed(2)}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', minWidth: 60 }}>{p.method}</span>
              </div>
            ))}
          </div>
          <button style={{ width: '100%', marginTop: 16, padding: 12, background: 'var(--success)', color: 'oklch(98% 0.005 145)', border: 'none', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.opacity = ''; }}>
            Process All (${data.pendingPayouts.reduce((s, p) => s + p.amount, 0).toFixed(2)})
          </button>
        </div>
      </div>

      <div className="dash-content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Platform Settings</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Revenue Split (Author/Platform)</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Percentage of article revenue that goes to the author</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="text" value={revSplit} onChange={e => setRevSplit(e.target.value)}
                  style={{ width: 80, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'inherit', fontFeatureSettings: '"tnum"', textAlign: 'center' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ 30%</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Withdrawal Threshold</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Minimum balance required for author withdrawal</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="text" value={withdrawThreshold} onChange={e => setWithdrawThreshold(e.target.value)}
                  style={{ width: 80, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'inherit', fontFeatureSettings: '"tnum"', textAlign: 'center' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Auto-approve Authors</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Automatically approve applications with verified portfolios</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div onClick={() => setAutoApprove(!autoApprove)} style={{ width: 40, height: 22, borderRadius: 11, background: autoApprove ? 'var(--success)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: autoApprove ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-elevated)', transition: 'transform 0.2s' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Content Moderation</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>AI-assisted content review before publishing</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div onClick={() => setContentMod(!contentMod)} style={{ width: 40, height: 22, borderRadius: 11, background: contentMod ? 'var(--success)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: contentMod ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-elevated)', transition: 'transform 0.2s' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Breaking News Ticker</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Show ticker on homepage</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div onClick={() => setBreakingNews(!breakingNews)} style={{ width: 40, height: 22, borderRadius: 11, background: breakingNews ? 'var(--success)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: breakingNews ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-elevated)', transition: 'transform 0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Top Authors (This Month)</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Author</th>
                  <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Articles</th>
                  <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Views</th>
                  <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.topAuthors.map((a, i) => (
                  <tr key={i}>
                    <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0 }}>{a.initials}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{a.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)', fontFeatureSettings: '"tnum"' }}>{a.articles}</td>
                    <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)', fontFeatureSettings: '"tnum"' }}>{a.views}</td>
                    <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, display: 'inline-block',
                        background: a.status === 'active' ? 'var(--success-light)' : 'var(--warning-light)',
                        color: a.status === 'active' ? 'var(--success)' : 'var(--warning)' }}>
                        {a.status === 'active' ? 'Active' : 'Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
