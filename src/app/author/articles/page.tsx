'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string | null;
  updatedAt?: string;
}

export default function AuthorArticlesPage() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleFilter, setArticleFilter] = useState('All');
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user || !['author', 'admin'].includes(user.role)) return;
    fetch('/api/articles?author=' + user.username + '&limit=50&own=true')
      .then(r => r.json())
      .then((arts) => {
        setArticles((arts.articles || []).filter((a: Article) => ['published', 'draft', 'unpublished'].includes(a.status)));
      })
      .catch(() => setLoadError('Failed to load articles'))
      .finally(() => setPageLoading(false));
  }, [user]);

  const sidebarSections = [
    {
      label: 'Overview',
      items: [
        { href: '/author/dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
        { href: '/author/analytics', label: 'Analytics', icon: 'M18 20V10 M12 20V4 M6 20v-6' },
      ],
    },
    {
      label: 'Content',
      items: [
        { href: '/author/editor', label: 'Write Article', icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
        { href: '/author/articles', label: 'My Articles', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8' },
      ],
    },
    {
      label: 'Monetization',
      items: [
        { href: '/author/withdraw', label: 'Earnings', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
        { href: '/author/withdraw', label: 'Payouts', icon: 'M1 4h22v16H1z M1 10h22' },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/settings', label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
      ],
    },
  ];

  if (loading || pageLoading) return null;

  if (!user || !['author', 'admin'].includes(user.role)) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>My Articles</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          {user ? 'You need author access to view this page.' : 'Sign in to access your articles.'}
        </p>
        {user ? <Link href="/author/apply"><button className="btn btn-primary">Apply to become an author</button></Link> : <Link href="/auth/login"><button className="btn btn-primary">Sign in</button></Link>}
      </div>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  const filteredArticles = articles.filter((a) => {
    if (articleFilter === 'All') return true;
    if (articleFilter === 'Published') return a.status === 'published';
    if (articleFilter === 'Drafts') return a.status === 'draft';
    if (articleFilter === 'In Review') return a.status === 'unpublished';
    return true;
  });

  const deleteArticle = (id: string) => {
    if (!confirm('Delete this article?')) return;
    fetch('/api/articles/' + id, { method: 'DELETE' })
      .then(() => setArticles(prev => prev.filter(a => a.id !== id)))
      .catch(() => setLoadError('Failed to delete article'));
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-logo"><span>026</span>Newsblog</Link>
        <div className="dash-sidebar-role">Author</div>
        {sidebarSections.map(section => (
          <div key={section.label} className="dash-sidebar-section">
            <div className="dash-sidebar-label">{section.label}</div>
            <nav className="dash-sidebar-nav">
              {section.items.map(item => {
                const active = pathname === item.href;
                return (
                  <Link key={item.label} href={item.href} className={`dash-sidebar-link${active ? ' active' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
        <div className="dash-sidebar-footer">
          <Link href={`/profile/${user.username}`} className="dash-sidebar-profile" style={{ textDecoration: 'none' }}>
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className="dash-sidebar-profile-info">
              <div className="dash-sidebar-profile-name">{user.firstName} {user.lastName}</div>
              <div className="dash-sidebar-profile-role">Author</div>
            </div>
          </Link>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">My Articles</h1>
            <p className="dash-subtitle">Manage everything you&apos;ve published and drafted.</p>
          </div>
          <div className="header-actions">
            <Link href="/author/editor" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              New Article
            </Link>
          </div>
        </div>

        {loadError && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--error-light)', color: 'var(--error)', fontSize: '0.85rem', marginBottom: 24 }}>
            {loadError}
          </div>
        )}

        <div className="articles-filter" style={{ marginBottom: 24 }}>
          {['All', 'Published', 'Drafts', 'In Review'].map(f => (
            <button key={f} className={`articles-filter-btn${articleFilter === f ? ' active' : ''}`} onClick={() => setArticleFilter(f)}>{f}</button>
          ))}
        </div>

        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            No articles yet. Write your first article!
          </div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((a) => {
                const statusClass = a.status === 'published' ? 'status-published' : a.status === 'draft' ? 'status-draft' : 'status-review';
                const statusLabel = a.status.charAt(0).toUpperCase() + a.status.slice(1);
                const dateStr = (a.publishedAt || a.updatedAt) ? new Date(a.publishedAt || a.updatedAt || '').toLocaleDateString() : '—';
                return (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/article/${a.slug}`} className="article-title-cell" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span className="article-title-text">{a.title}</span>
                      </Link>
                    </td>
                    <td><span className={`status-badge ${statusClass}`}>{statusLabel}</span></td>
                    <td className="article-stats-cell">{Number(a.viewCount) >= 1000 ? `${(Number(a.viewCount) / 1000).toFixed(1)}K` : a.viewCount.toString()}</td>
                    <td className="article-stats-cell">{a.likeCount}</td>
                    <td className="article-stats-cell">{a.commentCount}</td>
                    <td className="article-stats-cell">{dateStr}</td>
                    <td>
                      <div className="article-actions">
                        <Link href={`/author/editor?id=${a.id}`} className="article-action-btn" title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </Link>
                        <Link href={`/article/${a.slug}`} className="article-action-btn" title="View">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </Link>
                        <button onClick={() => deleteArticle(a.id)} className="article-action-btn" title="Delete" style={{ color: 'var(--error)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
