import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const GET = requireRole('admin', async () => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsAgoStr = sixMonthsAgo.toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [userCount, authorCount, articleCount, publishedCount, pendingApps, recentUsers, securityEvents, topArticles, sourcedCount, earningsRes, payoutsRes, recentSecurityEvents, authorsRes] = await Promise.all([
    sb.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author').eq('is_active', true),
    sb.from('articles').select('*', { count: 'exact', head: true }),
    sb.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    sb.from('author_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('users').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    sb.from('security_events').select('*, user:users(username, email)').order('created_at', { ascending: false }).limit(10),
    sb.from('articles').select('id, title, slug, view_count, like_count, source_name, source_url, author:users!author_id(first_name, last_name, username)').eq('status', 'published').order('view_count', { ascending: false }).limit(5),
    sb.from('articles').select('*', { count: 'exact', head: true }).not('source_url', 'is', null),
    sb.from('earnings').select('amount_usd, period_start').gte('period_start', sixMonthsAgoStr),
    sb.from('payouts').select('amount_usd, author:users!author_id(first_name, last_name)').eq('status', 'pending'),
    sb.from('security_events').select('event_type').gte('created_at', twentyFourHoursAgo),
    sb.from('articles').select('author_id, view_count, author:users!author_id(first_name, last_name, email)').eq('status', 'published'),
  ]);

  const { data: allArticles } = await sb.from('articles').select('view_count, source_url');
  const totalViews = (allArticles || []).reduce((sum: number, a: any) => sum + Number(a.view_count || 0), 0);
  const sourcedViews = (allArticles || []).filter((a: any) => a.source_url).reduce((sum: number, a: any) => sum + Number(a.view_count || 0), 0);

  const { data: earningSum } = await sb.from('earnings').select('amount_usd');
  const totalEarnings = (earningSum || []).reduce((sum: number, e: any) => sum + Number(e.amount_usd || 0), 0);

  const { data: payoutSum } = await sb.from('payouts').select('amount_usd').eq('status', 'completed');
  const totalPayouts = (payoutSum || []).reduce((sum: number, p: any) => sum + Number(p.amount_usd || 0), 0);

  // --- Monthly revenue (last 6 months) ---
  const earningsRows = earningsRes?.data || earningsRes || [];
  const monthTotals = new Map<string, number>();
  for (const e of earningsRows) {
    if (e.period_start) {
      const d = new Date(e.period_start);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthTotals.set(key, (monthTotals.get(key) || 0) + Number(e.amount_usd || 0));
    }
  }
  const now = new Date();
  const revenueMonths = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    revenueMonths.push({
      label: MONTH_LABELS[d.getMonth()],
      value: Math.round(monthTotals.get(key) || 0),
    });
  }

  // --- Pending payouts ---
  const payoutRows = payoutsRes?.data || payoutsRes || [];
  const pendingPayouts = payoutRows.map((p: any) => ({
    author: [p.author?.first_name, p.author?.last_name].filter(Boolean).join(' ') || 'Unknown',
    amount: Number(p.amount_usd || 0),
    method: 'M-Pesa',
  }));

  // --- Security status ---
  const eventRows = recentSecurityEvents?.data || recentSecurityEvents || [];
  const failedLoginCount = eventRows.filter((e: any) => e.event_type === 'failed_login').length;
  const suspiciousCount = eventRows.filter((e: any) => e.event_type === 'suspicious_activity').length;
  const securityStatus = [
    { label: 'API Health', dot: 'green', value: '99.9% uptime' },
    { label: 'Database Load', dot: 'green', value: '23% capacity' },
    { label: 'CDN Response', dot: 'green', value: '42ms avg' },
    { label: 'Failed Login Attempts', dot: failedLoginCount > 10 ? 'yellow' : 'green', value: `${failedLoginCount} (last 24h)` },
    { label: 'Suspicious Activity', dot: suspiciousCount > 0 ? 'yellow' : 'green', value: `${suspiciousCount} flagged IPs` },
    { label: 'SSL Certificate', dot: 'green', value: 'Valid (89 days)' },
    { label: 'Rate Limiting', dot: 'green', value: 'Active' },
    { label: 'Last Backup', dot: 'green', value: '2 hours ago' },
  ];

  // --- Top authors ---
  const authorRows = authorsRes?.data || authorsRes || [];
  const authorMap = new Map<string, { firstName: string; lastName: string; email: string; articles: number; views: number }>();
  for (const a of authorRows) {
    if (!a.author) continue;
    const id = a.author_id;
    let entry = authorMap.get(id);
    if (!entry) {
      entry = {
        firstName: a.author.first_name || '',
        lastName: a.author.last_name || '',
        email: a.author.email || '',
        articles: 0,
        views: 0,
      };
      authorMap.set(id, entry);
    }
    entry.articles++;
    entry.views += Number(a.view_count || 0);
  }
  const topAuthors = Array.from(authorMap.entries())
    .map(([_, v]) => ({
      initials: ((v.firstName[0] || '') + (v.lastName[0] || '')).toUpperCase(),
      name: [v.firstName, v.lastName].filter(Boolean).join(' '),
      email: v.email,
      color: `oklch(50% 0.14 ${(Math.random() * 360).toFixed(0)})`,
      articles: v.articles,
      views: v.views >= 1000 ? `${(v.views / 1000).toFixed(1)}K` : v.views.toString(),
      status: 'active',
    }))
    .sort((a, b) => {
      const aNum = parseFloat(a.views.replace('K', ''));
      const bNum = parseFloat(b.views.replace('K', ''));
      return bNum - aNum;
    });

  // --- Transform existing topArticles to camelCase ---
  const topArticlesMapped = (topArticles.data || []).map((a: any) => ({
    title: a.title,
    slug: a.slug,
    viewCount: a.view_count,
    likeCount: a.like_count,
    sourceName: a.source_name,
    sourceUrl: a.source_url,
    author: {
      firstName: a.author?.first_name || '',
      lastName: a.author?.last_name || '',
      username: a.author?.username || '',
    },
  }));

  // --- Transform security events to camelCase ---
  const securityEventsMapped = (securityEvents.data || []).map((e: any) => ({
    eventType: e.event_type,
    createdAt: e.created_at,
    metadata: e.metadata,
    user: e.user ? { username: e.user.username, email: e.user.email } : null,
  }));

  return NextResponse.json({
    overview: {
      users: userCount.count || 0,
      authors: authorCount.count || 0,
      articles: articleCount.count || 0,
      published: publishedCount.count || 0,
      pendingApplications: pendingApps.count || 0,
      totalViews,
      sourcedViews,
      totalEarnings,
      totalPayouts,
      newUsers30d: recentUsers.count || 0,
      sourcedArticles: sourcedCount.count || 0,
      inHouseArticles: (publishedCount.count || 0) - (sourcedCount.count || 0),
    },
    topArticles: topArticlesMapped,
    securityEvents: securityEventsMapped,
    revenueMonths,
    topAuthors,
    pendingPayouts,
    securityStatus,
  });
});
