import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { emitMessage } from '@/lib/socket';

export const POST = requireAuth(async (req, user) => {
  const { conversationId, content, sharedArticleId } = await req.json();

  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: 'Conversation and content required' }, { status: 400 });
  }

  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  const message = await db.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content: content.trim(),
      sharedArticleId: sharedArticleId || null,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      sharedArticle: { select: { id: true, title: true, slug: true } },
    },
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const participants = await db.conversationParticipant.findMany({
    where: { conversationId, userId: { not: user.id } },
  });

  participants.forEach((p) => emitMessage(p.userId, message));

  return NextResponse.json({ message }, { status: 201 });
});
