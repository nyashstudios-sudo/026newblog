import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { emitNotification } from '@/lib/socket';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: articleId } = await context.params;

  const existing = await db.articleLike.findUnique({
    where: { userId_articleId: { userId: user.id, articleId } },
  });
  if (existing) return NextResponse.json({ liked: true });

  await db.articleLike.create({ data: { userId: user.id, articleId } });
  await db.article.update({ where: { id: articleId }, data: { likeCount: { increment: 1 } } });

  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { authorId: true, title: true },
  });

  if (article && article.authorId !== user.id) {
    const notification = await db.notification.create({
      data: {
        userId: article.authorId,
        type: 'like',
        actorId: user.id,
        articleId,
        content: `liked your article "${article.title}"`,
      },
    });
    emitNotification(article.authorId, notification);
  }

  return NextResponse.json({ liked: true });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: articleId } = await context.params;

  const existing = await db.articleLike.findUnique({
    where: { userId_articleId: { userId: user.id, articleId } },
  });
  if (existing) {
    await db.articleLike.delete({
      where: { userId_articleId: { userId: user.id, articleId } },
    });
    await db.article.update({ where: { id: articleId }, data: { likeCount: { decrement: 1 } } });
  }

  return NextResponse.json({ liked: false });
}
