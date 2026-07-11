'use client';

import { useEffect, useState, useRef } from 'react';
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
}

interface DailyView {
  date: string;
  count: number;
}

export default function AuthorDashboardPage() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [totals, setTotals] = useState({ views: 0, likes: 0, comments: 0 });
  const [loadError, setLoadError] = useState('');
  const [period, setPeriod] = useState('30D');
  const [articleFilter, setArticleFilter] = useState('All');
  const [pageLoading, setPageLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !['author', 'admin'].includes(user.role)) return;

    Promise.all([
      fetch('/api/author/analytics').then(r => r.json()).catch(() => null),
      fetch('/api/articles?author=' + user.username + '&limit=50&own=true').then(r => r.json()).catch(() => null),
    ]).then(([analytics, arts]) => {
      if (analytics) {
        setTotals(analytics.totals || { views: 0, likes: 0, comments: 0, shares: 0 });
        setDailyViews(analytics.dailyViews || []);
      }
      if (arts) {
        setArticles((arts.articles || []).filter((a: Article) => ['published', 'draft', 'unpublished'].includes(a.status)));
      }
    }).catch(() => setLoadError('Failed to load data'))
      .finally(() => setPageLoading(false));
  }, [user]);

  const setFilterAndArticle = (filter: string) => {
    setArticleFilter(filter);
  };

  const filteredArticles = articles.filter((a) => {
    if (articleFilter === 'All') return true;
    if (articleFilter === 'Published') return a.status === 'published';
    if (articleFilter === 'Drafts') return a.status === 'draft';
    if (articleFilter === 'In Review') return a.status === 'unpublished';
    return true;
  });

  const totalViews = articles.reduce((s, a) => s + Number(a.viewCount || 0), 0);
  const totalLikes = articles.reduce((s, a) => s + (a.likeCount || 0), 0);

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
        { onClick: () => setFilterAndArticle('Published'), label: 'Published', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8', badge: articles.filter(a => a.status === 'published').length },
        { onClick: () => setFilterAndArticle('Drafts'), label: 'Drafts', icon: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7', badge: articles.filter(a => a.status === 'draft').length },
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Author Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          {user ? 'You need author access to view this page.' : 'Sign in to access your dashboard.'}
        </p>
        {user ? <Link href="/author/apply"><button className="btn btn-primary">Apply to become an author</button></Link> : <Link href="/auth/login"><button className="btn btn-primary">Sign in</button></Link>}
      </div>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  const statCards = [
    { label: 'Total Views', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(), icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
    { label: 'Total Likes', value: totalLikes >= 1000 ? `${(totalLikes / 1000).toFixed(1)}K` : totalLikes.toString(), icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
    { label: 'Comments', value: totals.comments >= 1000 ? `${(totals.comments / 1000).toFixed(1)}K` : totals.comments.toString(), icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { label: 'Articles', value: articles.length.toString(), icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8' },
  ];

  const maxView = Math.max(...dailyViews.map(d => d.count), 1);

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
                const active = 'href' in item ? pathname === item.href : articleFilter === item.label;
                const classes = `dash-sidebar-link${active ? ' active' : ''}`;
                const inner = (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                    {item.badge !== undefined && <span className="dash-sidebar-badge">{item.badge}</span>}
                  </>
                );
                if ('onClick' in item) {
                  return <button key={item.label} onClick={item.onClick} className={classes} style={{ width: '100%', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', border: 'none', background: 'none' }}>{inner}</button>;
                }
                return <Link key={item.label} href={(item as { href: string }).href} className={classes}>{inner}</Link>;
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
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Welcome back, {user.firstName}. Here&apos;s how your content is performing.</p>
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

        <div className="dash-stats">
          {statCards.map(s => (
            <div key={s.label} className="dash-stat-card">
              <div className="dash-stat-stat">
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-value">{s.value}</div>
              </div>
              <div className="dash-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-content-grid">
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Views (30 days)</h3>
              <div className="chart-period">
                {['7D', '30D', '90D', '1Y'].map(p => (
                  <button key={p} className={`chart-period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div ref={chartRef} className="dash-card-content" style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 3, paddingTop: 8 }}>
              {dailyViews.slice(dailyViews.length - 30).map((d, i) => (
                <div key={d.date} style={{
                  flex: 1, borderRadius: '3px 3px 0 0',
                  background: `oklch(45% 0.12 175 / ${0.3 + (d.count / maxView) * 0.7})`,
                  height: `${(d.count / maxView) * 100}%`,
                  minHeight: d.count > 0 ? 4 : 0,
                  transition: 'height 0.3s, background 0.3s',
                  position: 'relative',
                }}
                  title={`${d.date}: ${d.count} views`}
                />
              ))}
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, marginBottom: 16 }}>
              <h3 className="dash-card-title" style={{ marginBottom: 0 }}>Quick Overview</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Published', value: articles.filter(a => a.status === 'published').length, color: 'var(--success)' },
                { label: 'Drafts', value: articles.filter(a => a.status === 'draft').length, color: 'var(--warning)' },
                { label: 'Total Views', value: totalViews.toLocaleString(), color: 'var(--primary)' },
                { label: 'Total Likes', value: totalLikes.toLocaleString(), color: 'var(--error)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-base)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card" style={{ marginTop: 24 }}>
          <div className="dash-card-header">
            <h3 className="dash-card-title">Your Articles</h3>
            <div className="articles-filter">
              {['All', 'Published', 'Drafts', 'In Review'].map(f => (
                <button key={f} className={`articles-filter-btn${articleFilter === f ? ' active' : ''}`} onClick={() => setArticleFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          {filteredArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {articleFilter === 'All' ? 'No articles yet. Write your first article!' : `No ${articleFilter.toLowerCase()} articles.`}
            </div>
          ) : (
            <div className="articles-table-wrapper">
              <table className="articles-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((a) => {
                    const statusClass = a.status === 'published' ? 'status-published' : a.status === 'draft' ? 'status-draft' : 'status-review';
                    const statusLabel = a.status.charAt(0).toUpperCase() + a.status.slice(1);
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
                        <td>
                          <div className="article-actions">
                            <Link href={`/article/${a.slug}`} className="article-action-btn" title="View">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {dailyViews.length > 0 && (
          <div className="dash-card" style={{ marginTop: 24 }}>
            <div className="dash-card-header">
              <h3 className="dash-card-title">Daily Views</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {dailyViews.slice().reverse().slice(0, 14).reverse().map(d => (
                <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-tertiary)', width: 50, flexShrink: 0 }}>
                    {new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-inset)', overflow: 'hidden' }}>
                    <div style={{ width: `${(d.count / maxView) * 100}%`, height: '100%', borderRadius: 3, background: 'var(--primary)', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ color: 'var(--text-secondary)', width: 40, textAlign: 'right', fontWeight: 600 }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
