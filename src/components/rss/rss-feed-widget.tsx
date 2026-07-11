'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface RssItem {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  author?: string | null;
  published_at?: string | null;
  feed: { name: string; category?: { name: string; slug: string } | null } | null;
}

export function RssFeedWidget() {
  const [items, setItems] = useState<RssItem[]>([]);
  const [error, setError] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/rss/feed?limit=5');
      const d = await res.json();
      if (d.items?.length) { setItems(d.items); setError(false); }
      else setError(true);
    } catch { setError(true); }
  }, []);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 60000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  if (error || items.length === 0) return null;

  return (
    <div className="sidebar-section">
      <h3 className="sidebar-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1" />
        </svg>
        From Our Feeds
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="trending-item"
            style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 500, lineHeight: 1.4, color: 'var(--text-primary)' }}>
              {item.title}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              {item.feed?.name}{item.feed?.category ? ` · ${item.feed.category.name}` : ''}
            </div>
          </a>
        ))}
      </div>
      {items.length > 0 && (
        <Link
          href="/explore?tab=feeds"
          style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary)', marginTop: 8, textDecoration: 'none' }}
        >
          View all feeds →
        </Link>
      )}
    </div>
  );
}
