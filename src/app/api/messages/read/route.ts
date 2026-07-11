import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { emitReadReceipt } from '@/lib/socket';

export const POST = requireAuth(async (req, user) => {
  const { conversationId, lastReadMessageId } = await req.json();

  if (!conversationId || !lastReadMessageId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  // Get the sender of the last unread message to notify them
  const lastMessage = await db.message.findUnique({
    where: { id: lastReadMessageId },
    select: { senderId: true },
  });

  if (lastMessage && lastMessage.senderId !== user.id) {
    emitReadReceipt(conversationId, user.id, lastMessage.senderId, lastReadMessageId);
  }

  return NextResponse.json({ ok: true });
});
