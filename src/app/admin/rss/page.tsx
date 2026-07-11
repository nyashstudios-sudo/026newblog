'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

interface RecentItem {
  id: string;
  title: string;
  imported_at: string;
  feed: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminRssPage() {
  const { user, loading } = useAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [importing, setImporting] = useState<string | null>(null);

  const load = () => {
    fetch('/api/admin/rss')
      .then((r) => r.json())
      .then((d) => {
        setFeeds(d.feeds || []);
        if (d.stats) setStats(d.stats);
        if (d.recentItems) setRecentItems(d.recentItems);
      })
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const addFeed = async () => {
    if (!url) return;
    let name = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    await fetch('/api/admin/rss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, category_id: categoryId || null }),
    });
    setUrl('');
    setCategoryId('');
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
    setImporting(feedId);
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
      setImporting(null);
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

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  if (loading) return null;

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">RSS Feed Manager</h1>
          <p className="dash-subtitle">Pull related content from external sources into the homepage feed</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" onClick={load}>Refresh All</Button>
          <Button variant="outline" onClick={importAll} disabled={importing === 'all'}>
            {importing === 'all' ? 'Importing...' : 'Import All as Articles'}
          </Button>
        </div>
      </div>

      <div className="dash-card" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Feed URL</label>
          <Input type="url" placeholder="https://example.com/rss.xml" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            style={{ width: '100%', height: 40, padding: '0 30px 0 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', appearance: 'none', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Refresh Interval</label>
          <select
            style={{ width: '100%', height: 40, padding: '0 30px 0 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', appearance: 'none', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
            <option>Every 15 min</option>
            <option>Every 30 min</option>
            <option>Every hour</option>
            <option>Every 6 hours</option>
          </select>
        </div>
        <Button onClick={addFeed} disabled={!url} style={{ marginBottom: 1 }}>+ Add Feed</Button>
      </div>

      {stats && (
        <div className="dash-stats" style={{ marginBottom: 24 }}>
          <div className="dash-stat-card">
            <div className="dash-stat-label">Active Feeds</div>
            <div className="dash-stat-value">{stats.activeFeeds}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: 2 }}>All healthy</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-label">Items Today</div>
            <div className="dash-stat-value">{stats.itemsToday}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: 2 }}>Last 24 hours</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-label">Total Imported</div>
            <div className="dash-stat-value">{stats.itemsImportedAsArticles.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Imported as articles</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-label">Errors</div>
            <div className="dash-stat-value">{stats.errorFeeds}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--warning)', marginTop: 2 }}>{stats.errorFeeds} feed{stats.errorFeeds !== 1 ? 's' : ''} with issues</div>
          </div>
        </div>
      )}

      <div className="dash-card" style={{ marginBottom: 24 }}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Connected Feeds ({feeds.length})</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {feeds.map((feed) => (
            <div key={feed.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderRadius: 11, background: 'var(--bg-inset)', transition: 'background 0.15s'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700,
                color: 'var(--text-tertiary)', flexShrink: 0
              }}>
                {getInitials(feed.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{feed.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feed.url}</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFeatureSettings: '"tnum"' }}>
                <span>{feed.itemsToday || 0} items/day</span>
                <span>Last: {feed.lastFetchedAt ? formatTimeAgo(feed.lastFetchedAt) : 'Never'}</span>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 600,
                background: feed.status === 'active' ? 'var(--success-light)' : feed.status === 'error' ? 'var(--error-light)' : 'var(--warning-light)',
                color: feed.status === 'active' ? 'var(--success)' : feed.status === 'error' ? 'var(--error)' : 'var(--warning)',
              }}>
                {feed.status === 'active' ? 'Active' : feed.status === 'error' ? 'Error' : 'Paused'}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => feed.status === 'error' ? fetchFeed(feed.id, feed.name) : toggleStatus(feed.id, feed.status)}
                  disabled={importing === feed.id}
                  title={feed.status === 'error' ? 'Retry' : feed.status === 'active' ? 'Pause' : 'Activate'}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-subtle)',
                    background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all 0.15s'
                  }}>
                  {feed.status === 'error' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                  ) : feed.status === 'active' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                      <rect x="6" y="4" width="4" height="16"/>
                      <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                </button>
                <button onClick={() => fetchFeed(feed.id, feed.name)}
                  disabled={importing === feed.id}
                  title="Refresh"
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-subtle)',
                    background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all 0.15s'
                  }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {feeds.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: 24 }}>
              No RSS feeds configured. Add feeds above to start pulling content.
            </p>
          )}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h2 className="dash-card-title">Recently Imported</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentItems.map((item) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 9, background: 'var(--bg-inset)', fontSize: '0.82rem'
            }}>
              <span style={{
                fontSize: '0.65rem', padding: '2px 8px', borderRadius: 8,
                background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600, flexShrink: 0
              }}>{item.feed?.name || 'Unknown'}</span>
              <span style={{ flex: 1, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>{formatTimeAgo(item.imported_at)}</span>
            </div>
          ))}
          {recentItems.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', padding: 16 }}>
              No recent imports
            </p>
          )}
        </div>
      </div>
    </>
  );
}
