import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://glmrranchflzuxvjthli.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXJyYW5jaGZsenV4dmp0aGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY5ODMzNCwiZXhwIjoyMDk5Mjc0MzM0fQ.aXtvIZXphf4t_j39wJEaPrWzH1p0iMGBjeWxvEX9Quc'
);

import Parser from 'rss-parser';
const parser = new Parser({ timeout: 15000, headers: { 'User-Agent': '026Newsblog/1.0' } });

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) + '-' + Date.now().toString(36);
}

async function fetchFeed(feed: any) {
  try {
    const parsed = await parser.parseURL(feed.url);
    let imported = 0;
    for (const item of parsed.items.slice(0, 15)) {
      if (!item.guid && !item.link) continue;
      const guid = item.guid || item.link!;
      const { error } = await sb.from('rss_items').insert({
        feed_id: feed.id,
        guid,
        title: item.title || 'Untitled',
        url: item.link || '',
        description: item.contentSnippet || item.content?.slice(0, 500) || '',
        author: item.creator || parsed.title,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      });
      if (!error) imported++;
    }
    await sb.from('rss_feeds').update({
      last_fetched_at: new Date().toISOString(),
      last_error: null,
    }).eq('id', feed.id);
    console.log(`  ✅ ${feed.name}: ${imported} items`);
    return imported;
  } catch (error: any) {
    console.log(`  ❌ ${feed.name}: ${error.message}`);
    await sb.from('rss_feeds').update({ last_error: error.message, status: 'error' }).eq('id', feed.id);
    return 0;
  }
}

async function main() {
  console.log('📥 Fetching all RSS feeds...\n');
  const { data: feeds } = await sb.from('rss_feeds').select('*').eq('status', 'active');
  let total = 0;
  for (const feed of feeds || []) {
    total += await fetchFeed(feed);
  }
  console.log(`\n📊 Total items fetched: ${total}`);
  console.log('\n📝 Importing as published articles...');

  const { data: items } = await sb.from('rss_items')
    .select('*, feed:rss_feeds!feed_id(name, category_id)')
    .order('published_at', { ascending: false })
    .limit(100);

  const { data: sysAuthor } = await sb.from('users').select('id').eq('email', 'author@demo.com').maybeSingle();
  if (!sysAuthor) { console.error('❌ No system author'); return; }

  const { data: existing } = await sb.from('articles').select('source_url').not('source_url', 'is', null);
  const existingUrls = new Set((existing || []).map(a => a.source_url));

  let imported = 0;
  for (const item of items || []) {
    if (existingUrls.has(item.url)) continue;

    let coverImageUrl = null;
    if (item.description) {
      const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) coverImageUrl = imgMatch[1];
    }

    const title = (item.title || 'Untitled').slice(0, 255);
    const contentText = item.description || item.title || '';
    const wordCount = contentText.split(' ').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const slug = slugify(title);

    try {
      await sb.from('articles').insert({
        author_id: sysAuthor.id,
        title,
        slug,
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: contentText }] }] },
        content_html: `<p>${contentText}</p><hr><p><em>Sourced from <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.feed?.name || 'external source'}</a></em></p>`,
        excerpt: contentText.slice(0, 250),
        category_id: item.feed?.category_id,
        tags: JSON.stringify(['sourced', (item.feed?.name || 'external').toLowerCase().replace(/\s+/g, '-')]),
        status: 'published',
        reading_time_minutes: readingTime,
        word_count: wordCount,
        source_name: item.feed?.name || 'External',
        source_url: item.url,
        cover_image_url: coverImageUrl,
        published_at: item.published_at || new Date().toISOString(),
        is_featured: false,
        view_count: 0, like_count: 0, comment_count: 0, share_count: 0,
      });
      imported++;
      process.stdout.write('.');
    } catch (e: any) {
      if (!e.message?.includes('duplicate')) console.error('\n❌', e.message);
    }
  }
  console.log(`\n✅ Imported ${imported} articles from RSS`);
}

main().catch(console.error);