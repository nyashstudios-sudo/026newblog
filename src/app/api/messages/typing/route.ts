import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { emitTyping } from '@/lib/socket';

export const POST = requireAuth(async (req, user) => {
  const { conversationId, recipientId } = await req.json();

  if (!conversationId || !recipientId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: participant } = await (ctx.supabaseAdmin as any)
    .from('conversation_participants')
    .select('*').eq('conversation_id', conversationId).eq('user_id', user.id).maybeSingle();

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  emitTyping(conversationId, user.id, recipientId);

  return NextResponse.json({ ok: true });
});
