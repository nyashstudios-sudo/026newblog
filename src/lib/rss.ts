import Parser from 'rss-parser';
import { createSupabaseContext } from '@/lib/supabase/context';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': '026Newsblog RSS Reader/1.0' },
});

async function getSb() {
  const { data: ctx, error } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) throw new Error((error as Error)?.message || 'Database connection unavailable');
  return ctx.supabaseAdmin as any;
}

export async function fetchRssFeed(feedId: string) {
  const sb = await getSb();
  const { data: feed } = await sb.from('rss_feeds').select('*').eq('id', feedId).single();
  if (!feed || feed.status !== 'active') return { imported: 0 };

  try {
    const parsed = await parser.parseURL(feed.url);
    let imported = 0;

    for (const item of parsed.items.slice(0, 20)) {
      if (!item.guid && !item.link) continue;
      const guid = item.guid || item.link!;

      try {
        await sb.from('rss_items').insert({
          feed_id: feed.id,
          guid,
          title: item.title || 'Untitled',
          url: item.link || '',
          description: item.contentSnippet || item.content?.slice(0, 500),
          author: item.creator || parsed.title,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        });
        imported++;
      } catch {
        // Duplicate guid — skip
      }
    }

    await sb.from('rss_feeds').update({
      last_fetched_at: new Date().toISOString(),
      last_error: null,
    }).eq('id', feedId);

    // Increment counters via separate reads/writes since Supabase doesn't have direct increment
    const { data: current } = await sb.from('rss_feeds').select('items_today, total_items_imported').eq('id', feedId).single();
    if (current) {
      await sb.from('rss_feeds').update({
        items_today: (current.items_today || 0) + imported,
        total_items_imported: (current.total_items_imported || 0) + imported,
      }).eq('id', feedId);
    }

    return { imported };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await sb.from('rss_feeds').update({
      last_error: message,
      status: 'error',
    }).eq('id', feedId);
    return { imported: 0, error: message };
  }
}

export async function refreshAllFeeds() {
  const sb = await getSb();
  const { data: feeds } = await sb.from('rss_feeds').select('id').eq('status', 'active');
  const results = await Promise.allSettled((feeds || []).map((f: any) => fetchRssFeed(f.id)));
  return results;
}

export async function getRecentRssItems(limit = 10) {
  const sb = await getSb();
  const { data: items } = await sb.from('rss_items')
    .select('*, feed:rss_feeds!feed_id(name, category:categories(name, slug))')
    .order('imported_at', { ascending: false })
    .limit(limit);
  return items || [];
}
