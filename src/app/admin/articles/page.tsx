'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  author?: { firstName: string; lastName: string } | null;
  category?: { name: string } | null;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const params = filter === 'all' ? '' : `?status=${filter}`;
    fetch(`/api/articles${params}`)
      .then(r => r.json())
      .then(d => {
        const items = d.articles || [];
        setArticles(items.sort((a: Article, b: Article) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  if (loading) return (
    <div className="loading-indicator">
      <div className="loading-dots"><span /><span /><span /></div>
      <span>Loading articles...</span>
    </div>
  );

  const filtered = articles;
  const statusCounts = {
    all: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    draft: articles.filter(a => a.status === 'draft').length,
    unpublished: articles.filter(a => a.status === 'unpublished').length,
  };

  const filterBtns = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'published', label: 'Published', count: statusCounts.published },
    { key: 'draft', label: 'Drafts', count: statusCounts.draft },
    { key: 'unpublished', label: 'In Review', count: statusCounts.unpublished },
  ];

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">All Articles</h1>
          <p className="dash-subtitle">Browse, filter, and manage all platform content</p>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          {filterBtns.map(btn => (
            <button key={btn.key} onClick={() => setFilter(btn.key)}
              style={{
                padding: '6px 14px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600, border: 'none',
                background: filter === btn.key ? 'var(--primary)' : 'transparent',
                color: filter === btn.key ? 'oklch(98% 0.005 175)' : 'var(--text-tertiary)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
              {btn.label} <span style={{ opacity: 0.7 }}>({btn.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dash-card" style={{ overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 32 }}>No articles found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Title</th>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Author</th>
                <th style={{ textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Status</th>
                <th style={{ textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Views</th>
                <th style={{ textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Likes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-base)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}>
                  <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <Link href={`/article/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500, display: 'block', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = ''; }}>
                      {a.title}
                    </Link>
                  </td>
                  <td style={{ padding: 12, fontSize: '0.78rem', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {a.author ? `${a.author.firstName} ${a.author.lastName}` : '—'}
                  </td>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{
                      padding: '2px 9px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 600,
                      background: a.status === 'published' ? 'var(--success-light)' : a.status === 'draft' ? 'var(--warning-light)' : 'var(--error-light)',
                      color: a.status === 'published' ? 'var(--success)' : a.status === 'draft' ? 'var(--warning)' : 'var(--error)',
                    }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)', fontFeatureSettings: '"tnum"', textAlign: 'right' }}>
                    {a.viewCount >= 1000 ? `${(a.viewCount / 1000).toFixed(1)}K` : a.viewCount}
                  </td>
                  <td style={{ padding: 12, fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)', fontFeatureSettings: '"tnum"', textAlign: 'right' }}>{a.likeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
