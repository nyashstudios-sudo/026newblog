import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const GET = requireRole(['reader', 'author', 'admin'], async (_req, user) => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;
  const userId = user.id;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const twentyEightDaysAgo = new Date(todayStart);
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 27);

  const [
    { data: streakRow },
    { data: goalsRow },
    { data: allSessions },
    { data: recent28 },
    commentsRes,
    likesRes,
  ] = await Promise.all([
    sb.from('reading_streaks').select('current_streak, longest_streak, last_read_date').eq('user_id', userId).maybeSingle(),
    sb.from('reading_goals').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('reading_sessions').select('article_id, duration_seconds').eq('user_id', userId),
    sb.from('reading_sessions').select('article_id, duration_seconds, created_at').eq('user_id', userId).gte('created_at', twentyEightDaysAgo.toISOString()),
    sb.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    sb.from('article_likes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  const commentCount = commentsRes.count ?? 0;
  const likeCount = likesRes.count ?? 0;

  const streak = {
    current: streakRow?.current_streak ?? 0,
    longest: streakRow?.longest_streak ?? 0,
    lastReadDate: streakRow?.last_read_date ?? null,
  };

  const uniqueArticles = new Set((allSessions || []).map((s: any) => s.article_id));
  const totalMinutes = Math.round((allSessions || []).reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0) / 60);

  const totals = {
    articlesRead: uniqueArticles.size,
    readingTimeMinutes: totalMinutes,
    commentsPosted: commentCount,
    articlesLiked: likeCount,
  };

  const activityMap = new Map<string, number>();
  for (let i = 0; i < 28; i++) {
    const d = new Date(twentyEightDaysAgo);
    d.setDate(d.getDate() + i);
    activityMap.set(d.toISOString().split('T')[0], 0);
  }
  for (const s of recent28 || []) {
    const day = new Date(s.created_at).toISOString().split('T')[0];
    if (activityMap.has(day)) {
      activityMap.set(day, (activityMap.get(day) || 0) + 1);
    }
  }
  const weeklyActivity = Array.from(activityMap.values());

  let categoryBreakdown: Array<{ name: string; pct: number; count: number; color: string }> = [];
  const articleIds = [...new Set((allSessions || []).map((s: any) => s.article_id))];

  if (articleIds.length > 0) {
    const { data: articles } = await sb
      .from('articles')
      .select('id, category:categories(name)')
      .in('id', articleIds);

    const articleCatMap = new Map<string, string>();
    for (const a of articles || []) {
      if (a.category) articleCatMap.set(a.id, a.category.name);
    }

    const catCounts = new Map<string, number>();
    for (const s of allSessions || []) {
      const cat = articleCatMap.get(s.article_id);
      if (cat) catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
    }

    const totalCatSessions = [...catCounts.values()].reduce((a: number, b: number) => a + b, 0);
    const colors = ['oklch(45% 0.12 200)', 'oklch(55% 0.14 55)', 'oklch(50% 0.12 145)', 'oklch(50% 0.14 310)', 'oklch(55% 0.12 25)'];

    categoryBreakdown = [...catCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        name,
        pct: totalCatSessions > 0 ? Math.round((count / totalCatSessions) * 100) : 0,
        count,
        color: colors[i % colors.length],
      }));
  }

  const [{ data: weekSessions }, { data: weekCommentsRes }] = await Promise.all([
    sb.from('reading_sessions').select('article_id, duration_seconds, created_at').eq('user_id', userId).gte('created_at', weekStart.toISOString()),
    sb.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekStart.toISOString()),
  ]);

  const weekCommentsCount = weekCommentsRes?.count ?? 0;
  const todaySessions = (weekSessions || []).filter((s: any) => new Date(s.created_at) >= todayStart);
  const weekMinutes = Math.round((weekSessions || []).reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0) / 60);

  const weekArticleIds = [...new Set((weekSessions || []).map((s: any) => s.article_id))];
  let weekNewTopics = 0;
  if (weekArticleIds.length > 0) {
    const { data: weekArticles } = await sb
      .from('articles')
      .select('category_id')
      .in('id', weekArticleIds);
    weekNewTopics = new Set((weekArticles || []).map((a: any) => a.category_id).filter(Boolean)).size;
  }

  const goals = {
    dailyArticles: { current: todaySessions.length, target: goalsRow?.daily_articles ?? 5 },
    weeklyMinutes: { current: weekMinutes, target: goalsRow?.weekly_minutes ?? 120 },
    comments: { current: weekCommentsCount, target: goalsRow?.weekly_comments ?? 10 },
    newTopics: { current: weekNewTopics, target: goalsRow?.weekly_new_topics ?? 3 },
  };

  const sessionCounts = new Map<string, { count: number; totalMinutes: number }>();
  for (const s of allSessions || []) {
    const e = sessionCounts.get(s.article_id) || { count: 0, totalMinutes: 0 };
    e.count += 1;
    e.totalMinutes += Math.round((s.duration_seconds || 0) / 60);
    sessionCounts.set(s.article_id, e);
  }

  const topIds = [...sessionCounts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([id]) => id);

  let mostRead: Array<{ rank: number; title: string; author: string; readCount: number; totalMinutes: number }> = [];
  if (topIds.length > 0) {
    const { data: topArticles } = await sb
      .from('articles')
      .select('id, title, author:users(first_name, last_name)')
      .in('id', topIds);

    const artMap = new Map<string, any>((topArticles || []).map((a: any) => [a.id, a]));
    mostRead = [...sessionCounts.entries()]
      .filter(([id]) => topIds.includes(id))
      .sort((a, b) => b[1].count - a[1].count)
      .map(([id, stats], i) => {
        const art = artMap.get(id) as any;
        const author = art?.author;
        return {
          rank: i + 1,
          title: art?.title ?? 'Unknown',
          author: author ? `${author.first_name} ${author.last_name}`.trim() : 'Unknown',
          readCount: stats.count,
          totalMinutes: stats.totalMinutes,
        };
      });
  }

  return NextResponse.json({
    streak,
    totals,
    weeklyActivity,
    categoryBreakdown,
    goals,
    mostRead,
  });
});
