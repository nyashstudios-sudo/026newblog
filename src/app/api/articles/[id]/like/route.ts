import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { emitNotification } from '@/lib/socket';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: articleId } = await context.params;

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  const { data: existing } = await sb.from('article_likes').select('*')
    .eq('user_id', user.id).eq('article_id', articleId).maybeSingle();
  if (existing) return NextResponse.json({ liked: true });

  await sb.from('article_likes').insert({ user_id: user.id, article_id: articleId });
  await sb.rpc('increment_article_like', { article_id: articleId });

  const { data: article } = await sb.from('articles').select('author_id, title')
    .eq('id', articleId).single();

  if (article && article.author_id !== user.id) {
    const { data: notif } = await sb.from('notifications').insert({
      user_id: article.author_id,
      type: 'like',
      actor_id: user.id,
      article_id: articleId,
      content: `liked your article "${article.title}"`,
    }).select().single();
    if (notif) emitNotification(article.author_id, notif);
  }

  return NextResponse.json({ liked: true });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: articleId } = await context.params;

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  await sb.from('article_likes').delete()
    .eq('user_id', user.id).eq('article_id', articleId);
  await sb.rpc('decrement_article_like', { article_id: articleId });

  return NextResponse.json({ liked: false });
}
