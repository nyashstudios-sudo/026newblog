import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { moderateContent } from '@/lib/moderation';
import { emitComment } from '@/lib/socket';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id: articleId } = await context.params;

  const comments = await db.comment.findMany({
    where: { articleId, parentId: null, moderationStatus: 'approved' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true } },
      replies: {
        where: { moderationStatus: 'approved' },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true } },
        },
      },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: articleId } = await context.params;
  const body = await req.json();

  const modResult = await moderateContent(body.content);
  const needsReview = modResult.flagged;

  const comment = await db.comment.create({
    data: {
      articleId,
      userId: user.id,
      parentId: body.parentId || null,
      content: body.content,
      moderationStatus: needsReview ? 'pending' : 'approved',
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true } },
    },
  });

  if (!needsReview) {
    await db.article.update({ where: { id: articleId }, data: { commentCount: { increment: 1 } } });
    emitComment(articleId, comment);
  } else {
    await db.moderationQueue.create({
      data: {
        type: 'comment',
        contentId: comment.id,
        reason: 'AI auto-flagged',
        aiConfidence: modResult.confidence,
        aiCategory: modResult.category,
      },
    });
  }

  return NextResponse.json({ comment, needsReview }, { status: 201 });
}
