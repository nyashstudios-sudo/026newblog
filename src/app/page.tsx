'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HeroSlideshow } from '@/components/articles/hero-slideshow';
import { ArticleCard } from '@/components/articles/article-card';
import { RssFeedWidget } from '@/components/rss/rss-feed-widget';
import { formatNumber } from '@/lib/utils';
import { MiniListSkeleton } from '@/components/ui/mini-list-skeleton';
import { useSettings } from '@/components/providers/settings-provider';

interface ArticleData {
  id: string; title: string; slug: string; likeCount?: number; viewCount?: number;
  coverImageUrl?: string | null; excerpt?: string;
  category?: { name: string; slug: string } | null;
  author?: { id: string; firstName: string; lastName: string; username: string; avatarUrl?: string | null } | null;
  readingTimeMinutes?: number; commentCount?: number; shareCount?: number;
  sourceName?: string | null; sourceUrl?: string | null; publishedAt?: string;
}

function mapArticle(a: any): ArticleData {
  if (!a) return null as any;
  return {
    id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt,
    coverImageUrl: a.cover_image_url, readingTimeMinutes: a.reading_time_minutes,
    viewCount: a.view_count, likeCount: a.like_count, commentCount: a.comment_count,
    shareCount: a.share_count, publishedAt: a.published_at,
    sourceName: a.source_name, sourceUrl: a.source_url,
    category: a.category ? { name: a.category.name, slug: a.category.slug } : null,
    author: a.author ? { id: a.author.id, firstName: a.author.first_name, lastName: a.author.last_name, username: a.author.username, avatarUrl: a.author.avatar_url } : null,
  };
}

function TrendingSection() {
  const [trending, setTrending] = useState<{ title: string; meta: string }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/articles/trending')
      .then(r => r.ok ? r.json() : { trending: [] })
      .then(d => setTrending(d.trending || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const items = trending.length > 0 ? trending : [
    { title: 'Welcome to 026Newsblog', meta: 'Trending · New' },
    { title: 'Discover stories from top authors', meta: 'Trending · New' },
    { title: 'Join the conversation today', meta: 'Trending · New' },
  ];
  return (
    <>
      {loading ? (
        <MiniListSkeleton rows={4} />
      ) : items.map((item, i) => (
        <a href="#" key={i} className="trending-item" onClick={(e) => { e.preventDefault(); }}>
          <span className="trending-number">{String(i + 1).padStart(2, '0')}</span>
          <div className="trending-content">
            <div className="trending-item-title">{item.title}</div>
            <div className="trending-item-meta">{item.meta}</div>
          </div>
        </a>
      ))}
    </>
  );
}

export default function HomePage() {
  const settings = useSettings();
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [activeTab, setActiveTab] = useState(settings.defaultFeedTab === 'popular' ? 'popular' : settings.defaultFeedTab === 'recent' ? 'recent' : 'for-you');
  const [loading, setLoading] = useState(true);
  const [scrollVisible, setScrollVisible] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const perPage = settings.contentPerPage || 12;
        const feedTab = settings.defaultFeedTab === 'foryou' ? 'for-you' : (settings.defaultFeedTab || 'recent');
        const [feedRes, catRes] = await Promise.all([
          fetch(`${base}/api/articles/feed?page=1&tab=${feedTab}&limit=${perPage}`, { cache: 'no-store' }),
          fetch(`${base}/api/categories`, { cache: 'no-store' }),
        ]);
        const feed = feedRes.ok ? await feedRes.json() : { articles: [] };
        const cats = catRes.ok ? await catRes.json() : { categories: [] };
        setArticles((feed.articles || []).map(mapArticle));
        setCategories(cats.categories || []);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    if (feedRef.current) {
      feedRef.current.style.opacity = '0.5';
      feedRef.current.style.transform = 'translateY(8px)';
      setTimeout(() => {
        if (feedRef.current) {
          feedRef.current.style.opacity = '1';
          feedRef.current.style.transform = 'translateY(0)';
        }
      }, 300);
    }
  };

  return (
    <div>
      <Suspense fallback={<div className="hero"><div className="skeleton w-full h-full rounded-[20px]" /></div>}>
        <HeroSlideshow />
      </Suspense>

      <div className="main-layout">
        <main>
          <div className="feed-header">
            <h2 className="feed-title">Latest Stories</h2>
            <div className="feed-tabs">
              <button className={`feed-tab${activeTab === 'for-you' ? ' active' : ''}`} onClick={() => handleTabSwitch('for-you')}>For You</button>
              <button className={`feed-tab${activeTab === 'recent' ? ' active' : ''}`} onClick={() => handleTabSwitch('recent')}>Recent</button>
              <button className={`feed-tab${activeTab === 'popular' ? ' active' : ''}`} onClick={() => handleTabSwitch('popular')}>Popular</button>
            </div>
          </div>

          <div className="article-feed" ref={feedRef} style={{ transition: 'opacity 0.3s var(--ease-out-expo), transform 0.3s var(--ease-out-expo)' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="article-card" style={{ pointerEvents: 'none', animation: 'none' }}>
                  <div className="article-card-body">
                    <div>
                      <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 8 }} />
                      <div className="skeleton" style={{ width: '90%', height: 20, marginBottom: 8 }} />
                      <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 16 }} />
                    </div>
                    <div className="article-card-footer">
                      <div className="flex items-center gap-2"><div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} /><div className="skeleton" style={{ width: 100, height: 12 }} /></div>
                    </div>
                  </div>
                  <div className="article-card-image"><div className="skeleton w-full h-full" /></div>
                </div>
              ))
            ) : articles.length > 0 ? (
              articles.map((article, i) => (
                <ArticleCard key={article.id} article={article as any} index={i} />
              ))
            ) : (
              <p className="text-center text-[var(--text-secondary)] py-12">No articles yet. Check back soon!</p>
            )}
          </div>
        </main>

        <aside className="sidebar">
          {settings.trendingSidebar !== false && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                Trending Now
              </h3>
              <div className="trending-list">
                <TrendingSection />
              </div>
            </div>
          )}

          {settings.rssFeedSection !== false && (
            <Suspense fallback={null}>
              <RssFeedWidget />
            </Suspense>
          )}

          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Categories
            </h3>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/?category=${cat.slug}`} className="category-tag">{cat.name}</Link>
              ))}
            </div>
          </div>

          {settings.newsletterWidget !== false && (
            <div className="sidebar-section newsletter-section">
              <h3 className="sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Daily Digest
              </h3>
              <p className="newsletter-desc">Get the top 5 stories delivered to your inbox every morning. No spam, just signal.</p>
              <div className="newsletter-input-wrap">
                <input type="email" className="newsletter-input" placeholder="your@email.com" />
                <button className="newsletter-btn">Subscribe</button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {settings.chatWidget !== false && (
        <div className="chat-widget">
          <Link href="/chat" className="chat-btn" style={{ display: 'flex', textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <span className="chat-badge">3</span>
          </Link>
        </div>
      )}

      <button
        className={`scroll-top${scrollVisible ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
      </button>
    </div>
  );
}
