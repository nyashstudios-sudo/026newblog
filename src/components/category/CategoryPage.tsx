'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Category {
  name: string;
  description: string;
  articleCount: number;
  heroImage: string;
  slug: string;
}

const CATEGORIES: Record<string, Category> = {
  technology: {
    name: 'Technology',
    description: 'AI, cybersecurity, fintech, startups, and the digital innovations reshaping East Africa and the world.',
    articleCount: 234,
    heroImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop',
    slug: 'technology',
  },
  business: {
    name: 'Business',
    description: 'Market trends, investment news, entrepreneurship stories, and economic analysis shaping the African continent.',
    articleCount: 156,
    heroImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop',
    slug: 'business',
  },
  culture: {
    name: 'Culture',
    description: 'Afrofuturism, music, arts, lifestyle, and the creative voices redefining African identity on the global stage.',
    articleCount: 198,
    heroImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=400&fit=crop',
    slug: 'culture',
  },
  opinion: {
    name: 'Opinion',
    description: 'Thought-provoking editorials, op-eds, and perspectives from leading voices on the issues that matter most.',
    articleCount: 89,
    heroImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=400&fit=crop',
    slug: 'opinion',
  },
  science: {
    name: 'Science',
    description: 'Breakthrough research, health innovations, climate science, and scientific discoveries from African labs.',
    articleCount: 67,
    heroImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=400&fit=crop',
    slug: 'science',
  },
  health: {
    name: 'Health',
    description: 'Public health, medical breakthroughs, wellness, and healthcare policy affecting communities across East Africa.',
    articleCount: 54,
    heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop',
    slug: 'health',
  },
  startups: {
    name: 'Startups',
    description: 'Founder stories, funding rounds, accelerator programs, and the ecosystem building Africa\'s next unicorns.',
    articleCount: 112,
    heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
    slug: 'startups',
  },
  ai: {
    name: 'Artificial Intelligence',
    description: 'Machine learning, generative AI, ethics, and applications transforming industries across the continent.',
    articleCount: 93,
    heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
    slug: 'ai',
  },
};

export function CategoryHero({ slug }: { slug: string }) {
  const cat = CATEGORIES[slug] || CATEGORIES.technology;
  
  return (
    <section style={{ 
      position: 'relative', 
      minHeight: 320, 
      display: 'flex', 
      alignItems: 'center',
      backgroundImage: `url(${cat.heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(10% 0.015 175 / 0.7), oklch(10% 0.015 175 / 0.3))' }} />
      <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        <span style={{ 
          display: 'inline-block', 
          padding: '6px 14px', 
          borderRadius: 9999, 
          background: 'var(--primary-light)', 
          color: 'var(--primary)', 
          fontSize: '0.75rem', 
          fontWeight: 600,
          marginBottom: 16,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {cat.articleCount}+ Articles
        </span>
        <h1 style={{ 
          fontFamily: "'Newsreader', Georgia, serif", 
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
          fontWeight: 700, 
          lineHeight: 1.1, 
          marginBottom: 16,
          color: 'white',
        }}>
          {cat.name}
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: 'oklch(85% 0.008 175)', 
          maxWidth: 700,
          lineHeight: 1.7,
        }}>
          {cat.description}
        </p>
      </div>
    </section>
  );
}

export function CategoryGrid({ slug }: { slug: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ category: slug, limit: '12' });
    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(d => { setArticles(d.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)' }}>
        <p>No articles in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  const readTime = Math.max(1, Math.round((article.content?.length || 2000) / 200));
  return (
    <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: 16, 
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
        {article.coverImageUrl && (
          <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
            <img src={article.coverImageUrl} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
          </div>
        )}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 9999, textTransform: 'uppercase' }}>
              {article.category?.name || 'General'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{readTime} min read</span>
          </div>
          <h2 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.3, marginBottom: 8, color: 'var(--text-primary)' }}>
            {article.title}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.excerpt || article.content?.slice(0, 160)}...
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
              {article.author?.firstName?.[0]}{article.author?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {article.author?.firstName} {article.author?.lastName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ArticleSkeleton() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 200, background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: 20 }}>
        <div style={{ height: 8, width: '30%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ height: 24, width: '80%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 16, width: '60%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 16, width: '100%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
      </div>
    </div>
  );
}