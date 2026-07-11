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

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;

  const viewsChange = (() => {
    if (dailyViews.length < 14) return null;
    const recent = dailyViews.slice(-7).reduce((s, d) => s + d.count, 0);
    const prev = dailyViews.slice(-14, -7).reduce((s, d) => s + d.count, 0);
    if (prev === 0) return null;
    return ((recent - prev) / prev * 100).toFixed(1);
  })();

  const maxView = Math.max(...dailyViews.map(d => d.count), 1);

  const mockActivity = [
    { type: 'like' as const, text: <><strong>Sarah M.</strong> and 14 others liked your article &ldquo;How Nairobi Became Africa&apos;s Silicon Savannah&rdquo;</>, time: '2 hours ago' },
    { type: 'comment' as const, text: <><strong>James K.</strong> commented: &ldquo;Great analysis on the startup ecosystem.&rdquo;</>, time: '4 hours ago' },
    { type: 'earn' as const, text: <>You earned <strong>$12.40</strong> from &ldquo;M-Pesa&apos;s Next Chapter&rdquo; reaching 5,000 views milestone</>, time: '6 hours ago' },
    { type: 'share' as const, text: <>Your article &ldquo;Digital Democracy in Africa&rdquo; was shared 23 times on social media</>, time: 'Yesterday' },
    { type: 'like' as const, text: <>Your article &ldquo;Marathon Dominance&rdquo; is trending in the Sports category</>, time: 'Yesterday' },
  ];

  const statCards = [
    { label: 'Total Views', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(), change: viewsChange ? `${viewsChange.startsWith('-') ? '' : '+'}${viewsChange}%` : null, up: viewsChange ? !viewsChange.startsWith('-') : true },
    { label: 'Total Earnings', value: '$0.00', change: null, up: true },
    { label: 'Articles Published', value: publishedCount.toString(), change: null, up: true },
    { label: 'Total Followers', value: totals.comments >= 1000 ? `${(totals.comments / 1000).toFixed(1)}K` : totals.comments.toString(), change: null, up: true },
  ];

  const statusIconPath: Record<string, string> = {
    like: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    comment: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    share: 'M18 5a3 3 0 0 0-3 3c0 .2 0 .4.1.6l-7.2 4.3a3 3 0 0 0-1.9-.7 3 3 0 1 0 3 3c0-.2 0-.4-.1-.6l7.2-4.3a3 3 0 0 0 1.9.7 3 3 0 1 0 0-6z',
    earn: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
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

        <div className="author-stats-grid">
          {statCards.map(s => (
            <div key={s.label} className="author-stat-card">
              <div className="author-stat-label">{s.label}</div>
              <div className="author-stat-value">{s.value}</div>
              {s.change && (
                <span className={`author-stat-change ${s.up ? 'up' : 'down'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points={s.up ? '23 6 13.5 15.5 8.5 10.5 1 18' : '23 18 13.5 8.5 8.5 13.5 1 6'} /></svg>
                  {s.change}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="author-content-grid">
          <div className="author-chart-container">
            <div className="author-chart-header">
              <h3 className="author-chart-title">Views & Engagement</h3>
              <div className="author-chart-period">
                {['7D', '30D', '90D', '1Y'].map(p => (
                  <button key={p} className={`author-chart-period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div ref={chartRef} className="author-chart-area">
              {dailyViews.slice(dailyViews.length - 30).map((d) => (
                <div key={d.date} style={{
                  flex: 1, borderRadius: '3px 3px 0 0',
                  background: `oklch(45% 0.12 175 / ${0.3 + (d.count / maxView) * 0.7})`,
                  height: `${(d.count / maxView) * 100}%`,
                  minHeight: d.count > 0 ? 4 : 0,
                  transition: 'height 0.3s, background 0.3s',
                }}
                  title={`${d.date}: ${d.count} views`}
                />
              ))}
            </div>
          </div>

          <div className="author-earnings-panel">
            <div className="author-earnings-header">
              <h3 className="author-earnings-title">Earnings</h3>
              <p className="author-earnings-subtitle">Revenue split: 70/30 (you/platform)</p>
            </div>
            <div className="author-earnings-balance">
              <div className="author-earnings-amount">$0.00</div>
              <div className="author-earnings-currency">Available balance (KES 0)</div>
            </div>
            <div className="author-earnings-breakdown">
              {[
                { label: 'This month', value: '$0.00' },
                { label: 'Last month', value: '$0.00' },
                { label: 'Pending', value: '$0.00' },
                { label: 'Lifetime earnings', value: '$0.00' },
              ].map(r => (
                <div key={r.label} className="author-earnings-row">
                  <span className="author-earnings-row-label">{r.label}</span>
                  <span className="author-earnings-row-value">{r.value}</span>
                </div>
              ))}
            </div>
            <button className="author-withdraw-btn">Withdraw via M-Pesa</button>
            <p className="author-withdraw-info">Minimum withdrawal: $50 &middot; Processes within 24 hours</p>
          </div>
        </div>

        <div className="author-articles-section">
          <div className="author-articles-header">
            <h3 className="author-articles-title">Your Articles</h3>
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
            <table className="articles-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Earnings</th>
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
                      <td className="article-stats-cell">--</td>
                      <td>
                        <div className="article-actions">
                          <Link href={`/article/${a.slug}`} className="article-action-btn" title="View">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          </Link>
                          <button className="article-action-btn" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="author-activity-section">
          <div className="author-articles-header">
            <h3 className="author-articles-title">Recent Activity</h3>
          </div>
          <div className="activity-list">
            {mockActivity.map((a, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-icon ${a.type}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={statusIconPath[a.type]} /></svg>
                </div>
                <div className="activity-content">
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
