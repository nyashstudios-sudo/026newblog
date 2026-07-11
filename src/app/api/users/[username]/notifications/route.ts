import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

type RouteContext = { params: Promise<{ username: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await context.params;
  if (currentUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: prefs } = await (ctx.supabaseAdmin as any)
    .from('notification_preferences')
    .select('*')
    .eq('user_id', currentUser.id)
    .maybeSingle();

  return NextResponse.json({ preferences: prefs ?? {} });
}

export async function PUT(req: Request, context: RouteContext) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await context.params;
  if (currentUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { dailyDigest, pushNotifications, commentReplies, newFollowers, likesOnComments, weeklyRecap } = body;

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const updateData: Record<string, unknown> = {};
  if (dailyDigest !== undefined) updateData.daily_digest = dailyDigest;
  if (pushNotifications !== undefined) updateData.push_notifications = pushNotifications;
  if (commentReplies !== undefined) updateData.comment_replies = commentReplies;
  if (newFollowers !== undefined) updateData.new_followers = newFollowers;
  if (likesOnComments !== undefined) updateData.likes_on_comments = likesOnComments;
  if (weeklyRecap !== undefined) updateData.weekly_recap = weeklyRecap;

  const sb = ctx.supabaseAdmin as any;

  const existing = await sb.from('notification_preferences').select('*').eq('user_id', currentUser.id).maybeSingle();

  let prefs: any;
  if (existing) {
    const { data: d } = await sb.from('notification_preferences').update(updateData)
      .eq('user_id', currentUser.id).select().single();
    prefs = d;
  } else {
    const defaults = {
      user_id: currentUser.id,
      daily_digest: dailyDigest ?? true,
      push_notifications: pushNotifications ?? true,
      comment_replies: commentReplies ?? true,
      new_followers: newFollowers ?? false,
      likes_on_comments: likesOnComments ?? false,
      weekly_recap: weeklyRecap ?? true,
      author_publishes: true,
    };
    const { data: d } = await sb.from('notification_preferences').insert(defaults).select().single();
    prefs = d;
  }

  return NextResponse.json({ preferences: prefs });
}
