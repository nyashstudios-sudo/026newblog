import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole(['author', 'admin'], async (_req, user) => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: articles }, { data: earnings }] = await Promise.all([
    sb.from('articles').select('id, title, slug, status, view_count, like_count, comment_count, share_count, published_at')
      .eq('author_id', user.id).order('view_count', { ascending: false }).limit(10),
    sb.from('earnings').select('amount_usd').eq('author_id', user.id).gte('created_at', thirtyDaysAgo),
  ]);

  const totals = (articles || []).reduce(
    (acc: { views: number; likes: number; comments: number; shares: number }, a: any) => ({
      views: acc.views + Number(a.view_count || 0),
      likes: acc.likes + (a.like_count || 0),
      comments: acc.comments + (a.comment_count || 0),
      shares: acc.shares + (a.share_count || 0),
    }),
    { views: 0, likes: 0, comments: 0, shares: 0 }
  );

  const monthlyEarnings = (earnings || []).reduce((sum: number, e: any) => sum + Number(e.amount_usd || 0), 0);

  const dailyViews: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyViews.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }

  const { data: viewRecords } = await sb.from('article_views')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo);

  (viewRecords || []).forEach((v: any) => {
    const key = new Date(v.created_at).toISOString().slice(0, 10);
    const entry = dailyViews.find((d) => d.date === key);
    if (entry) entry.count += 1;
  });

  return NextResponse.json({
    totals,
    monthlyEarnings,
    topArticles: articles || [],
    dailyViews,
  });
});
