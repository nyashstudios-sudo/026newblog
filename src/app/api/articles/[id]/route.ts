import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

function j(data: unknown) {
  return NextResponse.json(JSON.parse(JSON.stringify(data, (_k: string, v: unknown) => (typeof v === 'bigint' ? Number(v) : v))));
}

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  const article = await db.article.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
          bio: true,
          authorProfile: { select: { totalViews: true, totalFollowers: true } },
          _count: { select: { articles: { where: { status: 'published' } } } },
        },
      },
      audio: true,
    },
  });

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (article.status !== 'published') {
    const user = await getCurrentUser();
    if (!user || (article.authorId !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  await db.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  const user = await getCurrentUser();
  let userInteraction = { liked: false, saved: false, following: false };

  if (user) {
    const [liked, saved, following] = await Promise.all([
      db.articleLike.findUnique({
        where: { userId_articleId: { userId: user.id, articleId: article.id } },
      }),
      db.articleSave.findUnique({
        where: { userId_articleId: { userId: user.id, articleId: article.id } },
      }),
      db.follow.findUnique({
        where: { followerId_followingId: { followerId: user.id, followingId: article.authorId } },
      }),
    ]);
    userInteraction = { liked: !!liked, saved: !!saved, following: !!following };
  }

  return j({ article, userInteraction });
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (article.authorId !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const updated = await db.article.update({
    where: { id },
    data: {
      ...body,
      publishedAt: body.status === 'published' && !article.publishedAt ? new Date() : article.publishedAt,
    },
  });

  return j({ article: updated });
}
