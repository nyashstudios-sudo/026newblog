'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { ArticleCard, type ArticleCardData } from '@/components/articles/article-card';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tab, setTab] = useState('articles');
  const [tabArticles, setTabArticles] = useState<ArticleCardData[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [interests, setInterests] = useState<{ name: string; slug: string; icon?: string | null }[]>([]);
  const [following, setFollowing] = useState<{ id: string; firstName: string; lastName: string; username: string; avatarUrl?: string | null }[]>([]);
  const [readingWeek, setReadingWeek] = useState<{ minutes: number; count: number }[]>([]);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then(r => r.json())
      .then(d => {
        setProfile(d.profile);
        setArticles(d.recentArticles || []);
        setIsFollowing(d.isFollowing);
      })
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    if ((profile as { role: string }).role !== 'reader') return;
    const readerTypes = ['saved', 'liked', 'comments', 'history'];
    if (readerTypes.includes(tab)) {
      setTabLoading(true);
      fetch(`/api/users/${username}/activity?type=${tab}`)
        .then(r => r.json())
        .then(d => setTabArticles(d.articles || []))
        .catch(() => setTabArticles([]))
        .finally(() => setTabLoading(false));
    }
  }, [tab, profile, username]);

  useEffect(() => {
    if (!profile) return;
    if ((profile as { role: string }).role !== 'reader') return;
    fetch(`/api/users/${username}/activity`)
      .then(r => r.json())
      .then(d => {
        setInterests(d.interests || []);
        setFollowing(d.following || []);
        setReadingWeek(d.readingWeek || []);
      })
      .catch(() => {});
  }, [profile, username]);

  const requireAuth = () => {
    if (!currentUser) { router.push('/auth/login'); return false; }
    return true;
  };

  const toggleFollow = async () => {
    if (!requireAuth()) return;
    const method = isFollowing ? 'DELETE' : 'POST';
    const res = await fetch(`/api/users/${username}/follow`, { method });
    if (res.ok) setIsFollowing(!isFollowing);
  };

  if (!profile) {
    return <div className="pp-loading"><span className="loading-dots">Loading</span></div>;
  }

  const p = profile as {
    firstName: string; lastName: string; username: string;
    avatarUrl?: string | null; bio?: string | null; role: string;
    _count: { followers: number; following: number; articles: number };
  };

  const initials = `${p.firstName[0]}${p.lastName[0]}`;
  const isOwn = currentUser?.username === username;
  const isAuthor = p.role === 'author';

  const authorTabs = ['articles', 'about'];
  const readerTabs = ['saved', 'liked', 'comments', 'history'];
  const tabs = isAuthor ? authorTabs : readerTabs;

  return (
    <div className="profile-page">
      {isAuthor ? (
        <>
          <header className="author-header">
            <div className="author-avatar">
              {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : initials}
            </div>
            <div className="author-info">
              <h1 className="author-name">{p.firstName} {p.lastName}</h1>
              <p className="author-handle">@{p.username} · Joined March 2025</p>
              {p.bio && <p className="author-bio">{p.bio}</p>}
              <div className="author-stats">
                <div><div className="author-stat-value">—</div><div className="author-stat-label">Total Views</div></div>
                <div><div className="author-stat-value">{p._count.articles}</div><div className="author-stat-label">Articles</div></div>
                <div><div className="author-stat-value">{p._count.followers}</div><div className="author-stat-label">Followers</div></div>
                <div><div className="author-stat-value">—</div><div className="author-stat-label">Likes</div></div>
              </div>
              <div className="author-actions">
                {!isOwn && (
                  <button className="btn btn-primary" onClick={toggleFollow}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                {!isOwn && (
                  <button className="btn btn-ghost" onClick={() => { if (!currentUser) router.push('/auth/login'); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Message
                  </button>
                )}
                {!isOwn && (
                  <button className="btn btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                  </button>
                )}
                {isOwn && (
                  <Link href="/settings" className="btn btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Settings
                  </Link>
                )}
                {isOwn && (
                  <Link href="/settings" className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </header>
          <div className="author-tabs">
            <button className={`author-tab${tab === 'articles' ? ' active' : ''}`} onClick={() => setTab('articles')}>Articles ({p._count.articles})</button>
            <button className={`author-tab${tab === 'about' ? ' active' : ''}`} onClick={() => setTab('about')}>About</button>
          </div>
          <div className="author-content">
            {tab === 'articles' && (
              <main className="articles-list">
                {articles.map((a, i) => (
                  <ArticleCard key={a.id} article={a} index={i} />
                ))}
                {articles.length === 0 && <p className="pp-empty">No articles yet.</p>}
              </main>
            )}
            {tab === 'about' && (
              <main>
                <div className="pp-card">
                  <h2 className="pp-card-title">About</h2>
                  <p className="pp-bio-text">{p.bio || 'No bio yet.'}</p>
                  <div className="monthly-stats">
                    <div className="month-stat"><div className="month-stat-val">{p._count.articles}</div><div className="month-stat-lbl">Articles</div></div>
                    <div className="month-stat"><div className="month-stat-val">{p._count.followers}</div><div className="month-stat-lbl">Followers</div></div>
                  </div>
                </div>
              </main>
            )}
            <aside className="author-sidebar">
              {articles.length > 0 && (
                <div className="sidebar-card">
                  <h3 className="sidebar-card-title">Pinned Article</h3>
                  <div className="featured-article">
                    <div className="featured-label">★ Author's Pick</div>
                    <div className="featured-title">{articles[0].title}</div>
                    <div className="featured-meta">{((articles[0] as any).viewCount || 0)} views</div>
                  </div>
                </div>
              )}
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">Topics</h3>
                <div className="topics-wrap">
                  {['AI & ML', 'Technology', 'Media', 'Startups', 'Innovation'].map(t => (
                    <span key={t} className="topic-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">This Month</h3>
                <div className="monthly-stats">
                  <div className="month-stat"><div className="month-stat-val">—</div><div className="month-stat-lbl">Views</div></div>
                  <div className="month-stat"><div className="month-stat-val">—</div><div className="month-stat-lbl">Likes</div></div>
                  <div className="month-stat"><div className="month-stat-val">{articles.length}</div><div className="month-stat-lbl">Articles</div></div>
                  <div className="month-stat"><div className="month-stat-val">+0</div><div className="month-stat-lbl">Followers</div></div>
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : (
        <>
          <div className="profile-header">
            <div className="profile-top">
              <div className="profile-avatar">
                {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : initials}
              </div>
              <div className="profile-info">
                <h1 className="profile-name">{p.firstName} {p.lastName}</h1>
                <p className="profile-handle">@{p.username} · Member since Jan 2026</p>
                {p.bio && <p className="profile-bio">{p.bio}</p>}
                <div className="profile-meta">
                  <span className="profile-stat"><strong>{p._count.articles}</strong> <span>articles read</span></span>
                  <span className="profile-stat"><strong>0</strong> <span>saved</span></span>
                  <span className="profile-stat"><strong>{p._count.following}</strong> <span>following</span></span>
                  <span className="profile-stat"><strong>0</strong> <span>comments</span></span>
                </div>
              </div>
              <div className="profile-actions">
                {isOwn && (
                  <>
                    <button className="btn btn-ghost">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Settings
                    </button>
                    <Link href="/settings" className="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      Edit Profile
                    </Link>
                  </>
                )}
                {!isOwn && (
                  <button className="btn btn-primary" onClick={toggleFollow}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
            <div className="profile-tabs">
              {tabs.map(t => (
                <button key={t} className={`profile-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'saved' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
                  {t === 'liked' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                  {t === 'comments' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                  {t === 'history' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="profile-content">
            <main>
              {tab === 'saved' && (
                <div className="tab-panel active" id="tab-saved">
                  {tabLoading ? (
                    <p className="pp-empty"><span className="loading-dots">Loading</span></p>
                  ) : (
                    <div className="saved-grid">
                      {tabArticles.map((a) => (
                        <Link key={a.id} href={`/article/${a.slug}`} className="saved-card">
                          {a.coverImageUrl && <img className="saved-card-img" src={a.coverImageUrl} alt="" />}
                          <div className="saved-card-body">
                            <div>
                              {a.category && <span className="saved-card-category">{a.category.name}</span>}
                              <h3 className="saved-card-title">{a.title}</h3>
                            </div>
                            <div className="saved-card-footer">
                              <div>
                                {a.author && <div className="saved-card-author">{a.author.firstName} {a.author.lastName}</div>}
                                <div className="saved-card-date">Saved {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} · {a.readingTimeMinutes || 0} min read</div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {tabArticles.length === 0 && <p className="pp-empty">Your saved articles will appear here.</p>}
                    </div>
                  )}
                </div>
              )}
              {tab === 'liked' && (
                <div className="tab-panel active" id="tab-liked">
                  {tabLoading ? (
                    <p className="pp-empty"><span className="loading-dots">Loading</span></p>
                  ) : (
                    <div className="saved-grid">
                      {tabArticles.map((a) => (
                        <Link key={a.id} href={`/article/${a.slug}`} className="saved-card">
                          {a.coverImageUrl && <img className="saved-card-img" src={a.coverImageUrl} alt="" />}
                          <div className="saved-card-body">
                            <div>
                              {a.category && <span className="saved-card-category">{a.category.name}</span>}
                              <h3 className="saved-card-title">{a.title}</h3>
                            </div>
                            <div className="saved-card-footer">
                              <div>
                                {a.author && <div className="saved-card-author">{a.author.firstName} {a.author.lastName}</div>}
                                <div className="saved-card-date">Liked {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} · {a.readingTimeMinutes || 0} min read</div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {tabArticles.length === 0 && <p className="pp-empty">Articles you have liked will appear here.</p>}
                    </div>
                  )}
                </div>
              )}
              {tab === 'comments' && (
                <div className="tab-panel active" id="tab-comments">
                  {tabLoading ? (
                    <p className="pp-empty"><span className="loading-dots">Loading</span></p>
                  ) : (
                    <div className="saved-grid">
                      {tabArticles.map((a) => (
                        <Link key={a.id} href={`/article/${a.slug}`} className="saved-card">
                          {a.coverImageUrl && <img className="saved-card-img" src={a.coverImageUrl} alt="" />}
                          <div className="saved-card-body">
                            <div>
                              {a.category && <span className="saved-card-category">{a.category.name}</span>}
                              <h3 className="saved-card-title">{a.title}</h3>
                            </div>
                            <div className="saved-card-footer">
                              <div>
                                {a.author && <div className="saved-card-author">{a.author.firstName} {a.author.lastName}</div>}
                                <div className="saved-card-date">You commented · {a.readingTimeMinutes || 0} min read</div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {tabArticles.length === 0 && <p className="pp-empty">Your comments will appear here.</p>}
                    </div>
                  )}
                </div>
              )}
              {tab === 'history' && (
                <div className="tab-panel active" id="tab-history">
                  {tabLoading ? (
                    <p className="pp-empty"><span className="loading-dots">Loading</span></p>
                  ) : (
                    <div className="saved-grid">
                      {tabArticles.map((a) => (
                        <Link key={a.id} href={`/article/${a.slug}`} className="saved-card" style={{ opacity: 0.7 }}>
                          {a.coverImageUrl && <img className="saved-card-img" src={a.coverImageUrl} alt="" />}
                          <div className="saved-card-body">
                            <div>
                              {a.category && <span className="saved-card-category">{a.category.name}</span>}
                              <h3 className="saved-card-title">{a.title}</h3>
                            </div>
                            <div className="saved-card-footer">
                              <div>
                                {a.author && <div className="saved-card-author">{a.author.firstName} {a.author.lastName}</div>}
                                <div className="saved-card-date">Read {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} · {a.readingTimeMinutes || 0} min read</div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {tabArticles.length === 0 && <p className="pp-empty">Your reading history will appear here.</p>}
                    </div>
                  )}
                </div>
              )}
            </main>
            <aside className="profile-sidebar">
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  Notifications
                </h3>
                <div className="notif-list">
                  <div className="notif-item unread">
                    <div className="notif-avatar" style={{ background: 'oklch(50% 0.14 200)' }}>AN</div>
                    <div className="notif-content">
                      <div className="notif-text">New articles from <strong>authors you follow</strong></div>
                      <div className="notif-time">Check back for updates</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Your Interests
                </h3>
                <div className="interests-wrap">
                  {interests.length === 0 ? (
                    <p className="pp-following-empty">No interests set yet.</p>
                  ) : (
                    interests.map(i => (
                      <span key={i.slug} className="interest-tag">{i.name}</span>
                    ))
                  )}
                </div>
              </div>
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Reading This Week
                </h3>
                <div className="reading-chart">
                  {(() => {
                    const max = Math.max(1, ...readingWeek.map(d => d.minutes));
                    return (readingWeek.length ? readingWeek : Array.from({ length: 7 }, () => ({ minutes: 0, count: 0 }))).map((d, i) => (
                      <div key={i} className="reading-bar" style={{ height: `${Math.max(8, (d.minutes / max) * 100)}%`, opacity: d.minutes === 0 ? 0.3 : 1 }} title={`${d.minutes} min`}></div>
                    ));
                  })()}
                </div>
                <div className="reading-labels">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Following
                </h3>
                <div className="following-list">
                  {following.length === 0 ? (
                    <p className="pp-following-empty">Not following anyone yet.</p>
                  ) : (
                    following.map(u => (
                      <Link key={u.id} href={`/profile/${u.username}`} className="following-item">
                        <div className="following-avatar">
                          {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : `${u.firstName[0]}${u.lastName[0]}`}
                        </div>
                        <div className="following-meta">
                          <div className="following-name">{u.firstName} {u.lastName}</div>
                          <div className="following-handle">@{u.username}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}

      <style>{`
        .pp-loading { max-width:1200px; margin:0 auto; padding:96px 24px; text-align:center; color:var(--text-secondary); }
        .pp-empty { text-align:center; color:var(--text-secondary); padding:48px; }
        .pp-card { background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:14px; padding:24px; }
        .pp-card-title { font-size:1.1rem; font-weight:700; font-family:var(--font-serif),Georgia,serif; margin-bottom:12px; }
        .pp-bio-text { font-size:0.9rem; color:var(--text-secondary); line-height:1.7; margin-bottom:20px; }
        .pp-following-empty { font-size:0.78rem; color:var(--text-secondary); text-align:center; padding:12px; }

        .author-header { max-width:1100px; margin:0 auto; padding:56px 24px 40px; display:flex; gap:32px; align-items:flex-start; }
        .author-avatar { width:120px; height:120px; border-radius:28px; background:linear-gradient(135deg,oklch(50% 0.14 220),oklch(42% 0.12 200)); display:flex; align-items:center; justify-content:center; font-size:2.5rem; font-weight:700; color:oklch(98% 0.005 175); flex-shrink:0; overflow:hidden; }
        .author-avatar img { width:100%; height:100%; object-fit:cover; border-radius:28px; }
        .author-info { flex:1; }
        .author-name { font-size:2rem; font-weight:700; letter-spacing:-0.02em; margin-bottom:4px; }
        .author-handle { font-size:0.88rem; color:var(--text-tertiary); margin-bottom:12px; }
        .author-bio { font-size:0.95rem; color:var(--text-secondary); max-width:55ch; line-height:1.6; margin-bottom:20px; }
        .author-stats { display:flex; gap:28px; margin-bottom:20px; }
        .author-stat-value { font-size:1.3rem; font-weight:700; font-feature-settings:'tnum'; }
        .author-stat-label { font-size:0.72rem; color:var(--text-tertiary); }
        .author-actions { display:flex; gap:10px; flex-wrap:wrap; }

        .author-tabs { max-width:1100px; margin:0 auto; padding:0 24px; border-bottom:1px solid var(--border-subtle); display:flex; gap:0; }
        .author-tab { padding:14px 20px; font-size:0.85rem; font-weight:500; color:var(--text-tertiary); cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; background:none; border-top:none; border-left:none; border-right:none; font-family:inherit; }
        .author-tab:hover { color:var(--text-primary); }
        .author-tab.active { color:var(--primary); border-bottom-color:var(--primary); font-weight:600; }

        .author-content { max-width:1100px; margin:0 auto; padding:32px 24px; display:grid; grid-template-columns:1fr 320px; gap:40px; }
        .articles-list { display:flex; flex-direction:column; gap:20px; }
        .author-sidebar { display:flex; flex-direction:column; gap:24px; }

        .topics-wrap { display:flex; flex-wrap:wrap; gap:6px; }
        .topic-tag { padding:5px 12px; background:var(--bg-inset); border-radius:14px; font-size:0.72rem; font-weight:500; color:var(--text-secondary); }

        .monthly-stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .month-stat { padding:12px; background:var(--bg-inset); border-radius:9px; text-align:center; }
        .month-stat-val { font-size:1.1rem; font-weight:700; font-feature-settings:'tnum'; }
        .month-stat-lbl { font-size:0.65rem; color:var(--text-tertiary); }

        .featured-article { padding:16px; background:var(--primary-light); border-radius:10px; cursor:pointer; }
        .featured-label { font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--primary); margin-bottom:6px; }
        .featured-title { font-family:var(--font-serif),Georgia,serif; font-size:0.92rem; font-weight:600; line-height:1.35; }
        .featured-meta { font-size:0.68rem; color:var(--text-tertiary); margin-top:6px; }

        .profile-header { max-width:1200px; margin:0 auto; padding:48px 24px 0; }
        .profile-top { display:flex; align-items:flex-start; gap:28px; margin-bottom:32px; }
        .profile-avatar { width:96px; height:96px; border-radius:24px; background:linear-gradient(135deg,oklch(50% 0.15 175),oklch(45% 0.12 220)); display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:700; color:oklch(98% 0.005 175); flex-shrink:0; overflow:hidden; }
        .profile-avatar img { width:100%; height:100%; object-fit:cover; border-radius:24px; }
        .profile-info { flex:1; }
        .profile-name { font-size:1.6rem; font-weight:700; letter-spacing:-0.02em; margin-bottom:4px; }
        .profile-handle { font-size:0.88rem; color:var(--text-tertiary); margin-bottom:10px; }
        .profile-bio { font-size:0.9rem; color:var(--text-secondary); max-width:55ch; line-height:1.55; margin-bottom:16px; }
        .profile-meta { display:flex; gap:20px; align-items:center; }
        .profile-stat { font-size:0.82rem; }
        .profile-stat strong { font-weight:700; font-feature-settings:'tnum'; }
        .profile-stat span { color:var(--text-tertiary); }
        .profile-actions { display:flex; gap:8px; flex-shrink:0; padding-top:8px; }

        .profile-tabs { display:flex; gap:0; border-bottom:1px solid var(--border-subtle); }
        .profile-tab { padding:14px 20px; font-size:0.85rem; font-weight:500; color:var(--text-tertiary); cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; display:flex; align-items:center; gap:6px; background:none; border-top:none; border-left:none; border-right:none; font-family:inherit; }
        .profile-tab:hover { color:var(--text-primary); }
        .profile-tab.active { color:var(--primary); border-bottom-color:var(--primary); font-weight:600; }

        .profile-content { max-width:1200px; margin:0 auto; padding:32px 24px; display:grid; grid-template-columns:1fr 340px; gap:40px; }
        .tab-panel { display:none; }
        .tab-panel.active { display:block; }

        .saved-grid { display:flex; flex-direction:column; gap:20px; }
        .saved-card { display:grid; grid-template-columns:140px 1fr; gap:18px; padding:16px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:14px; transition:all 0.25s var(--ease-out-expo); cursor:pointer; text-decoration:none; color:inherit; }
        .saved-card:hover { border-color:var(--border); transform:translateY(-2px); box-shadow:0 4px 16px oklch(0% 0 0 / 0.05); }
        .saved-card-img { width:100%; height:100%; min-height:100px; border-radius:9px; object-fit:cover; }
        .saved-card-body { display:flex; flex-direction:column; justify-content:space-between; }
        .saved-card-category { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--primary); }
        .saved-card-title { font-family:var(--font-serif),Georgia,serif; font-size:1.05rem; font-weight:600; line-height:1.35; margin:6px 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .saved-card-footer { display:flex; align-items:center; justify-content:space-between; }
        .saved-card-author { font-size:0.75rem; color:var(--text-secondary); }
        .saved-card-date { font-size:0.72rem; color:var(--text-tertiary); }

        .comment-list { display:flex; flex-direction:column; gap:16px; }
        .profile-sidebar { display:flex; flex-direction:column; gap:24px; }

        .notif-list { display:flex; flex-direction:column; gap:10px; }
        .notif-item { display:flex; gap:10px; padding:10px; border-radius:9px; background:var(--bg-inset); transition:background 0.15s; cursor:pointer; }
        .notif-item:hover { background:var(--primary-light); }
        .notif-item.unread { position:relative; }
        .notif-item.unread::before { content:''; position:absolute; left:4px; top:50%; transform:translateY(-50%); width:5px; height:5px; background:var(--primary); border-radius:50%; }
        .notif-avatar { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:700; color:oklch(98% 0.005 175); flex-shrink:0; }
        .notif-content { flex:1; }
        .notif-text { font-size:0.78rem; line-height:1.4; color:var(--text-secondary); }
        .notif-text strong { color:var(--text-primary); font-weight:600; }
        .notif-time { font-size:0.65rem; color:var(--text-tertiary); margin-top:2px; }

        .interests-wrap { display:flex; flex-wrap:wrap; gap:6px; }
        .interest-tag { padding:5px 12px; background:var(--bg-inset); border-radius:16px; font-size:0.75rem; font-weight:500; color:var(--text-secondary); cursor:pointer; transition:all 0.15s; }
        .interest-tag:hover { background:var(--primary-light); color:var(--primary); }

        .reading-chart { display:flex; align-items:flex-end; gap:4px; height:60px; padding:8px 0; }
        .reading-bar { flex:1; border-radius:3px; background:var(--primary-light); min-height:4px; transition:background 0.15s; }
        .reading-bar:hover { background:var(--primary); }
        .reading-labels { display:flex; justify-content:space-between; font-size:0.6rem; color:var(--text-tertiary); margin-top:6px; }

        .following-list { display:flex; flex-direction:column; gap:10px; }
        .following-item { display:flex; align-items:center; gap:10px; padding:8px; border-radius:9px; background:var(--bg-inset); text-decoration:none; color:inherit; transition:background 0.15s; }
        .following-item:hover { background:var(--primary-light); }
        .following-avatar { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,oklch(50% 0.15 175),oklch(45% 0.12 220)); display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:700; color:oklch(98% 0.005 175); flex-shrink:0; overflow:hidden; }
        .following-avatar img { width:100%; height:100%; object-fit:cover; }
        .following-meta { flex:1; min-width:0; }
        .following-name { font-size:0.78rem; font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .following-handle { font-size:0.68rem; color:var(--text-tertiary); }

        @media (max-width:1024px) {
          .author-content, .profile-content { grid-template-columns:1fr; }
          .profile-sidebar { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        }
        @media (max-width:900px) {
          .author-content { grid-template-columns:1fr; }
          .author-header { flex-direction:column; align-items:center; text-align:center; }
          .author-bio { max-width:none; }
          .author-stats { justify-content:center; }
          .author-actions { justify-content:center; }
        }
        @media (max-width:768px) {
          .profile-top { flex-direction:column; align-items:center; text-align:center; }
          .profile-meta { justify-content:center; }
          .profile-actions { justify-content:center; }
          .profile-bio { max-width:none; }
          .profile-sidebar { grid-template-columns:1fr; }
          .saved-card { grid-template-columns:1fr; }
          .saved-card-img { height:160px; }
          .profile-tabs { overflow-x:auto; }
        }
      `}</style>
    </div>
  );
}
