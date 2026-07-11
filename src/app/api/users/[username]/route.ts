import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

type RouteContext = { params: Promise<{ username: string }> };

const articleSelect = 'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, like_count, comment_count, share_count, published_at, tags, category:categories!category_id(name, slug), author:users!author_id(id, first_name, last_name, username, avatar_url)';

export async function GET(_req: Request, context: RouteContext) {
  const { username } = await context.params;
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;

  const { data: user } = await sb
    .from('users')
    .select('id, first_name, last_name, username, avatar_url, bio, website, role, created_at, author_profile:author_profiles(*)')
    .eq('username', username)
    .single();

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Get follower/following/article counts
  const [followers, following, articleCount] = await Promise.all([
    sb.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    sb.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    sb.from('articles').select('*', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'published'),
  ]);

  const currentUser = await getCurrentUser();
  let isFollowing = false;
  if (currentUser && currentUser.id !== user.id) {
    const { data: follow } = await sb.from('follows').select('*')
      .eq('follower_id', currentUser.id).eq('following_id', user.id).maybeSingle();
    isFollowing = !!follow;
  }

  const { data: recentArticles } = await sb.from('articles').select(articleSelect)
    .eq('author_id', user.id).eq('status', 'published')
    .order('published_at', { ascending: false }).limit(6);

  return NextResponse.json({
    profile: {
      ...user,
      _count: { followers: followers.count || 0, following: following.count || 0, articles: articleCount.count || 0 },
    },
    isFollowing,
    recentArticles: recentArticles || [],
  });
}

export async function PATCH(req: Request, context: RouteContext) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await context.params;
  if (currentUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { bio, website, firstName, lastName } = body;

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const updateData: Record<string, unknown> = {};
  if (bio !== undefined) updateData.bio = bio;
  if (website !== undefined) updateData.website = website;
  if (firstName !== undefined) updateData.first_name = firstName;
  if (lastName !== undefined) updateData.last_name = lastName;

  const { data: updated } = await (ctx.supabaseAdmin as any)
    .from('users').update(updateData).eq('id', currentUser.id)
    .select('id, bio, website, first_name, last_name, username, email')
    .single();

  return NextResponse.json({ profile: updated });
}
