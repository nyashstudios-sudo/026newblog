'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import AuthorCard from '@/components/author/author-card';
import AuthorSkeleton from '@/components/author/author-skeleton';

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
        const formatted: Author[] = items.map((u: any) => ({
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
        <Header />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[...Array(6)].map((_, i) => <AuthorSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px' }}>
      <Header />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {authors.map((author) => (
          <AuthorCard
            key={author.id}
            author={author}
            followed={!!followed[author.name]}
            onToggleFollow={() => toggleFollow(author.name)}
          />
        ))}
      </div>
      {authors.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)' }}>
          <p>No authors found. Be the first to <Link href="/author/apply" style={{ color: 'var(--primary)' }}>apply as an author</Link>.</p>
        </div>
      )}
      <CTA />
    </div>
  );
}

function Header() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Our Authors
      </h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
        Meet the voices behind 026Newsblog. Independent writers, researchers, and reporters covering what matters.
      </p>
    </div>
  );
}

function CTA() {
  return (
    <div
      style={{
        marginTop: 56,
        textAlign: 'center',
        padding: 48,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 20,
      }}
    >
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>
        Want to write for 026Newsblog?
      </h2>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
        We&apos;re always looking for talented writers with expertise in technology, business, science,
        culture, and more. Earn 70% of revenue from your content.
      </p>
      <Link
        href="/author/apply"
        style={{
          padding: '11px 24px',
          borderRadius: 9,
          fontSize: '0.84rem',
          fontWeight: 600,
          background: 'var(--primary)',
          color: 'oklch(98% 0.005 175)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        Apply to Become an Author →
      </Link>
    </div>
  );
}
