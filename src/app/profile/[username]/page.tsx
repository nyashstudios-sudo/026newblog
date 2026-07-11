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
    return <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}><span className="loading-dots">Loading</span></div>;
  }

  const p = profile as {
    firstName: string; lastName: string; username: string;
    avatarUrl?: string | null; bio?: string | null; role: string;
    _count: { followers: number; following: number; articles: number };
  };

  const initials = `${p.firstName[0]}${p.lastName[0]}`;
  const isOwn = currentUser?.username === username;
  const isAuthor = p.role === 'author';

  const authorTabs = ['articles', 'about', 'followers'];
  const readerTabs = ['saved', 'liked', 'comments', 'history'];
  const tabs = isAuthor ? authorTabs : readerTabs;

  return (
    <div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, marginBottom: 32 }}>
          <div style={{
            width: isAuthor ? 120 : 96, height: isAuthor ? 120 : 96, borderRadius: isAuthor ? 28 : 24,
            background: 'linear-gradient(135deg, oklch(50% 0.15 175), oklch(45% 0.12 220))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isAuthor ? '2.5rem' : '2rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0,
          }}>
            {p.avatarUrl ? <img src={p.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: isAuthor ? 28 : 24, objectFit: 'cover' }} /> : initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: isAuthor ? '2rem' : '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {p.firstName} {p.lastName}
              </h1>
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700,
                background: isAuthor ? 'var(--primary-light)' : 'var(--bg-inset)',
                color: isAuthor ? 'var(--primary)' : 'var(--text-tertiary)',
                border: `1px solid ${isAuthor ? 'var(--primary)' : 'var(--border)'}`,
              }}>
                {isAuthor ? 'Author' : 'Reader'}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: 10 }}>
              @{p.username} · Joined 2025
            </p>
            {p.bio && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '55ch', lineHeight: 1.55, marginBottom: 16 }}>{p.bio}</p>}
            <div style={{ display: 'flex', gap: 28, marginBottom: 20 }}>
              {isAuthor ? (
                <>
                  <div><div style={{ fontSize: '1.1rem', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{p._count.articles}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Articles</div></div>
                  <div><div style={{ fontSize: '1.1rem', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{p._count.followers}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Followers</div></div>
                  <div><div style={{ fontSize: '1.1rem', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{p._count.following}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Following</div></div>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '0.82rem' }}><strong style={{ fontWeight: 700 }}>{p._count.articles}</strong> <span style={{ color: 'var(--text-tertiary)' }}>articles read</span></span>
                  <span style={{ fontSize: '0.82rem' }}><strong style={{ fontWeight: 700 }}>{p._count.followers}</strong> <span style={{ color: 'var(--text-tertiary)' }}>followers</span></span>
                  <span style={{ fontSize: '0.82rem' }}><strong style={{ fontWeight: 700 }}>{p._count.following}</strong> <span style={{ color: 'var(--text-tertiary)' }}>following</span></span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isOwn && (
                <button onClick={toggleFollow} style={{
                  padding: '9px 20px', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: isFollowing ? 'transparent' : 'var(--primary)',
                  color: isFollowing ? 'var(--text-secondary)' : 'oklch(98% 0.005 175)',
                  border: isFollowing ? '1px solid var(--border)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              {!isOwn && (
                <button onClick={() => { if (!currentUser) router.push('/auth/login'); }} style={{
                  padding: '9px 18px', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'transparent', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)', transition: 'all 0.2s',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Message
                </button>
              )}
              {isOwn && (
                <Link href="/settings" style={{
                  padding: '9px 18px', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'transparent', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)', transition: 'all 0.2s',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '14px 20px', fontSize: '0.85rem', fontWeight: tab === t ? 600 : 500,
              color: tab === t ? 'var(--primary)' : 'var(--text-tertiary)',
              cursor: 'pointer', borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`,
              transition: 'all 0.2s', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t === 'articles' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              {t === 'about' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
              {t === 'followers' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              {t === 'saved' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
              {t === 'liked' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
              {t === 'comments' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              {t === 'history' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'articles' && <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: tab === t ? 'var(--primary-light)' : 'var(--bg-inset)', color: tab === t ? 'var(--primary)' : 'var(--text-tertiary)' }}>{p._count.articles}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>
        <main>
          {tab === 'articles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {articles.map((a, i) => (
                <ArticleCard key={a.id} article={a} index={i} />
              ))}
              {articles.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>No articles yet.</p>
              )}
            </div>
          )}
          {tab === 'about' && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 24 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Newsreader', Georgia, serif", marginBottom: 12 }}>About</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>{p.bio || 'No bio yet.'}</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg-inset)', borderRadius: 9, textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{p._count.articles}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Articles</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-inset)', borderRadius: 9, textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{p._count.followers}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Followers</div>
                </div>
              </div>
            </div>
          )}
          {tab === 'followers' && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 24 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Followers</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>Follower list coming soon.</p>
            </div>
          )}
          {['saved', 'liked', 'comments', 'history'].includes(tab) && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 24 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, textTransform: 'capitalize' }}>{tab}</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>{tab === 'saved' ? 'Your saved articles will appear here.' : tab === 'liked' ? 'Articles you have liked will appear here.' : tab === 'comments' ? 'Your comments will appear here.' : 'Your reading history will appear here.'}</p>
            </div>
          )}
        </main>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isAuthor ? (
            <>
              {articles.length > 0 && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14 }}>Latest Article</h3>
                  <div style={{ padding: 16, background: 'var(--primary-light)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', marginBottom: 6 }}>Most Recent</div>
                    <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35 }}>{(articles[0] as any)?.title || 'No title'}</div>
                  </div>
                </div>
              )}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Stats
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Followers</span>
                    <span style={{ fontWeight: 600 }}>{p._count.followers}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Following</span>
                    <span style={{ fontWeight: 600 }}>{p._count.following}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Articles</span>
                    <span style={{ fontWeight: 600 }}>{p._count.articles}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10, padding: 8, borderRadius: 9, background: 'var(--bg-inset)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0 }}>AN</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>New articles from authors you follow</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Check back for updates</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Interests
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Technology', 'AI & ML', 'Startups', 'Culture', 'Science', 'Innovation'].map(interest => (
                    <span key={interest} style={{ padding: '5px 12px', background: 'var(--bg-inset)', borderRadius: 16, fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{interest}</span>
                  ))}
                </div>
              </div>
            </>
          )}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              About
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.bio || 'No bio yet.'}</p>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          [class] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          [class] { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          p { max-width: none !important; }
        }
      `}</style>
    </div>
  );
}
