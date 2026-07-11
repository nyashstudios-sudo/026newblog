import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) + '-' + Date.now().toString(36);
}

async function main() {
  console.log('Importing RSS items as published articles...\n');

  // Use demo author account for sourced content
  let sysAuthorId: string | null = null;
  const { data: existingAuthor } = await sb.from('users').select('id').eq('email', 'author@demo.com').maybeSingle();
  if (existingAuthor) {
    sysAuthorId = existingAuthor.id;
    console.log('✅ Using demo author account');
  } else {
    console.error('❌ No author account found. Run supabase/seed.ts first.');
    process.exit(1);
  }

  // Get RSS items not yet imported as articles
  const { data: rssItems } = await sb.from('rss_items')
    .select('*, feed:rss_feeds!feed_id(name, category_id)')
    .order('published_at', { ascending: false })
    .limit(50);

  if (!rssItems?.length) { console.log('No RSS items to import'); return; }

  // Get existing article source URLs to avoid duplicates
  const { data: existingSources } = await sb.from('articles')
    .select('source_url')
    .not('source_url', 'is', null);
  const existingUrls = new Set((existingSources || []).map((a) => a.source_url));

  let imported = 0;
  for (const item of rssItems) {
    if (existingUrls.has(item.url)) continue;
    const title = (item.title || 'Untitled').slice(0, 255);
    const contentText = item.description || item.title || '';
    const wordCount = contentText.split(' ').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    try {
      await sb.from('articles').insert({
        author_id: sysAuthorId,
        title,
        slug: slugify(title),
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: contentText }] }],
        },
        content_html: `<p>${contentText}</p><hr><p><em>Sourced from <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.feed?.name || 'external source'}</a></em></p>`,
        excerpt: contentText.slice(0, 250),
        category_id: (item as any).feed?.category_id || null,
        tags: JSON.stringify(['sourced', (item.feed?.name || 'external').toLowerCase().replace(/\s+/g, '-')]),
        status: 'published',
        reading_time_minutes: readingTime,
        word_count: wordCount,
        source_name: item.feed?.name || 'External',
        source_url: item.url,
        published_at: item.published_at || new Date().toISOString(),
        is_featured: false,
        view_count: 0, like_count: 0, comment_count: 0, share_count: 0,
      });
      imported++;
      process.stdout.write('.');
    } catch (e: any) {
      if (!e.message?.includes('duplicate')) process.stdout.write('x');
    }
  }

  console.log(`\n✅ Imported ${imported} sourced articles`);
}

main().catch(console.error);
