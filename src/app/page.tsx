import { Suspense } from 'react';
import Link from 'next/link';
import { HeroSlideshow } from '@/components/articles/hero-slideshow';
import { ArticleCard } from '@/components/articles/article-card';
import { RssFeedWidget } from '@/components/rss/rss-feed-widget';

interface ArticleData {
  id: string; title: string; slug: string; likeCount?: number; viewCount?: number;
  coverImage?: string | null; excerpt?: string; category?: { name: string; slug: string } | null;
  author?: { firstName: string; lastName: string; username: string } | null;
  sourceName?: string | null; sourceUrl?: string | null; createdAt: string;
}

async function getData() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const [feedRes, catRes] = await Promise.all([
      fetch(`${base}/api/articles/feed?page=1&tab=recent&limit=12`, { cache: 'no-store' }),
      fetch(`${base}/api/categories`, { cache: 'no-store' }),
    ]);
    const feed = feedRes.ok ? await feedRes.json() : { articles: [], hasMore: false };
    const cats = catRes.ok ? await catRes.json() : { categories: [] };
    return { articles: feed.articles || [], hasMore: feed.hasMore, categories: cats.categories || [] };
  } catch {
    return { articles: [], hasMore: false, categories: [] };
  }
}

export default async function HomePage() {
  const data = await getData();

  return (
    <div>
      <Suspense fallback={<div className="hero"><div className="skeleton w-full h-full rounded-[20px]" /></div>}>
        <HeroSlideshow />
      </Suspense>

      <div className="main-layout">
        <main>
          <div className="feed-header">
            <h2 className="feed-title">Latest Stories</h2>
          </div>

          <div className="article-feed">
            {data.articles.map((article: ArticleData, i: number) => (
              <ArticleCard key={article.id} article={article as any} index={i} />
            ))}
            {data.articles.length === 0 && (
              <p className="text-center text-[var(--text-secondary)] py-12">No articles yet. Check back soon!</p>
            )}
          </div>
        </main>

        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Trending Now</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Trending data loads on client.</p>
          </div>

          <Suspense fallback={null}>
            <RssFeedWidget />
          </Suspense>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <div className="categories-grid">
              {data.categories.map((cat: { name: string; slug: string }) => (
                <Link key={cat.slug} href={`/?category=${cat.slug}`} className="category-tag">{cat.name}</Link>
              ))}
            </div>
          </div>

          <div className="sidebar-section newsletter-section">
            <h3 className="sidebar-title">Daily Digest</h3>
            <p className="newsletter-desc">Get the top 5 stories delivered to your inbox every morning.</p>
            <div className="newsletter-input-wrap">
              <input type="email" className="newsletter-input" placeholder="your@email.com" />
              <button className="newsletter-btn">Subscribe</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
