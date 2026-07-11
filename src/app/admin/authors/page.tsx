'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';

interface Application {
  id: string;
  status: string;
  professionalTitle?: string | null;
  writingNiche?: string | null;
  motivation?: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export default function AdminAuthorsPage() {
  const { user, loading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    fetch(`/api/admin/authors?status=${filter}`)
      .then((r) => r.json())
      .then((d) => setApplications(d.applications || []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [filter]);

  const review = async (applicationId: string, action: 'approve' | 'reject') => {
    await fetch('/api/admin/authors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, action }),
    });
    load();
  };

  if (loading) return null;

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Author Applications</h1>
          <p className="dash-subtitle">Review and manage author applications</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ height: 36, padding: '0 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: '0.82rem', fontFamily: 'inherit', color: 'var(--text-primary)' }}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {applications.map((app) => (
          <div key={app.id} className="dash-card">
            <div style={{ display: 'flex', gap: 16 }}>
              <Avatar src={app.user.avatarUrl} name={`${app.user.firstName} ${app.user.lastName}`} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '0.85rem' }}>{app.user.firstName} {app.user.lastName}</h3>
                  <Badge>{app.status}</Badge>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{app.user.username} · {app.user.email}</p>
                {app.professionalTitle && <p style={{ fontSize: '0.82rem', marginTop: 8 }}>{app.professionalTitle} · {app.writingNiche}</p>}
                {app.motivation && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>{app.motivation}</p>}
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 8 }}>Applied {formatRelativeDate(app.createdAt)}</p>
              </div>
              {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button size="sm" onClick={() => review(app.id, 'approve')}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => review(app.id, 'reject')}>Reject</Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {applications.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No applications found.</p>}
      </div>
    </>
  );
}
