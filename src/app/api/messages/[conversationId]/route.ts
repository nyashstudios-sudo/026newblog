import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId } = await context.params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 50;

  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      sharedArticle: { select: { id: true, title: true, slug: true } },
    },
  });

  const updated = await db.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({
    messages: messages.reverse(),
    hasMore: messages.length === limit,
    markedRead: updated.count,
  });
}
