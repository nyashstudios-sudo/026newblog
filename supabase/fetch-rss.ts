import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';

const sb = createClient(
  'https://glmrranchflzuxvjthli.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXJyYW5jaGZsenV4dmp0aGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk4NzY5NywiZXhwIjoyMDYyNTYzNjk3fQ.N7hBrZeuOCcDX_vtbWFjG24MmKLqVjfIPe9B_ReUq3c'
);

const parser = new Parser({ timeout: 15000, headers: { 'User-Agent': '026Newsblog RSS Reader/1.0' } });

async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    let imported = 0;
    for (const item of parsed.items.slice(0, 20)) {
      if (!item.guid && !item.link) continue;
      const guid = item.guid || item.link!;
      const { error } = await sb.from('rss_items').upsert({
        feed_id: feed.id,
        guid,
        title: item.title || 'Untitled',
        url: item.link || '',
        description: item.contentSnippet || item.content?.slice(0, 500),
        author: item.creator || parsed.title,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      }, { onConflict: 'feed_id,guid' });
      if (!error) imported++;
    }
    await sb.from('rss_feeds').update({ last_fetched_at: new Date().toISOString() }).eq('id', feed.id);
    return imported;
  } catch (e) {
    await sb.from('rss_feeds').update({ last_error: e.message, status: 'error' }).eq('id', feed.id);
    return 0;
  }
}

async function main() {
  const { data: feeds } = await sb.from('rss_feeds').select('id, name, url').eq('status', 'active');
  console.log('Fetching', feeds?.length, 'feeds...');
  
  let total = 0;
  for (const feed of feeds || []) {
    const n = await fetchFeed(feed);
    console.log('  ✓', feed.name, ':', n, 'items');
    total += n;
  }
  console.log('Total new items:', total);
}
main().catch(console.error);