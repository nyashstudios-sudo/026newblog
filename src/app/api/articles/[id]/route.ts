import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;

  const { data: article } = await sb
    .from('articles')
    .select('*, category:categories(*), audio:article_audio(*), author:users!author_id(id, first_name, last_name, username, avatar_url, bio, author_profile:author_profiles(total_views, total_followers))')
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (article.status !== 'published') {
    const user = await getCurrentUser();
    if (!user || (article.author_id !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  await sb.from('article_views').insert({
    article_id: article.id,
    user_id: (await getCurrentUser())?.id || null,
    session_id: null,
  });

  await sb.rpc('increment_article_view', { article_id: article.id });

  const user = await getCurrentUser();
  let userInteraction = { liked: false, saved: false, following: false };

  if (user) {
    const [liked, saved, following] = await Promise.all([
      sb.from('article_likes').select('*').eq('user_id', user.id).eq('article_id', article.id).maybeSingle(),
      sb.from('article_saves').select('*').eq('user_id', user.id).eq('article_id', article.id).maybeSingle(),
      sb.from('follows').select('*').eq('follower_id', user.id).eq('following_id', article.author_id).maybeSingle(),
    ]);
    userInteraction = { liked: !!liked, saved: !!saved, following: !!following };
  }

  return NextResponse.json({ article, userInteraction });
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: article } = await sb.from('articles').select('*').eq('id', id).single();
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (article.author_id !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const updateData: Record<string, unknown> = { ...body };
  if (body.status === 'published' && !article.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { data: updated } = await sb.from('articles').update(updateData).eq('id', id).select().single();

  return NextResponse.json({ article: updated });
}
