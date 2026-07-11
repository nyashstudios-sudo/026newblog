import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole('admin', async () => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [userCount, authorCount, articleCount, publishedCount, pendingApps, recentUsers, securityEvents, topArticles] = await Promise.all([
    sb.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author').eq('is_active', true),
    sb.from('articles').select('*', { count: 'exact', head: true }),
    sb.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    sb.from('author_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('users').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    sb.from('security_events').select('*, user:users(username, email)').order('created_at', { ascending: false }).limit(10),
    sb.from('articles').select('id, title, slug, view_count, like_count, author:users!author_id(first_name, last_name, username)').eq('status', 'published').order('view_count', { ascending: false }).limit(5),
  ]);

  const { data: viewSum } = await sb.from('articles').select('view_count');
  const totalViews = (viewSum || []).reduce((sum: number, a: any) => sum + Number(a.view_count || 0), 0);

  const { data: earningSum } = await sb.from('earnings').select('amount_usd');
  const totalEarnings = (earningSum || []).reduce((sum: number, e: any) => sum + Number(e.amount_usd || 0), 0);

  const { data: payoutSum } = await sb.from('payouts').select('amount_usd').eq('status', 'completed');
  const totalPayouts = (payoutSum || []).reduce((sum: number, p: any) => sum + Number(p.amount_usd || 0), 0);

  return NextResponse.json({
    overview: {
      users: userCount.count || 0,
      authors: authorCount.count || 0,
      articles: articleCount.count || 0,
      published: publishedCount.count || 0,
      pendingApplications: pendingApps.count || 0,
      totalViews,
      totalEarnings,
      totalPayouts,
      newUsers30d: recentUsers.count || 0,
    },
    topArticles: topArticles.data || [],
    securityEvents: securityEvents.data || [],
  });
});
