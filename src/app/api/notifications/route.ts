import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  let query = sb.from('notifications')
    .select('*, actor:users!actor_id(id, first_name, last_name, username, avatar_url), article:articles(id, title, slug, cover_image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  const [{ data: notifications }, { count: unreadCount }] = await Promise.all([
    query,
    sb.from('notifications').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('is_read', false),
  ]);

  return NextResponse.json({ notifications: notifications || [], unreadCount: unreadCount || 0 });
});

export const PATCH = requireAuth(async (req, user) => {
  const body = await req.json();

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  if (body.markAllRead) {
    await sb.from('notifications').update({ is_read: true })
      .eq('user_id', user.id).eq('is_read', false);
    return NextResponse.json({ success: true });
  }

  if (body.ids?.length) {
    await sb.from('notifications').update({ is_read: true })
      .eq('user_id', user.id).in('id', body.ids);
  }

  return NextResponse.json({ success: true });
});
