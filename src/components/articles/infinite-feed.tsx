'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArticleCard, type ArticleCardData } from './article-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/components/providers/settings-provider';

interface InfiniteFeedProps {
  tab?: 'foryou' | 'recent' | 'popular';
}

export function InfiniteFeed({ tab }: InfiniteFeedProps) {
  const settings = useSettings();
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const perPage = settings.contentPerPage || 12;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const effectiveTab = tab || (settings.defaultFeedTab === 'popular' ? 'popular' : settings.defaultFeedTab === 'foryou' ? 'foryou' : 'recent');

  const loadPage = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/feed?page=${pageNum}&tab=${effectiveTab}&limit=${perPage}`);
      const data = await res.json();
      setArticles((prev) => (reset ? data.articles : [...prev, ...data.articles]));
      setHasMore(data.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [effectiveTab, perPage]);

  useEffect(() => {
    setPage(1);
    setArticles([]);
    loadPage(1, true);
  }, [tab, loadPage]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '200px' }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) loadPage(page);
  }, [page, loadPage]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i % 12} />
        ))}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`sk-${i}`} className="rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-10 mt-6" />}
      {!hasMore && articles.length === 0 && !loading && (
        <p className="text-center text-[var(--text-secondary)] py-12">No articles yet. Check back soon!</p>
      )}
    </div>
  );
}
