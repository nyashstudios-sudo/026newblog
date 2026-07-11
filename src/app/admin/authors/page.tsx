'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    fetch(`/api/admin/authors?status=${filter}`)
      .then((r) => r.json())
      .then((d) => setApplications(d.applications || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    load();
  }, [user, filter]);

  const review = async (applicationId: string, action: 'approve' | 'reject') => {
    await fetch('/api/admin/authors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, action }),
    });
    load();
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
            <div
              key={app.id}
              className="dash-card"
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <Avatar
                  src={app.user.avatarUrl}
                  name={`${app.user.firstName} ${app.user.lastName}`}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {app.user.firstName} {app.user.lastName}
                    </h3>
                    <Badge>{app.status}</Badge>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{app.user.username} · {app.user.email}</p>
                  {app.professionalTitle && (
                    <p style={{ fontSize: '0.82rem', marginTop: 8 }}>{app.professionalTitle} · {app.writingNiche}</p>
                  )}
                  {app.motivation && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8, lineClamp: 3 }}>{app.motivation}</p>
                  )}
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                    Applied {formatRelativeDate(app.createdAt)}
                  </p>
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
          {applications.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No applications found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
