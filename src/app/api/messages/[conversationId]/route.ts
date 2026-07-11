import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId } = await context.params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 50;

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: participant } = await sb.from('conversation_participants')
    .select('*').eq('conversation_id', conversationId).eq('user_id', user.id).maybeSingle();

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  const from = (page - 1) * limit;
  const { data: messages } = await sb.from('messages')
    .select('*, sender:users!sender_id(id, first_name, last_name, avatar_url), shared_article:articles(id, title, slug)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  const { count } = await sb.from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  if (count > 0) {
    await sb.from('messages').update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);
  }

  return NextResponse.json({
    messages: (messages || []).reverse(),
    hasMore: (messages?.length || 0) === limit,
    markedRead: count,
  });
}
