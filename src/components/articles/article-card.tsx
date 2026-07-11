'use client';

import Link from 'next/link';
import { formatRelativeDate, formatNumber } from '@/lib/utils';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

export interface ArticleCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  readingTimeMinutes?: number | null;
  viewCount?: bigint | number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  publishedAt?: string | Date | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  category?: { name: string; slug: string } | null;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl?: string | null;
  };
}

export function ArticleCard({ article, index = 0 }: { article: ArticleCardData; index?: number }) {
  const initials = `${article.author.firstName[0]}${article.author.lastName[0]}`;

  return (
    <Link
      href={`/article/${article.slug}`}
      className="article-card"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="article-card-body">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {article.category && (
              <span className="article-card-category">{article.category.name}</span>
            )}
            {article.sourceName && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                via {article.sourceName}
              </span>
            )}
          </div>
          <h3 className="article-card-title" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="article-card-excerpt">{article.excerpt}</p>
          )}
        </div>
        <div className="article-card-footer">
          <div className="article-card-author">
            <div className="article-card-author-avatar" style={{ background: `oklch(55% 0.14 ${(article.author.firstName.charCodeAt(0) * 7) % 360})` }}>
              {initials}
            </div>
            <div>
              <div className="article-card-author-name">{article.author.firstName} {article.author.lastName}</div>
              <span className="article-card-date">
                {article.publishedAt ? formatRelativeDate(article.publishedAt) : ''}
                {article.readingTimeMinutes ? ` · ${article.readingTimeMinutes} min read` : ''}
              </span>
            </div>
          </div>
          <div className="article-card-stats">
            <span className="article-stat">
              <Heart />
              {formatNumber(article.likeCount || 0)}
            </span>
            <span className="article-stat">
              <MessageCircle />
              {article.commentCount || 0}
            </span>
            <span className="article-stat">
              <Share2 />
              {formatNumber(article.shareCount || 0)}
            </span>
          </div>
        </div>
      </div>
      <div className="article-card-image">
        {article.coverImageUrl ? (
          <img src={article.coverImageUrl} alt={article.title} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-sm bg-[var(--category-bg)]">
            026Newsblog
          </div>
        )}
      </div>
    </Link>
  );
}
