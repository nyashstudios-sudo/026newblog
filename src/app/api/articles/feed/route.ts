import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, articleCardSelect } from '@/lib/auth';
import { cacheGet, cacheSet } from '@/lib/redis';

function jsonResponse(data: unknown) {
  return NextResponse.json(JSON.parse(JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? Number(v) : v))));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const tab = searchParams.get('tab') || 'recent';

  const user = await getCurrentUser();
  let articles;

  if (tab === 'foryou' && user) {
    const [interests, following] = await Promise.all([
      db.userInterest.findMany({ where: { userId: user.id }, select: { categoryId: true } }),
      db.follow.findMany({ where: { followerId: user.id }, select: { followingId: true } }),
    ]);

    const categoryIds = interests.map((i: { categoryId: string }) => i.categoryId);
    const authorIds = following.map((f: { followingId: string }) => f.followingId);

    articles = await db.article.findMany({
      where: {
        status: 'published',
        OR: [
          ...(categoryIds.length ? [{ categoryId: { in: categoryIds } }] : []),
          ...(authorIds.length ? [{ authorId: { in: authorIds } }] : []),
        ],
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: articleCardSelect,
    });

    if (articles.length === 0) {
      articles = await db.article.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: articleCardSelect,
      });
    }
  } else if (tab === 'popular') {
    const cacheKey = `feed:popular:page${page}`;
    const cached = await cacheGet<{ articles: unknown[] }>(cacheKey);
    if (cached) return jsonResponse({ ...cached, page, hasMore: cached.articles.length === limit });

    articles = await db.article.findMany({
      where: {
        status: 'published',
        publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      select: articleCardSelect,
    });

    await cacheSet(cacheKey, { articles }, 300);
  } else {
    articles = await db.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: articleCardSelect,
    });
  }

  return jsonResponse({ articles, page, hasMore: articles.length === limit });
}
