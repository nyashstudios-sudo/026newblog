'use client';

import { useEffect, useState } from 'react';
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
  lastFetchedAt?: string | null;
  lastError?: string | null;
  category?: { name: string; slug: string } | null;
}

interface FeedStats {
  totalFeeds: number;
  activeFeeds: number;
  pausedFeeds: number;
  errorFeeds: number;
  totalItems: number;
  itemsToday: number;
  itemsImportedAsArticles: number;
}

export default function AdminRssPage() {
  const { user, loading } = useAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);

  const load = () => {
    fetch('/api/admin/rss')
      .then((r) => r.json())
      .then((d) => {
        setFeeds(d.feeds || []);
        if (d.stats) setStats(d.stats);
      })
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

  const fetchFeed = async (feedId: string, feedName: string) => {
    setFetching(feedId);
    try {
      const res = await fetch(`/api/admin/rss/${feedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch' }),
      });
      const data = await res.json();
      if (data.error) alert(`Error: ${data.error}`);
      else alert(`Fetched ${data.result?.imported || 0} new items from ${feedName}`);
    } catch (e) {
      alert('Fetch failed');
    } finally {
      setFetching(null);
      load();
    }
  };

  const importFeed = async (feedId: string, feedName: string) => {
    setImporting(feedId);
    try {
      const res = await fetch(`/api/admin/rss/${feedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import' }),
      });
      const data = await res.json();
      if (data.error) alert(`Error: ${data.error}`);
      else alert(data.message || `Imported ${data.imported} items as articles from ${feedName}`);
    } catch (e) {
      alert('Import failed');
    } finally {
      setImporting(null);
      load();
    }
  };

  const importAll = async () => {
    setImporting('all');
    try {
      const res = await fetch('/api/admin/rss/import-all', { method: 'POST' });
      const data = await res.json();
      if (data.error) alert(`Error: ${data.error}`);
      else alert(`Imported ${data.imported} RSS items as published articles`);
    } catch (e) {
      alert('Import failed');
    } finally {
      setImporting(null);
      load();
    }
  };

  if (loading) return null;

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">RSS Feed Management</h1>
          <p className="dash-subtitle">Manage external RSS feeds and import content</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button variant="outline" onClick={importAll} disabled={importing === 'all'}>
            {importing === 'all' ? 'Importing...' : 'Import All as Articles'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          <div className="dash-stat-card">
            <div className="dash-stat-label">Total Feeds</div>
            <div className="dash-stat-value">{stats.totalFeeds}</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-label">Active</div>
            <div className="dash-stat-value" style={{ color: 'var(--success)' }}>{stats.activeFeeds}</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-label">Total Items</div>
            <div className="dash-stat-value">{stats.totalItems.toLocaleString()}</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-label">Items Today</div>
            <div className="dash-stat-value" style={{ color: 'var(--accent)' }}>{stats.itemsToday}</div>
          </div>
        </div>
      )}

      {/* Add Feed */}
      <div className="dash-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Add feed</h2>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Input placeholder="Feed name" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <Input placeholder="Feed URL" value={url} onChange={(e) => setUrl(e.target.value)} style={{ flex: 2, minWidth: 300 }} />
          <Button onClick={addFeed}>Add</Button>
        </div>
      </div>

      {/* Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {feeds.map((feed) => (
          <div key={feed.id} className="dash-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{feed.name}</span>
                <Badge>{feed.status}</Badge>
                {feed.category && <span style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'capitalize' }}>{feed.category.name}</span>}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500, marginTop: 4 }}>{feed.url}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: '0.7rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                <span>Total items: <strong>{feed.totalItemsImported || 0}</strong></span>
                <span>Today: <strong>{feed.itemsToday || 0}</strong></span>
                <span>Last fetch: {feed.lastFetchedAt ? new Date(feed.lastFetchedAt).toLocaleString() : 'Never'}</span>
              </div>
              {feed.lastError && (
                <div style={{ fontSize: '0.7rem', color: 'var(--error)', marginTop: 4 }}>⚠️ {feed.lastError}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleStatus(feed.id, feed.status)}
                disabled={fetching === feed.id || importing === feed.id}
              >
                {fetching === feed.id ? 'Fetching...' : importing === feed.id ? 'Importing...' : feed.status === 'active' ? 'Pause' : 'Activate'}
              </Button>
              <Button 
                size="sm" 
                onClick={() => fetchFeed(feed.id, feed.name)}
                disabled={fetching === feed.id || importing === feed.id}
              >
                Fetch
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => importFeed(feed.id, feed.name)}
                disabled={fetching === feed.id || importing === feed.id}
              >
                Import
              </Button>
            </div>
          </div>
        ))}
        {feeds.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: 24 }}>
            No RSS feeds configured. Add feeds above to start pulling content.
          </p>
        )}
      </div>
    </>
  );
}