'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ArticleCardData } from '@/components/articles/article-card';

interface TrendingItem { title: string; slug: string; likeCount?: number; categoryName?: string; }
interface CategoryItem { name: string; slug: string; }

const HeroSlideshow = dynamic(() => import('@/components/articles/hero-slideshow').then(m => ({ default: m.HeroSlideshow })), { ssr: false });
const ArticleCard = dynamic(() => import('@/components/articles/article-card').then(m => ({ default: m.ArticleCard })), { ssr: false });
const RssFeedWidget = dynamic(() => import('@/components/rss/rss-feed-widget').then(m => ({ default: m.RssFeedWidget })), { ssr: false });

function TrendingIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function GridIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function MailIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }

export default function HomeClient() {
  const [tab, setTab] = useState('recent');
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadArticles = async (pageNum: number, tabName: string, reset = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/feed?page=${pageNum}&tab=${tabName}&limit=12`);
      const data = await res.json();
      setArticles((prev) => reset ? (data.articles || []) : [...prev, ...(data.articles || [])]);
      setHasMore(data.hasMore);
    } catch { setHasMore(false); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); setArticles([]); loadArticles(1, tab, true); }, [tab]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
    fetch('/api/articles/feed?page=1&tab=popular&limit=5').then(r => r.json()).then(d => {
      setTrending((d.articles || []).map((a: ArticleCardData) => ({
        title: a.title, slug: a.slug, likeCount: a.likeCount, categoryName: a.category?.name,
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => { if (!hasMore || loading || page === 1) return; loadArticles(page, tab); }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400) setPage(p => p + 1);
      const btn = document.getElementById('scrollTopBtn');
      if (btn) btn.classList.toggle('visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div>
      <HeroSlideshow />

      <div className="main-layout">
        <main>
          <div className="feed-header">
            <h2 className="feed-title">Latest Stories</h2>
            <div className="feed-tabs">
              {['foryou', 'recent', 'popular'].map(t => (
                <button key={t} className={`feed-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'foryou' ? 'For You' : t === 'recent' ? 'Recent' : 'Popular'}
                </button>
              ))}
            </div>
          </div>

          <div className="article-feed">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
            {loading && (
              <div className="loading-indicator">
                <div className="loading-spinner" />
                <span>Loading more stories...</span>
              </div>
            )}
            {!hasMore && articles.length === 0 && !loading && (
              <p className="text-center text-[var(--text-secondary)] py-12">No articles yet. Check back soon!</p>
            )}
          </div>
          {hasMore && <div className="h-10" />}
        </main>

        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title"><TrendingIcon /> Trending Now</h3>
            <div className="trending-list">
              {trending.map((item, i) => (
                <Link key={item.slug} href={`/article/${item.slug}`} className="trending-item">
                  <span className="trending-number">{String(i + 1).padStart(2, '0')}</span>
                  <div className="trending-content">
                    <div className="trending-item-title">{item.title}</div>
                    <div className="trending-item-meta">
                      {item.categoryName}{item.likeCount ? ` · ${item.likeCount} likes` : ''}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <RssFeedWidget />

          <div className="sidebar-section">
            <h3 className="sidebar-title"><GridIcon /> Categories</h3>
            <div className="categories-grid">
              {categories.map(cat => (
                <Link key={cat.slug} href={`/?category=${cat.slug}`} className="category-tag">{cat.name}</Link>
              ))}
            </div>
          </div>

          <div className="sidebar-section newsletter-section">
            <h3 className="sidebar-title"><MailIcon /> Daily Digest</h3>
            <p className="newsletter-desc">Get the top 5 stories delivered to your inbox every morning.</p>
            <div className="newsletter-input-wrap">
              <input type="email" className="newsletter-input" placeholder="your@email.com" />
              <button className="newsletter-btn">Subscribe</button>
            </div>
          </div>
        </aside>
      </div>

      <div className="chat-widget">
        <Link href="/chat" className="chat-btn" aria-label="Open chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="chat-badge">3</span>
        </Link>
      </div>

      <button className="scroll-top" id="scrollTopBtn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}
