'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TickerItem {
  id: string;
  title: string;
  slug?: string;
}

export function BreakingNewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetch('/api/breaking-news')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});

    const es = new EventSource('/api/breaking-news/stream');
    es.onmessage = (e) => {
      try {
        const item = JSON.parse(e.data);
        setItems((prev) => [item, ...prev.slice(0, 9)]);
      } catch {}
    };
    return () => es.close();
  }, []);

  const display = items.length > 0 ? items : [
    { id: '1', title: 'Welcome to 026Newsblog — Your source for breaking news and stories' },
    { id: '2', title: 'Discover trending articles from top authors worldwide' },
  ];

  const doubled = [...display, ...display];

  return (
    <div className="bg-[var(--ticker-bg)] text-[var(--ticker-text)] py-2 overflow-hidden relative z-[100]">
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-[var(--accent)] text-[oklch(15%_0.02_55)] font-semibold text-xs tracking-wider uppercase z-[2]">
        Breaking
      </div>
      <div className="flex ticker-track pl-[140px]">
        {doubled.map((item, i) => (
          <span key={`${item.id}-${i}`} className="whitespace-nowrap px-8 text-sm flex items-center gap-2">
            <span className="w-[5px] h-[5px] bg-[var(--accent)] rounded-full shrink-0" />
            {item.slug ? (
              <Link href={`/article/${item.slug}`} className="hover:underline">
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
