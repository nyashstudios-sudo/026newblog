import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

type RouteContext = { params: Promise<{ username: string }> };

const COLUMNS = [
  'daily_digest', 'push_notifications', 'comment_replies',
  'new_followers', 'likes_on_comments', 'weekly_recap', 'author_publishes',
];

export async function GET(_req: Request, context: RouteContext) {
  const { username } = await context.params;
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (currentUser.username !== username && currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: row } = await (ctx.supabaseAdmin as any)
    .from('notification_preferences').select('*').eq('user_id', currentUser.id).maybeSingle();

  return NextResponse.json({ preferences: row || null });
}

export async function PUT(req: Request, context: RouteContext) {
  const { username } = await context.params;
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (currentUser.username !== username && currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const updateData: Record<string, unknown> = { user_id: currentUser.id };
  for (const col of COLUMNS) {
    if (body[col] !== undefined) updateData[col] = body[col];
  }
  if (Object.keys(updateData).length <= 1) {
    return NextResponse.json({ error: 'No valid preference provided' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: updated, error } = await (ctx.supabaseAdmin as any)
    .from('notification_preferences').upsert(updateData, { onConflict: 'user_id' })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preferences: updated });
}
