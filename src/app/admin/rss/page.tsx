'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

  useEffect(() => { load(); }, []);

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

  return (
    <>
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
          <div key={feed.id} className="dash-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{feed.name}</span>
                <Badge>{feed.status}</Badge>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{feed.url}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{feed.totalItemsImported} items imported · {feed.itemsToday} today</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggleStatus(feed.id, feed.status)}>
              {feed.status === 'active' ? 'Pause' : 'Activate'}
            </Button>
          </div>
        ))}
        {feeds.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No RSS feeds configured.</p>}
      </div>
    </>
  );
}
