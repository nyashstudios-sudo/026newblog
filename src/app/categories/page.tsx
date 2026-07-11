'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string; name: string; slug: string;
  description?: string | null; articleCount: number;
}

const categoryIcons: Record<string, string> = {
  technology: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  business: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  science: 'M22 12h-4l-3 9L9 3l-3 9H2',
  culture: 'M9 18V5l12-2v13 M6 18c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V5',
  health: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  sports: 'M6 5v14 M18 5v14 M6 12h12 M12 5v14',
  travel: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  opinion: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
};

const catColors: Record<string, string> = {
  technology: '200', business: '55', science: '145', culture: '310',
  health: '25', sports: '40', travel: '80', opinion: '175',
};

const catBgColors: Record<string, string> = {
  technology: 'oklch(92% 0.04 200)', business: 'oklch(92% 0.04 55)',
  science: 'oklch(92% 0.04 145)', culture: 'oklch(92% 0.04 310)',
  health: 'oklch(92% 0.04 25)', sports: 'oklch(92% 0.04 40)',
  travel: 'oklch(92% 0.04 80)', opinion: 'oklch(92% 0.04 175)',
};

const topAuthors = [
  { initials: 'AM', name: 'Amara Mwangi', articles: '12 articles', views: '48K views', gradient: 'linear-gradient(135deg,oklch(50% 0.14 220),oklch(45% 0.12 200))' },
  { initials: 'SA', name: 'Samuel Adeyemi', articles: '8 articles', views: '22K views', gradient: 'linear-gradient(135deg,oklch(50% 0.14 160),oklch(45% 0.12 180))' },
  { initials: 'OF', name: 'Olusegun Femi', articles: '6 articles', views: '18K views', gradient: 'linear-gradient(135deg,oklch(50% 0.14 300),oklch(45% 0.12 320))' },
];

const relatedTopics = ['AI & ML', 'Startups', 'Fintech', 'Blockchain', 'Cloud Computing', 'IoT', 'DevOps', 'Open Source'];

const sortTabs = ['Latest', 'Popular', 'Trending'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Category | null>(null);
  const [activeSort, setActiveSort] = useState('Latest');
  const [activeSubtopic, setActiveSubtopic] = useState('All');

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        const cats = d.categories || [];
        setCategories(cats);
        if (cats.length > 0) setFeatured(cats[0]);
      })
      .catch(() => {});
  }, []);

  const totalArticles = categories.reduce((s, c) => s + c.articleCount, 0);

  return (
    <div>
      {/* Page header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 4px' }}>/</span>
          {featured?.name || 'Categories'}
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          {featured?.name || 'Categories'}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '55ch', marginBottom: 20 }}>
          {featured?.description || 'Browse stories by topic — from technology and business to culture and science.'}
        </p>
        <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
          <span><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{totalArticles}</strong> articles</span>
          <span><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{categories.length}</strong> categories</span>
        </div>
      </div>

      {/* Subtopics bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 32px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['All', ...categories.map(c => c.name)].map(topic => (
          <button key={topic}
            onClick={() => setActiveSubtopic(topic)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
              border: activeSubtopic === topic ? 'none' : '1px solid var(--border)',
              background: activeSubtopic === topic ? 'var(--primary)' : 'transparent',
              color: activeSubtopic === topic ? 'oklch(98% 0.005 175)' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >{topic}</button>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 64px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>
        <main>
          {/* Featured card */}
          {featured && (
            <div style={{ marginBottom: 32 }}>
              <div style={{
                position: 'relative', borderRadius: 18, overflow: 'hidden', height: 320, cursor: 'pointer',
              }}>
                <div style={{
                  width: '100%', height: '100%',
                  background: catBgColors[featured.slug] || 'var(--bg-inset)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.5s var(--ease-out-expo)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke={`oklch(45% 0.12 ${catColors[featured.slug] || '180'})`} strokeWidth="1.5" style={{ width: 80, height: 80, opacity: 0.3 }}>
                    <path d={categoryIcons[featured.slug] || categoryIcons.technology} />
                  </svg>
                </div>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, oklch(10% 0.02 175 / 0.9) 0%, transparent 60%)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, padding: 32,
                  color: 'oklch(96% 0.005 175)',
                }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', background: 'var(--accent)',
                    color: 'oklch(15% 0.02 55)', fontSize: '0.62rem', fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 4, marginBottom: 8,
                  }}>
                    Featured
                  </span>
                  <h2 style={{
                    fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.5rem', fontWeight: 600,
                    lineHeight: 1.25, marginBottom: 8,
                  }}>
                    {featured.name}: Latest Stories and Insights
                  </h2>
                  <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                    {featured.articleCount} articles · Updated recently
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sort tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-inset)', borderRadius: 8, padding: 3 }}>
              {sortTabs.map(tab => (
                <button key={tab}
                  onClick={() => setActiveSort(tab)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                    border: 'none', fontFamily: 'inherit', cursor: 'pointer',
                    background: activeSort === tab ? 'var(--bg-elevated)' : 'transparent',
                    color: activeSort === tab ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    transition: 'all 0.15s',
                  }}
                >{tab}</button>
              ))}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {categories.length} categories
            </span>
          </div>

          {/* Article list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {categories.map(c => {
              const hue = catColors[c.slug] || '180';
              const stroke = `oklch(45% 0.12 ${hue})`;
              return (
                <Link key={c.id} href={`/?category=${c.slug}`}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 160px', gap: 18, padding: 18,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: 14, textDecoration: 'none', color: 'inherit',
                    transition: 'all 0.25s var(--ease-out-expo)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px oklch(0% 0 0 / 0.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: 'var(--primary)', marginBottom: 4, display: 'block',
                      }}>
                        {c.slug}
                      </span>
                      <h3 style={{
                        fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.05rem', fontWeight: 600,
                        lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {c.name}
                      </h3>
                      {c.description && (
                        <p style={{
                          fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {c.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 10 }}>
                      <span>{c.articleCount} articles</span>
                    </div>
                  </div>
                  <div style={{
                    width: '100%', height: '100%', minHeight: 120, borderRadius: 10,
                    background: catBgColors[c.slug] || 'var(--bg-inset)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" style={{ width: 32, height: 32, opacity: 0.4 }}>
                      <path d={categoryIcons[c.slug] || categoryIcons.technology} />
                    </svg>
                  </div>
                </Link>
              );
            })}
            {categories.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 48 }}>No categories yet.</p>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Authors */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 14, padding: 20,
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 14 }}>Top Authors</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topAuthors.map(author => (
                <div key={author.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700,
                    color: 'oklch(98% 0.005 175)', flexShrink: 0,
                    background: author.gradient,
                  }}>
                    {author.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{author.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                      {author.articles} · {author.views}
                    </div>
                  </div>
                  <button style={{
                    padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
                    background: 'transparent', fontSize: '0.68rem', fontWeight: 600,
                    color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'oklch(98% 0.005 175)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Related Topics */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 14, padding: 20,
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 14 }}>Related Topics</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {relatedTopics.map(topic => (
                <Link key={topic} href="#"
                  style={{
                    padding: '5px 12px', background: 'var(--bg-inset)', borderRadius: 14,
                    fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.15s', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 14, padding: 20,
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Stay Informed</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>
              Get the latest stories delivered to your inbox every week.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="email" placeholder="Your email address"
                style={{
                  padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg-inset)', color: 'var(--text-primary)',
                  fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', width: '100%',
                }}
              />
              <button style={{
                padding: '9px 12px', borderRadius: 8, border: 'none',
                background: 'var(--primary)', color: 'oklch(98% 0.005 175)',
                fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
