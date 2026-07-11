import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { emitTyping } from '@/lib/socket';

export const POST = requireAuth(async (req, user) => {
  const { conversationId, recipientId } = await req.json();

  if (!conversationId || !recipientId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  emitTyping(conversationId, user.id, recipientId);

  return NextResponse.json({ ok: true });
});
