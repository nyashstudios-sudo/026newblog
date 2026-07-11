'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';

interface Slide {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  readingTimeMinutes?: number | null;
  likeCount?: number;
  category?: { name: string; slug: string } | null;
  author: { id: string; firstName: string; lastName: string; username: string; avatarUrl?: string | null };
}

export function HeroSlideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles/hero')
      .then((r) => r.json())
      .then((d) => setSlides(d.slides || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const goTo = useCallback((i: number) => setCurrent(i), []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return <div className="hero"><div className="skeleton w-full h-full rounded-[20px]" /></div>;
  }

  if (slides.length === 0) {
    return (
      <div className="hero bg-[var(--category-bg)] flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="hero-title text-white">Welcome to 026Newsblog</h1>
          <p className="text-white/60">Discover breaking news and stories from top authors</p>
        </div>
      </div>
    );
  }

  const slide = slides[current];
  const initials = `${slide.author.firstName[0]}${slide.author.lastName[0]}`;

  return (
    <div className="hero">
      <div className="hero-slides">
        {slides.map((s, i) => (
          <div key={s.id} className={`hero-slide${i === current ? ' active' : ''}`}>
            {s.coverImageUrl ? (
              <img src={s.coverImageUrl} alt={s.title} />
            ) : (
              <div className="w-full h-full bg-[var(--primary)]" />
            )}
            <div className="hero-overlay" />
          </div>
        ))}
      </div>

      <div className="hero-content">
        {slide.category && (
          <span className="hero-category">{slide.category.name}</span>
        )}
        <Link href={`/article/${slide.slug}`}>
          <h1 className="hero-title" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
            {slide.title}
          </h1>
        </Link>
        <div className="hero-meta">
          <div className="hero-author">
            <div className="hero-author-avatar" style={{ background: `oklch(55% 0.14 ${(current * 60) % 360})` }}>
              {initials}
            </div>
            <span>{slide.author.firstName} {slide.author.lastName}</span>
          </div>
          {slide.readingTimeMinutes && <span>{slide.readingTimeMinutes} min read</span>}
          {slide.likeCount !== undefined && <span>{formatNumber(slide.likeCount)} likes</span>}
        </div>
      </div>

      <div className="hero-nav-arrows">
        <button className="hero-arrow" onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button className="hero-arrow" onClick={() => goTo((current + 1) % slides.length)} aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <div className="hero-dots">
        {slides.map((_, i) => (
          <div key={i} className={`hero-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  );
}
