'use client';

import { useEffect, useState } from 'react';

interface Reader {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminReadersPage() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/readers')
      .then(r => r.json())
      .then(d => {
        setReaders(d.readers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-indicator">
      <div className="loading-dots"><span /><span /><span /></div>
      <span>Loading readers...</span>
    </div>
  );

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Readers</h1>
          <p className="dash-subtitle">All registered platform users</p>
        </div>
        <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
          {readers.length} total
        </span>
      </div>

      <div className="dash-card" style={{ overflowX: 'auto' }}>
        {readers.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 32 }}>No readers found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>User</th>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Email</th>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Status</th>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {readers.map(r => (
                <tr key={r.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-base)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}>
                  <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                        {r.firstName[0]}{r.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>@{r.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: '0.78rem', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>{r.email}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{
                      padding: '2px 9px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 600,
                      background: r.isActive ? 'var(--success-light)' : 'var(--error-light)',
                      color: r.isActive ? 'var(--success)' : 'var(--error)',
                    }}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: '0.78rem', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
