import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (q.length < 2) {
    return NextResponse.json({ articles: [], query: q });
  }

  const articles = await db.article.findMany({
    where: {
      status: 'published',
      OR: [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { contentHtml: { contains: q } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      readingTimeMinutes: true,
      viewCount: true,
      likeCount: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } },
      author: { select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({ articles, query: q });
}
