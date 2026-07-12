import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function importRss() {
  // Get RSS items
  const { data: items, error } = await supabase
    .from('rss_items')
    .select('*, feed:rss_feeds!feed_id(name, category_id)')
    .order('published_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error fetching items:', error);
    return;
  }
  
  console.log('Found items:', items?.length);
  
  // Get system author (ada@026news.com - author role)
  const { data: sysAuthor } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'ada@026news.com')
    .maybeSingle();
  
  if (!sysAuthor) {
    console.log('System author not found');
    return;
  }
  
  console.log('Using author:', sysAuthor.id);
  
  // Get existing source URLs
  const { data: existing } = await supabase
    .from('articles')
    .select('source_url')
    .not('source_url', 'is', null);
  const existingUrls = new Set((existing || []).map(a => a.source_url));
  
  let imported = 0;
  for (const item of items || []) {
    if (existingUrls.has(item.url)) continue;
    
    // Try to extract image from description
    let coverImageUrl: string | null = null;
    if (item.description) {
      const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) coverImageUrl = imgMatch[1];
    }
    
    // Fetch article page for og:image
    if (!coverImageUrl) {
      try {
        const resp = await fetch(item.url, { headers: { 'User-Agent': '026Newsblog/1.0' } });
        const html = await resp.text();
        const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (ogMatch) coverImageUrl = ogMatch[1];
        else {
          const twitterMatch = html.match(/<meta name="twitter:image" content="([^"]+)"/i);
          if (twitterMatch) coverImageUrl = twitterMatch[1];
          else {
            const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) coverImageUrl = imgMatch[1];
          }
        }
      } catch (e) {
        console.log('Fetch failed for', item.url);
      }
    }
    
    const title = (item.title || 'Untitled').slice(0, 255);
    const contentText = item.description || item.title || '';
    const wordCount = contentText.split(' ').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    
    try {
      const { error: insertError } = await supabase.from('articles').insert({
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
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
      });
      
      if (insertError) {
        if (!insertError.message?.includes('duplicate')) console.error('Insert error:', insertError.message);
      } else {
        imported++;
        console.log('Imported:', title, '| Image:', coverImageUrl ? 'YES' : 'NO');
      }
    } catch (e: any) {
      if (!e.message?.includes('duplicate')) console.error('Import error:', e.message);
    }
  }
  
  console.log('Total imported:', imported);
}

importRss().catch(console.error);