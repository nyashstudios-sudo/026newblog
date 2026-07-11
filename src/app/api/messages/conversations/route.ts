import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: participations } = await sb
    .from('conversation_participants')
    .select(`*,
      conversation:conversations!conversation_id(*,
        participants:conversation_participants!conversation_id(
          user:users(id, first_name, last_name, username, avatar_url)
        ),
        last_message:messages!conversation_id(
          id, content, created_at, is_read, sender_id,
          sender:users!sender_id(first_name, last_name)
        )
      )
    `)
    .eq('user_id', user.id)
    .order('last_read_at', { ascending: false, nullsFirst: false });

  let conversations = (participations || []).map((p: any) => {
    const conv = p.conversation;
    const other = conv.participants?.find((part: any) => part.user_id !== user.id);
    const msgs = conv.last_message || [];
    const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    return {
      id: conv.id,
      updatedAt: conv.updated_at,
      otherUser: other?.user || null,
      lastMessage,
      unread: lastMessage ? !lastMessage.is_read && lastMessage.sender_id !== user.id : false,
    };
  });

  if (search) {
    const q = search.toLowerCase();
    conversations = conversations.filter((c: any) => {
      if (!c.otherUser) return false;
      const name = `${c.otherUser.first_name || ''} ${c.otherUser.last_name || ''}`.toLowerCase();
      const username = (c.otherUser.username || '').toLowerCase();
      return name.includes(q) || username.includes(q);
    });
  }

  return NextResponse.json({ conversations });
});

export const POST = requireAuth(async (req, user) => {
  const { userId: otherUserId } = await req.json();

  if (!otherUserId || otherUserId === user.id) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: otherUser } = await sb.from('users').select('id').eq('id', otherUserId).eq('is_active', true).single();
  if (!otherUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Check for existing conversation between these two users
  const { data: existingConv } = await sb
    .rpc('find_conversation_between', { user_a: user.id, user_b: otherUserId });

  if (existingConv?.[0]) {
    const { data: parts } = await sb.from('conversation_participants')
      .select('user:users(id, first_name, last_name, username, avatar_url)')
      .eq('conversation_id', existingConv[0].id);
    const other = parts?.find((p: any) => p.user?.id !== user.id);
    return NextResponse.json({ conversation: { id: existingConv[0].id, otherUser: other?.user } });
  }

  const { data: conv } = await sb.from('conversations').insert({}).select().single();

  await sb.from('conversation_participants').insert([
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: otherUserId },
  ]);

  const { data: parts } = await sb.from('conversation_participants')
    .select('user:users(id, first_name, last_name, username, avatar_url)')
    .eq('conversation_id', conv.id);
  const other = parts?.find((p: any) => p.user?.id !== user.id);

  return NextResponse.json({ conversation: { id: conv.id, otherUser: other?.user } }, { status: 201 });
});
