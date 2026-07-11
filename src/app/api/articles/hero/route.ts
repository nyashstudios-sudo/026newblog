import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articleCardSelect } from '@/lib/auth';

function jsonResponse(data: unknown) {
  return NextResponse.json(JSON.parse(JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? Number(v) : v))));
}

export async function GET() {
  const [featured, topLiked] = await Promise.all([
    db.article.findMany({
      where: { status: 'published', isFeatured: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: articleCardSelect,
    }),
    db.article.findMany({
      where: { status: 'published' },
      orderBy: { likeCount: 'desc' },
      take: 5,
      select: articleCardSelect,
    }),
  ]);

  const seen = new Set<string>();
  const slides = [...featured, ...topLiked].filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return jsonResponse({ slides: slides.slice(0, 6) });
}
