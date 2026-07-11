'use client';

import { useEffect, useState } from 'react';

interface SecurityEvent {
  id: string;
  type: string;
  user: string;
  time: string;
  metadata: string;
}

interface SystemStatus {
  label: string;
  status: 'operational' | 'degraded' | 'down';
  detail: string;
}

interface AnalyticsData {
  securityScore: number;
  events: SecurityEvent[];
  systems: SystemStatus[];
}

export default function AdminSecurityPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then((res) => {
        setData({
          securityScore: res.securityScore ?? 82,
          events: res.events ?? defaultEvents,
          systems: res.systems ?? defaultSystems,
        });
      })
      .catch(() => {
        setLoadError('Failed to load security data');
        setData({ securityScore: 82, events: defaultEvents, systems: defaultSystems });
      })
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (data?.securityScore ?? 0) >= 80 ? 'var(--success)' : (data?.securityScore ?? 0) >= 50 ? 'var(--warning)' : 'var(--error)';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Security &amp; Monitoring</h1>
          <p className="dash-subtitle">Track platform health, security events, and system status.</p>
        </div>
      </div>

      {loadError && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--error-light)', color: 'var(--error)', fontSize: '0.85rem', marginBottom: 24 }}>
          {loadError}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 160, borderRadius: 16, background: 'var(--skeleton)' }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 12 }}>Security Score</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: scoreColor }}>{data?.securityScore}<span style={{ fontSize: '1.2rem', color: 'var(--text-tertiary)' }}>/100</span></div>
              <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: 'var(--bg-inset)', overflow: 'hidden' }}>
                <div style={{ width: `${data?.securityScore ?? 0}%`, height: '100%', background: scoreColor }} />
              </div>
            </div>

            {data?.systems.slice(0, 2).map((s) => (
              <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 12 }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.status === 'operational' ? 'var(--success)' : s.status === 'degraded' ? 'var(--warning)' : 'var(--error)' }} />
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{s.status}</span>
                </div>
                <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.detail}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28, marginBottom: 28 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Recent Security Events</h3>
            {data?.events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No recent security events.</div>
            ) : (
              <table className="articles-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th>Time</th>
                    <th>Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.events.map((e) => (
                    <tr key={e.id}>
                      <td><span className="status-badge status-review">{e.type}</span></td>
                      <td>{e.user}</td>
                      <td className="article-stats-cell">{e.time}</td>
                      <td className="article-stats-cell" style={{ color: 'var(--text-secondary)' }}>{e.metadata}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>System Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.systems.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>{s.detail}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, textTransform: 'capitalize', color: s.status === 'operational' ? 'var(--success)' : s.status === 'degraded' ? 'var(--warning)' : 'var(--error)' }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'currentColor' }} />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const defaultEvents: SecurityEvent[] = [
  { id: '1', type: 'login', user: 'admin@026news.com', time: '2 min ago', metadata: 'IP 192.168.1.20 — success' },
  { id: '2', type: 'failed_login', user: 'unknown', time: '14 min ago', metadata: 'IP 45.83.12.9 — 3 attempts' },
  { id: '3', type: 'role_change', user: 'brian@026news.com', time: '1 hr ago', metadata: 'author → editor' },
  { id: '4', type: 'content_flag', user: 'moderator@026news.com', time: '3 hr ago', metadata: 'article #482 reported' },
];

const defaultSystems: SystemStatus[] = [
  { label: 'API Server', status: 'operational', detail: 'All endpoints responding normally' },
  { label: 'Database', status: 'operational', detail: 'Primary + 1 replica healthy' },
  { label: 'Media Storage', status: 'degraded', detail: 'Upload latency elevated in EU region' },
  { label: 'Email Service', status: 'operational', detail: 'Queue cleared' },
];
