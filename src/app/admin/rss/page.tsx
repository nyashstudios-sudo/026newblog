'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Feed {
  id: string;
  name: string;
  url: string;
  status: string;
  itemsToday: number;
  totalItemsImported: number;
  category?: { name: string } | null;
}

export default function AdminRssPage() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const load = () => {
    fetch('/api/admin/rss')
      .then((r) => r.json())
      .then((d) => setFeeds(d.feeds || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    load();
  }, [user]);

  const addFeed = async () => {
    if (!name || !url) return;
    await fetch('/api/admin/rss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }),
    });
    setName('');
    setUrl('');
    load();
  };

  const toggleStatus = async (feedId: string, status: string) => {
    await fetch('/api/admin/rss', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedId, status: status === 'active' ? 'paused' : 'active' }),
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
            <h1 className="dash-title">RSS Feed Management</h1>
            <p className="dash-subtitle">Manage external RSS feeds</p>
          </div>
        </div>

        <div className="dash-card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Add feed</h2>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            <Input placeholder="Feed name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Feed URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button onClick={addFeed}>Add</Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="dash-card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{feed.name}</span>
                  <Badge>{feed.status}</Badge>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{feed.url}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  {feed.totalItemsImported} items imported · {feed.itemsToday} today
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toggleStatus(feed.id, feed.status)}>
                {feed.status === 'active' ? 'Pause' : 'Activate'}
              </Button>
            </div>
          ))}
          {feeds.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No RSS feeds configured.</p>
          )}
        </div>
      </main>
    </div>
  );
}
