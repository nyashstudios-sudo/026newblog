import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

type RouteContext = { params: Promise<{ username: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await context.params;
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: target } = await sb.from('users').select('id').eq('username', username).single();
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.id === user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  await sb.from('follows').upsert(
    { follower_id: user.id, following_id: target.id },
    { onConflict: 'follower_id,following_id' },
  );

  await sb.from('author_profiles').update({ total_followers: sb.raw('total_followers + 1') })
    .eq('user_id', target.id);

  return NextResponse.json({ following: true });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await context.params;
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: target } = await sb.from('users').select('id').eq('username', username).single();
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await sb.from('follows').delete().eq('follower_id', user.id).eq('following_id', target.id);
  await sb.from('author_profiles').update({ total_followers: sb.raw('GREATEST(total_followers - 1, 0)') })
    .eq('user_id', target.id);

  return NextResponse.json({ following: false });
}
