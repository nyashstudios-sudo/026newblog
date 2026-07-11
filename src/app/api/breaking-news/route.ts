import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const articles = await db.article.findMany({
    where: { status: 'published', isFeatured: true },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: { id: true, title: true, slug: true },
  });

  const items = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
  }));

  return NextResponse.json({ items });
}
