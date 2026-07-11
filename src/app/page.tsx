'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroSlideshow } from '@/components/articles/hero-slideshow';
import { ArticleCard, type ArticleCardData } from '@/components/articles/article-card';
import { TrendingUp, Grid, Mail } from 'lucide-react';
import { RssFeedWidget } from '@/components/rss/rss-feed-widget';

interface TrendingItem {
  title: string;
  slug: string;
  likeCount?: number;
  categoryName?: string;
}

interface CategoryItem {
  name: string;
  slug: string;
}

export default function HomePage() {
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
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setArticles([]);
    loadArticles(1, tab, true);
  }, [tab]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
    fetch('/api/articles/feed?page=1&tab=popular&limit=5')
      .then((r) => r.json())
      .then((d) => {
        const items: TrendingItem[] = (d.articles || []).map((a: ArticleCardData) => ({
          title: a.title,
          slug: a.slug,
          likeCount: a.likeCount,
          categoryName: a.category?.name,
        }));
        setTrending(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasMore || loading || page === 1) return;
    loadArticles(page, tab);
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= docHeight - 400) {
        setPage((p) => p + 1);
      }
      const scrollTopBtn = document.getElementById('scrollTopBtn');
      if (scrollTopBtn) {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
      }
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
              {['foryou', 'recent', 'popular'].map((t) => (
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
            <h3 className="sidebar-title">
              <TrendingUp />
              Trending Now
            </h3>
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
            <h3 className="sidebar-title">
              <Grid />
              Categories
            </h3>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/?category=${cat.slug}`} className="category-tag">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="sidebar-section newsletter-section">
            <h3 className="sidebar-title">
              <Mail />
              Daily Digest
            </h3>
            <p className="newsletter-desc">Get the top 5 stories delivered to your inbox every morning. No spam, just signal.</p>
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
