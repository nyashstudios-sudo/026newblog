import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { fetchRssFeed } from '@/lib/rss';

export const GET = requireRole('admin', async (req) => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  // Get all feeds with stats
  const { data: feeds } = await sb
    .from('rss_feeds')
    .select('*, category:categories(name, slug)')
    .order('created_at', { ascending: false });

  // Get aggregate stats
  const { count: totalFeeds } = await sb.from('rss_feeds').select('*', { count: 'exact', head: true });
  const { count: activeFeeds } = await sb.from('rss_feeds').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: pausedFeeds } = await sb.from('rss_feeds').select('*', { count: 'exact', head: true }).eq('status', 'paused');
  const { count: errorFeeds } = await sb.from('rss_feeds').select('*', { count: 'exact', head: true }).eq('status', 'error');
  const { count: totalItems } = await sb.from('rss_items').select('*', { count: 'exact', head: true });

  // Get today's items
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: itemsToday } = await sb
    .from('rss_items')
    .select('*', { count: 'exact', head: true })
    .gte('imported_at', todayStart.toISOString());

  // Get items imported as articles
  const { data: feedsWithUrl } = await sb.from('rss_feeds').select('url');
  const feedUrls = (feedsWithUrl || []).map((f: any) => f.url);
  let itemsImportedAsArticles = 0;
  if (feedUrls.length > 0) {
    const { count } = await sb
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .in('source_url', feedUrls);
    itemsImportedAsArticles = count || 0;
  }

  // Get recent items across all feeds
  const { data: recentItems } = await sb
    .from('rss_items')
    .select('id, title, feed_id, feed:rss_feeds!feed_id(name), imported_at')
    .order('imported_at', { ascending: false })
    .limit(5);

  const stats = {
    totalFeeds: totalFeeds || 0,
    activeFeeds: activeFeeds || 0,
    pausedFeeds: pausedFeeds || 0,
    errorFeeds: errorFeeds || 0,
    totalItems: totalItems || 0,
    itemsToday: itemsToday || 0,
    itemsImportedAsArticles,
  };

  return NextResponse.json({ feeds: feeds || [], stats, recentItems: recentItems || [] });
});