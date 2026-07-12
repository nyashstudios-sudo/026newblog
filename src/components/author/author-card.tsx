'use client';

import Link from 'next/link';

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

export default function AuthorCard({
  author,
  followed,
  onToggleFollow,
}: {
  author: Author;
  followed: boolean;
  onToggleFollow: () => void;
}) {
  return (
    <div
      style={{
        padding: 28,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: author.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'oklch(98% 0.005 175)',
            flexShrink: 0,
          }}
        >
          {author.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{author.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {author.title}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {author.topics.map((t: string) => (
              <span
                key={t}
                style={{
                  padding: '3px 10px',
                  background: 'var(--primary-light)',
                  borderRadius: 12,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: 16,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {author.bio || 'Passionate writer covering technology, business, and culture across East Africa.'}
      </p>
      <div
        style={{
          display: 'flex',
          gap: 20,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{author.stats.views}</strong> views
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{author.stats.articles}</strong> articles
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{author.stats.followers}</strong> followers
        </span>
      </div>
      <button
        onClick={onToggleFollow}
        style={{
          marginTop: 16,
          width: '100%',
          padding: 9,
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: followed ? 'var(--primary)' : 'transparent',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: followed ? 'oklch(98% 0.005 175)' : 'var(--primary)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
      >
        {followed ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
