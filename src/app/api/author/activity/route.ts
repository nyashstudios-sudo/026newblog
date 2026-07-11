import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole(['author', 'admin'], async (_req, user) => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });
  const sb = ctx.supabaseAdmin as any;

  const { data: myArticles } = await sb
    .from('articles').select('id, title').eq('author_id', user.id);
  const articles = myArticles || [];
  const ids = articles.map((a: any) => a.id);
  const titleById: Record<string, string> = Object.fromEntries(articles.map((a: any) => [a.id, a.title]));

  const activity: any[] = [];

  if (ids.length) {
    const [{ data: likes }, { data: comments }] = await Promise.all([
      sb.from('article_likes').select('created_at, user_id, article_id')
        .in('article_id', ids).order('created_at', { ascending: false }).limit(5),
      sb.from('comments').select('created_at, user_id, article_id, content')
        .in('article_id', ids).order('created_at', { ascending: false }).limit(5),
    ]);

    const userIds = new Set<string>();
    (likes || []).forEach((l: any) => userIds.add(l.user_id));
    (comments || []).forEach((c: any) => userIds.add(c.user_id));

    const { data: users } = await sb.from('users').select('id, first_name, last_name').in('id', [...userIds]);
    const nameById: Record<string, string> = {};
    (users || []).forEach((u: any) => { nameById[u.id] = `${u.first_name} ${u.last_name}`.trim() || 'Someone'; });

    (likes || []).forEach((l: any) => activity.push({
      type: 'like', actorName: nameById[l.user_id] || 'Someone',
      articleTitle: titleById[l.article_id] || 'your article', createdAt: l.created_at,
    }));
    (comments || []).forEach((c: any) => activity.push({
      type: 'comment', actorName: nameById[c.user_id] || 'Someone',
      articleTitle: titleById[c.article_id] || 'your article',
      excerpt: (c.content || '').slice(0, 90), createdAt: c.created_at,
    }));
  }

  const [{ data: follows }, { data: earnings }] = await Promise.all([
    sb.from('follows').select('created_at, follower_id').eq('following_id', user.id)
      .order('created_at', { ascending: false }).limit(5),
    sb.from('earnings').select('created_at, amount_usd, article_id').eq('author_id', user.id)
      .order('created_at', { ascending: false }).limit(5),
  ]);

  if (follows?.length) {
    const ids2 = follows.map((f: any) => f.follower_id);
    const { data: fusers } = await sb.from('users').select('id, first_name, last_name').in('id', ids2);
    const fnameById: Record<string, string> = {};
    (fusers || []).forEach((u: any) => { fnameById[u.id] = `${u.first_name} ${u.last_name}`.trim() || 'Someone'; });
    follows.forEach((f: any) => activity.push({
      type: 'follow', actorName: fnameById[f.follower_id] || 'Someone', createdAt: f.created_at,
    }));
  }

  (earnings || []).forEach((e: any) => activity.push({
    type: 'earn', amountUsd: Number(e.amount_usd || 0),
    articleTitle: titleById[e.article_id] || 'your article', createdAt: e.created_at,
  }));

  activity.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ activity: activity.slice(0, 8) });
});
