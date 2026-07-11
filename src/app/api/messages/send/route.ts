import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { emitMessage } from '@/lib/socket';

export const POST = requireAuth(async (req, user) => {
  const { conversationId, content, sharedArticleId } = await req.json();

  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: 'Conversation and content required' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: participant } = await sb.from('conversation_participants')
    .select('*').eq('conversation_id', conversationId).eq('user_id', user.id).maybeSingle();

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  const { data: message } = await sb.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
    shared_article_id: sharedArticleId || null,
  }).select('*, sender:users!sender_id(id, first_name, last_name, avatar_url), shared_article:articles(id, title, slug)').single();

  await sb.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

  const { data: participants } = await sb.from('conversation_participants')
    .select('user_id').eq('conversation_id', conversationId).neq('user_id', user.id);

  (participants || []).forEach((p: any) => emitMessage(p.user_id, message));

  return NextResponse.json({ message }, { status: 201 });
});
