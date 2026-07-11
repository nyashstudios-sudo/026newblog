'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { formatDate, formatNumber } from '@/lib/utils';

interface Article {
  id: string; title: string; subtitle?: string | null; slug: string;
  contentHtml?: string | null; coverImageUrl?: string | null;
  coverImageCaption?: string | null; readingTimeMinutes?: number | null;
  viewCount: bigint | number; likeCount: number;
  tags?: string[];
  publishedAt?: string | null;
  category?: { name: string; slug: string } | null;
  author: { id: string; firstName: string; lastName: string; username: string; avatarUrl?: string | null; bio?: string | null };
}

interface Comment {
  id: string; content: string; createdAt: string;
  user: { id: string; firstName: string; lastName: string; username: string; avatarUrl?: string | null };
  replies?: Comment[];
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [interaction, setInteraction] = useState({ liked: false, saved: false, following: false });
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const loadComments = useCallback(() => {
    if (!article) return;
    fetch(`/api/articles/${article.id}/comments`)
      .then(r => r.json())
      .then(d => setComments(d.comments || []))
      .catch(() => {});
  }, [article]);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.article) {
          setArticle(d.article);
          setInteraction(d.userInteraction || { liked: false, saved: false, following: false });
          setLikeCount(d.article.likeCount);
          setRelated(d.related || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (article) loadComments();
  }, [article, loadComments]);

  useEffect(() => {
    const handleScroll = () => {
      const body = document.querySelector('.article-body');
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const height = rect.height;
      const scrolled = window.scrollY - top + window.innerHeight * 0.3;
      setReadProgress(Math.min(100, Math.max(0, (scrolled / height) * 100)));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const requireAuth = () => {
    if (!currentUser) { router.push('/auth/login'); return false; }
    return true;
  };

  const toggleLike = async () => {
    if (!article || !requireAuth()) return;
    const method = interaction.liked ? 'DELETE' : 'POST';
    const res = await fetch(`/api/articles/${article.id}/like`, { method });
    if (res.ok) {
      setInteraction(i => ({ ...i, liked: !i.liked }));
      setLikeCount(c => interaction.liked ? c - 1 : c + 1);
    }
  };

  const toggleSave = async () => {
    if (!article || !requireAuth()) return;
    const method = interaction.saved ? 'DELETE' : 'POST';
    const res = await fetch(`/api/articles/${article.id}/save`, { method });
    if (res.ok) setInteraction(i => ({ ...i, saved: !i.saved }));
  };

  const toggleFollow = async () => {
    if (!article || !requireAuth()) return;
    const method = interaction.following ? 'DELETE' : 'POST';
    const res = await fetch(`/api/users/${article.author.username}/follow`, { method });
    if (res.ok) setInteraction(i => ({ ...i, following: !i.following }));
  };

  const submitComment = async () => {
    if (!article || !commentText.trim()) return;
    if (!requireAuth()) return;
    setCommenting(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) { setCommentText(''); loadComments(); }
    } finally { setCommenting(false); }
  };

  if (loading) {
    return (
      <div className="article-layout" style={{ paddingTop: 80 }}>
        <div className="article-header">
          <div className="skeleton" style={{ width: '75%', height: 32 }} />
          <div className="skeleton" style={{ width: '40%', height: 20, marginTop: 12 }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: 400, marginTop: 32 }} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-layout" style={{ textAlign: 'center', paddingTop: 96 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Article not found</h1>
        <Link href="/" style={{ color: 'var(--primary)' }}>Back to home</Link>
      </div>
    );
  }

  const authorInitials = `${article.author.firstName[0]}${article.author.lastName[0]}`;

  return (
    <>
      {/* Reading Progress */}
      <div className="article-progress-bar" style={{ width: `${readProgress}%` }} />

      <article className="article-layout">
        {/* Header */}
        <header className="article-header">
          {article.category && <span className="article-category-tag">{article.category.name}</span>}
          <h1 className="article-title">{article.title}</h1>
          {article.subtitle && <p className="article-subtitle">{article.subtitle}</p>}

          <div className="article-meta">
            <Link href={`/profile/${article.author.username}`} className="article-author-row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="article-author-avatar">{authorInitials}</div>
              <div className="article-author-info">
                <span className="article-author-name">{article.author.firstName} {article.author.lastName}</span>
                <span className="article-author-detail">
                  {article.publishedAt && formatDate(article.publishedAt)}
                  {article.readingTimeMinutes && ` · ${article.readingTimeMinutes} min read`}
                </span>
              </div>
            </Link>
            <div className="article-meta-right">
              <span className="article-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                {formatNumber(article.viewCount)} views
              </span>
              <span className="article-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {formatNumber(likeCount)}
              </span>
            </div>
          </div>
        </header>

        {/* Cover */}
        {article.coverImageUrl && (
          <figure className="article-cover">
            <img src={article.coverImageUrl} alt={article.title} />
            {article.coverImageCaption && <figcaption className="article-cover-caption">{article.coverImageCaption}</figcaption>}
          </figure>
        )}

        {/* Body */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.contentHtml || '<p>No content available.</p>' }} />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="article-tags">
            {(Array.isArray(article.tags) ? article.tags : JSON.parse(article.tags || '[]')).map((tag: string) => (
              <span key={tag} className="article-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Author Card */}
        <div className="article-author-card">
          <Link href={`/profile/${article.author.username}`} className="article-author-card-avatar" style={{ textDecoration: 'none' }}>{authorInitials}</Link>
          <div className="article-author-card-info">
            <Link href={`/profile/${article.author.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3 className="article-author-card-name">{article.author.firstName} {article.author.lastName}</h3>
            </Link>
            {article.author.bio && <p className="article-author-card-bio">{article.author.bio}</p>}
            <div className="article-author-card-stats">
              <span><strong>{formatNumber(article.viewCount)}</strong> total views</span>
              <span><strong>1</strong> articles</span>
              <span><strong>0</strong> followers</span>
            </div>
          </div>
          <button className="article-author-card-btn" onClick={toggleFollow}>
            {interaction.following ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Comments */}
        <section className="article-comments">
          <div className="article-comments-header">
            <h2 className="article-comments-title">Discussion</h2>
            <span className="article-comments-count">{comments.length} comments</span>
          </div>

          <div className="article-comment-input">
            <div className="article-comment-input-avatar">Y</div>
            <div className="article-comment-input-body">
              <textarea
                className="article-comment-textarea" placeholder="Share your thoughts on this article..."
                value={commentText} onChange={e => setCommentText(e.target.value)}
              />
              <div className="article-comment-actions">
                <button className="article-comment-submit" onClick={submitComment} disabled={commenting || !commentText.trim()}>
                  {commenting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>

          <div className="article-comment-thread">
            {comments.map(c => (
              <div key={c.id} className="article-comment">
                <div className="article-comment-avatar" style={{ background: `linear-gradient(135deg, oklch(50% 0.14 220), oklch(45% 0.12 200))` }}>
                  {c.user.firstName[0]}{c.user.lastName[0]}
                </div>
                <div className="article-comment-body">
                  <div className="article-comment-meta">
                    <span className="article-comment-name">{c.user.firstName} {c.user.lastName}</span>
                    <span className="article-comment-time">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="article-comment-text">{c.content}</p>
                  <div className="article-comment-actions">
                    <button className="article-comment-action">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                      {Math.floor(Math.random() * 30)}
                    </button>
                    <button className="article-comment-action">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      Reply
                    </button>
                  </div>
                  {c.replies && c.replies.length > 0 && (
                    <div className="article-comment-replies">
                      {c.replies.map(r => (
                        <div key={r.id} className="article-comment">
                          <div className="article-comment-avatar" style={{ background: `linear-gradient(135deg, oklch(50% 0.14 100), oklch(45% 0.12 120))`, width: 28, height: 28, fontSize: '0.55rem' }}>
                            {r.user.firstName[0]}{r.user.lastName[0]}
                          </div>
                          <div className="article-comment-body">
                            <div className="article-comment-meta">
                              <span className="article-comment-name">{r.user.firstName} {r.user.lastName}</span>
                              <span className="article-comment-time">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="article-comment-text">{r.content}</p>
                            <div className="article-comment-actions">
                              <button className="article-comment-action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                                {Math.floor(Math.random() * 10)}
                              </button>
                              <button className="article-comment-action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {comments.length === 0 && <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: 24 }}>No comments yet. Be the first to share your thoughts!</p>}
          </div>
        </section>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="article-related">
            <h2 className="article-related-title">More from 026Newsblog</h2>
            <div className="article-related-grid">
              {related.slice(0, 3).map(r => (
                <Link key={r.id} href={`/article/${r.slug}`} className="article-related-card">
                  {r.coverImageUrl && <img className="article-related-card-img" src={r.coverImageUrl} alt="" />}
                  <div className="article-related-card-body">
                    {r.category && <span className="article-related-card-category">{r.category.name}</span>}
                    <h3 className="article-related-card-title">{r.title}</h3>
                    <span className="article-related-card-meta">{r.author.firstName} {r.author.lastName} · {r.readingTimeMinutes || '?'} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Floating Action Bar */}
      <div className="article-float-bar">
        <button className={`article-float-btn${interaction.liked ? ' active' : ''}`} onClick={toggleLike}>
          <svg viewBox="0 0 24 24" fill={interaction.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="article-float-btn-count">{formatNumber(likeCount)}</span>
        </button>
        <button className="article-float-btn" onClick={() => document.querySelector('.article-comments')?.scrollIntoView({ behavior: 'smooth' })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="article-float-btn-count">{comments.length}</span>
        </button>
        <div className="article-float-divider" />
        <button className={`article-float-btn${interaction.saved ? ' saved' : ''}`} onClick={toggleSave}>
          <svg viewBox="0 0 24 24" fill={interaction.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <button className="article-float-btn" onClick={async () => {
          const url = `${window.location.origin}/article/${article.slug}`;
          if (navigator.share) await navigator.share({ title: article.title, url });
          else await navigator.clipboard.writeText(url);
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </>
  );
}
