'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatNumber } from '@/lib/utils';

interface Category {
  id: string; name: string; slug: string;
  description?: string | null; article_count: number;
}

interface Article {
  id: string; title: string; slug: string;
  excerpt?: string | null; cover_image_url?: string | null;
  reading_time_minutes?: number | null;
  view_count: number; like_count: number;
  published_at?: string | null;
  category?: { name: string; slug: string } | null;
  author: { id: string; first_name: string; last_name: string; username: string; avatar_url?: string | null };
}

const topAuthors = [
  { initials: 'AM', name: 'Amara Mwangi', articles: '12 articles', views: '48K views', gradient: 'linear-gradient(135deg,oklch(50% 0.14 220),oklch(45% 0.12 200))' },
  { initials: 'SA', name: 'Samuel Adeyemi', articles: '8 articles', views: '22K views', gradient: 'linear-gradient(135deg,oklch(50% 0.14 160),oklch(45% 0.12 180))' },
  { initials: 'OF', name: 'Olusegun Femi', articles: '6 articles', views: '18K views', gradient: 'linear-gradient(135deg,oklch(50% 0.14 300),oklch(45% 0.12 320))' },
];

const relatedTopics = ['AI & ML', 'Startups', 'Fintech', 'Blockchain', 'Cloud Computing', 'IoT', 'DevOps', 'Open Source'];

const subtopics = ['All', 'AI & Machine Learning', 'Startups', 'Fintech', 'Blockchain', 'Cybersecurity', 'Mobile', 'Cloud', 'Developer Tools'];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState('Most Recent');
  const [activeSubtopic, setActiveSubtopic] = useState('All');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch(`/api/articles?category=${slug}&limit=20`).then(r => r.json()),
    ])
      .then(([catData, artData]) => {
        const cats = catData.categories || [];
        const found = cats.find((c: Category) => c.slug === slug) || null;
        setCategory(found);
        setArticles(artData.articles || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const featured = articles[0] || null;
  const rest = articles.slice(1);

  if (loading) {
    return (
      <div className="cat-hero">
        <div className="cat-breadcrumb"><Link href="/">Home</Link> / <span className="skeleton" style={{ display: 'inline-block', width: 80, height: 12 }}>&nbsp;</span></div>
        <h1 className="cat-title skeleton" style={{ width: 200, height: 36 }}>&nbsp;</h1>
        <p className="cat-desc skeleton" style={{ width: 400, height: 16 }}>&nbsp;</p>
      </div>
    );
  }

  return (
    <div>
      <div className="cat-hero">
        <div className="cat-breadcrumb">
          <Link href="/">Home</Link> / {category?.name || slug}
        </div>
        <h1 className="cat-title">{category?.name || slug}</h1>
        <p className="cat-desc">
          {category?.description || `Coverage of ${category?.name || slug}, startups, fintech, and digital innovation shaping East Africa and the global tech landscape.`}
        </p>
        <div className="cat-stats">
          <span><strong>{category?.article_count || articles.length}</strong> articles</span>
          <span><strong>28</strong> authors</span>
          <span><strong>1.2M</strong> total views</span>
        </div>
      </div>

      <div className="subtopics">
        {subtopics.map(topic => (
          <button key={topic}
            className={`subtopic${activeSubtopic === topic ? ' active' : ''}`}
            onClick={() => setActiveSubtopic(topic)}
          >{topic}</button>
        ))}
      </div>

      <div className="cat-content">
        <main>
          {featured && (
            <div className="featured">
              <Link href={`/article/${featured.slug}`} className="featured-card">
                {featured.cover_image_url ? (
                  <img src={featured.cover_image_url} alt={featured.title} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--bg-inset)' }} />
                )}
                <div className="featured-overlay" />
                <div className="featured-content">
                  <span className="featured-tag">Featured</span>
                  <h2 className="featured-title">{featured.title}</h2>
                  <span className="featured-meta">
                    {featured.author.first_name} {featured.author.last_name}
                    {featured.reading_time_minutes && ` · ${featured.reading_time_minutes} min read`}
                    {featured.view_count > 0 && ` · ${formatNumber(featured.view_count)} views`}
                  </span>
                </div>
              </Link>
            </div>
          )}

          <div className="sort-bar">
            <span className="sort-label">Latest Articles</span>
            <select className="sort-select" value={activeSort} onChange={e => setActiveSort(e.target.value)}>
              <option>Most Recent</option>
              <option>Most Popular</option>
              <option>Most Discussed</option>
            </select>
          </div>

          <div className="article-list">
            {rest.map(article => (
              <Link key={article.id} href={`/article/${article.slug}`} className="art-card">
                <div className="art-body">
                  <div>
                    {article.category && <span className="art-cat">{article.category.name}</span>}
                    <h3 className="art-title">{article.title}</h3>
                    {article.excerpt && <p className="art-excerpt">{article.excerpt}</p>}
                  </div>
                  <div className="art-meta">
                    <span>{article.author.first_name} {article.author.last_name}</span>
                    {article.published_at && <span>{formatDate(article.published_at)}</span>}
                    {article.reading_time_minutes && <span>{article.reading_time_minutes} min</span>}
                    {article.view_count > 0 && <span>{formatNumber(article.view_count)} views</span>}
                  </div>
                </div>
                {article.cover_image_url ? (
                  <img className="art-img" src={article.cover_image_url} alt={article.title} />
                ) : (
                  <div className="art-img" style={{ background: 'var(--bg-inset)' }} />
                )}
              </Link>
            ))}
            {rest.length === 0 && !loading && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>No articles found in this category.</p>
            )}
          </div>
        </main>

        <aside className="cat-sidebar">
          <div className="side-panel">
            <h3 className="side-title">Top Authors in {category?.name || 'Category'}</h3>
            <div className="top-authors">
              {topAuthors.map(author => (
                <div key={author.name} className="top-author">
                  <div className="ta-avatar" style={{ background: author.gradient }}>{author.initials}</div>
                  <div className="ta-info">
                    <div className="ta-name">{author.name}</div>
                    <div className="ta-articles">{author.articles} · {author.views}</div>
                  </div>
                  <button className="ta-follow">Follow</button>
                </div>
              ))}
            </div>
          </div>
          <div className="side-panel">
            <h3 className="side-title">Related Topics</h3>
            <div className="related-topics">
              {relatedTopics.map(topic => (
                <Link key={topic} href="#" className="rel-topic">{topic}</Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
