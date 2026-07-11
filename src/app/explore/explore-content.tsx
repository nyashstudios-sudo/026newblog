'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { ArticleCardData } from '@/components/articles/article-card';

interface Category { id: string; name: string; slug: string; description?: string | null; articleCount: number; }

const categoryIcons: Record<string, string> = {
  technology: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  business: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  science: 'M22 12h-4l-3 9L9 3l-3 9H2',
  culture: 'M9 18V5l12-2v13 M6 18c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V5',
  health: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  travel: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  opinion: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
};

const catColors: Record<string, string> = {
  technology: 'oklch(45% 0.12 200)', business: 'oklch(55% 0.15 55)', science: 'oklch(45% 0.12 145)',
  culture: 'oklch(50% 0.14 310)', health: 'oklch(50% 0.14 25)', travel: 'oklch(55% 0.12 80)', opinion: 'oklch(45% 0.12 175)',
};

export default function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  const search = async (q: string) => {
    if (q.length < 2) { setArticles([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch { setArticles([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (initialQ) search(initialQ); }, [initialQ]);

  const trendingTopics = [
    { name: 'AI in African Newsrooms', count: '48 articles this week', trend: '+124%', color: 'oklch(45% 0.12 175)' },
    { name: 'Kenya Tech Funding', count: '32 articles this week', trend: '+89%', color: 'oklch(55% 0.15 55)' },
    { name: 'Climate Action Africa', count: '27 articles this week', trend: '+67%', color: 'oklch(45% 0.12 145)' },
    { name: 'Mobile Money Evolution', count: '21 articles this week', trend: '+45%', color: 'oklch(50% 0.14 310)' },
    { name: 'Afrofuturism in Pop Culture', count: '19 articles this week', trend: '+38%', color: 'oklch(55% 0.12 80)' },
    { name: 'Gene Therapy Breakthroughs', count: '15 articles this week', trend: '+52%', color: 'oklch(50% 0.14 25)' },
  ];

  return (
    <div className="explore-page">
      <section className="explore-search-hero">
        <h1>Explore stories</h1>
        <p>Search articles, topics, and authors across 026Newsblog</p>
        <form onSubmit={e => { e.preventDefault(); search(query); }} className="explore-search-wrap">
          <span className="explore-search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></span>
          <input type="text" className="explore-search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for articles, topics, or authors..." />
        </form>
        <div className="explore-trending">
          <span className="explore-trending-label">Trending:</span>
          {['AI Journalism', 'M-Pesa', 'Climate Summit', 'Kenyan Startups', 'Marathon Training', 'Afrofuturism'].map(t => (
            <span key={t} className="explore-trending-tag" onClick={() => { setQuery(t); search(t); }}>{t}</span>
          ))}
        </div>
      </section>

      {query.length < 2 || articles.length > 0 || loading ? null : (
        <div className="explore-content">
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: -24, marginBottom: 32 }}>
            {loading ? 'Searching...' : `No results for "${query}"`}
          </p>
        </div>
      )}

      <div className="explore-content">
        {categories.length > 0 && (
          <section className="explore-section">
            <div className="explore-section-header">
              <h2 className="explore-section-title">Browse by Category</h2>
              <Link href="/categories" className="explore-section-link">View all →</Link>
            </div>
            <div className="explore-cat-scroll">
              {categories.map(c => (
                <Link key={c.id} href={`/?category=${c.slug}`} className="explore-cat-card">
                  <div className="explore-cat-icon" style={{ background: `${catColors[c.slug] || catColors.technology}22` }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={catColors[c.slug] || catColors.technology} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={categoryIcons[c.slug] || categoryIcons.technology} />
                    </svg>
                  </div>
                  <div className="explore-cat-name">{c.name}</div>
                  <div className="explore-cat-count">{c.articleCount} articles</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="explore-section">
          <div className="explore-section-header">
            <h2 className="explore-section-title">Trending Topics</h2>
            <span className="explore-section-link">See all →</span>
          </div>
          <div className="explore-topics-grid">
            {trendingTopics.map((t, i) => (
              <div key={t.name} className="explore-topic-chip" onClick={() => setQuery(t.name.split(' ').slice(0, 3).join(' '))}>
                <span className="explore-topic-num">{(i + 1).toString().padStart(2, '0')}</span>
                <div className="explore-topic-info">
                  <div className="explore-topic-name">{t.name}</div>
                  <div className="explore-topic-meta">{t.count}</div>
                </div>
                <span className="explore-topic-trend">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
                  {t.trend}
                </span>
              </div>
            ))}
          </div>
        </section>

        {articles.length > 0 && (
          <section className="explore-section">
            <div className="explore-section-header">
              <h2 className="explore-section-title">Search Results</h2>
            </div>
            <div className="explore-picks">
              <Link href={`/article/${articles[0].slug}`} className="explore-featured-card">
                <img src={articles[0].coverImageUrl || 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&h=500&fit=crop'} alt="" />
                <div className="explore-featured-overlay" />
                <div className="explore-featured-content">
                  {articles[0].category && <span className="explore-featured-cat">{articles[0].category.name}</span>}
                  <h3 className="explore-featured-title">{articles[0].title}</h3>
                  <span className="explore-featured-meta">{articles[0].author.firstName} {articles[0].author.lastName} · {articles[0].readingTimeMinutes || '?'} min read · {articles[0].likeCount} likes</span>
                </div>
              </Link>
              <div className="explore-side-stack">
                {articles.slice(1, 4).map(a => (
                  <Link key={a.id} href={`/article/${a.slug}`} className="explore-side-card">
                    <img className="explore-side-card-img" src={a.coverImageUrl || ''} alt="" />
                    <div className="explore-side-card-body">
                      {a.category && <span className="explore-side-card-cat">{a.category.name}</span>}
                      <h4 className="explore-side-card-title">{a.title}</h4>
                      <span className="explore-side-card-meta">{a.author.firstName} {a.author.lastName} · {a.readingTimeMinutes || '?'} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="explore-section">
          <div className="explore-section-header">
            <h2 className="explore-section-title">Authors to Follow</h2>
            <span className="explore-section-link">Browse all →</span>
          </div>
          <div className="explore-authors-scroll">
            {['Amara Mwangi', 'Kwame Osei', 'Dr. Fatima N.', 'Zuri Abara', 'Eliud Sang', 'Grace Akinyi'].map((name, i) => {
              const initials = name.split(' ').map(n => n[0]).join('');
              const colors = ['oklch(50% 0.14 220), oklch(45% 0.12 200)', 'oklch(50% 0.14 30), oklch(50% 0.12 50)', 'oklch(50% 0.14 140), oklch(45% 0.12 160)', 'oklch(50% 0.14 310), oklch(45% 0.12 330)', 'oklch(50% 0.14 25), oklch(50% 0.12 40)', 'oklch(50% 0.14 90), oklch(45% 0.12 110)'];
              const topics = ['Technology · AI', 'Business · Fintech', 'Science · Health', 'Culture · Arts', 'Sports · Fitness', 'AgriTech · Climate'];
              return (
                <div key={name} className="explore-author-card">
                  <div className="explore-author-avatar" style={{ background: `linear-gradient(135deg, ${colors[i]})` }}>{initials}</div>
                  <div className="explore-author-name">{name}</div>
                  <div className="explore-author-topic">{topics[i]}</div>
                  <button className="explore-author-btn"
                    onClick={e => {
                      const btn = e.currentTarget;
                      btn.textContent = btn.textContent === 'Follow' ? 'Following' : 'Follow';
                      if (btn.textContent === 'Following') {
                        btn.style.background = 'var(--primary)'; btn.style.borderColor = 'var(--primary)'; btn.style.color = 'oklch(98% 0.005 175)';
                      } else {
                        btn.style.background = 'transparent'; btn.style.borderColor = ''; btn.style.color = '';
                      }
                    }}>Follow</button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="explore-section">
          <div className="explore-section-header">
            <h2 className="explore-section-title">Recent Searches</h2>
            <span className="explore-section-link">Clear all</span>
          </div>
          <div className="explore-recent">
            {['artificial intelligence kenya', 'fintech startups nairobi', 'marathon training iten', 'gengetone music', 'remote work africa'].map(s => (
              <span key={s} className="explore-recent-item" onClick={() => { setQuery(s); search(s); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {s}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
