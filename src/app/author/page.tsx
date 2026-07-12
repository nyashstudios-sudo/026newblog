'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Author {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  topics: string[];
  stats: { views: string; articles: number; followers: string };
  gradient: string;
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/users?role=author&limit=20')
      .then(r => r.json())
      .then(d => {
        const items = d.users || [];
        const formatted = items.map((u: any) => ({
          id: u.id,
          slug: u.username,
          name: `${u.firstName} ${u.lastName}`,
          title: u.title || 'Writer',
          bio: u.bio || '',
          avatarUrl: u.avatarUrl || '',
          topics: u.topics || ['General'],
          stats: { views: '0', articles: u.articleCount || 0, followers: '0' },
          gradient: `linear-gradient(135deg, oklch(50% 0.14 ${Math.floor(Math.random() * 360)}), oklch(45% 0.12 ${Math.floor(Math.random() * 360)}))`,
        }));
        setAuthors(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleFollow = (name: string) => {
    setFollowed(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Our Authors</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 50, margin: '0 auto' }}>Meet the voices behind 026Newsblog. Independent writers, researchers, and reporters covering what matters.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[...Array(6)].map((_, i) => <AuthorSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Our Authors</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 50, margin: '0 auto' }}>Meet the voices behind 026Newsblog. Independent writers, researchers, and reporters covering what matters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {authors.map((author) => (
          <div key={author.id} style={{ padding: 28, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: author.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0 }}>
                {author.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{author.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{author.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {author.topics.map((t) => (
                    <span key={t} style={{ padding: '3px 10px', background: 'var(--primary-light)', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary)' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{author.bio || 'Passionate writer covering technology, business, and culture across East Africa.'}</p>
            <div style={{ display: 'flex', gap: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{author.stats.views}</strong> views</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{author.stats.articles}</strong> articles</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{author.stats.followers}</strong> followers</span>
            </div>
            <button onClick={() => toggleFollow(author.name)} style={{ marginTop: 16, width: '100%', padding: 9, borderRadius: 8, border: '1px solid var(--border)', background: followed[author.name] ? 'var(--primary)' : 'transparent', fontSize: '0.8rem', fontWeight: 600, color: followed[author.name] ? 'oklch(98% 0.005 175)' : 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {followed[author.name] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>

      {authors.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)' }}>
          <p>No authors found. Be the first to <Link href="/author/apply" style={{ color: 'var(--primary)' }}>apply as an author</Link>.</p>
        </div>
      )}

      <div style={{ marginTop: 56, textAlign: 'center', padding: 48, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Want to write for 026Newsblog?</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>We&apos;re always looking for talented writers with expertise in technology, business, science, culture, and more. Earn 70% of revenue from your content.</p>
        <Link href="/author/apply" style={{ padding: '11px 24px', borderRadius: 9, fontSize: '0.84rem', fontWeight: 600, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Apply to Become an Author →</Link>
      </div>
    </div>
  );
}

function AuthorSkeleton() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden', padding: 28 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 20, width: '60%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 14, width: '40%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ height: 14, width: '100%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 14, width: '80%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 14, width: '60%', background: 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
    </div>
  );
}