import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { emitReadReceipt } from '@/lib/socket';

export const POST = requireAuth(async (req, user) => {
  const { conversationId, lastReadMessageId } = await req.json();

  if (!conversationId || !lastReadMessageId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: participant } = await sb.from('conversation_participants')
    .select('*').eq('conversation_id', conversationId).eq('user_id', user.id).maybeSingle();

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  const { data: lastMessage } = await sb.from('messages')
    .select('sender_id').eq('id', lastReadMessageId).single();

  if (lastMessage && lastMessage.sender_id !== user.id) {
    emitReadReceipt(conversationId, user.id, lastMessage.sender_id, lastReadMessageId);
  }

  return NextResponse.json({ ok: true });
});
