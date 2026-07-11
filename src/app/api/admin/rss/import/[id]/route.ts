import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

export const POST = requireRole('admin', async (req) => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() || '';
  if (!id) return NextResponse.json({ error: 'Feed ID required' }, { status: 400 });

  const sb = ctx.supabaseAdmin as any;

  const { data: feed } = await sb.from('rss_feeds').select('*').eq('id', id).single();
  if (!feed) return NextResponse.json({ error: 'Feed not found' }, { status: 404 });

  const { data: items } = await sb
    .from('rss_items')
    .select('*')
    .eq('feed_id', id)
    .order('published_at', { ascending: false })
    .limit(20);

  if (!items?.length) return NextResponse.json({ imported: 0, message: 'No items to import' });

  const { data: sysAuthor } = await sb
    .from('users')
    .select('id')
    .eq('email', 'author@demo.com')
    .maybeSingle();

  if (!sysAuthor) return NextResponse.json({ error: 'System author not found' }, { status: 500 });

  const { data: existingSources } = await sb
    .from('articles')
    .select('source_url')
    .not('source_url', 'is', null);
  const existingUrls = new Set((existingSources || []).map((a: any) => a.source_url));

  let imported = 0;
  for (const item of items) {
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
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    try {
      await sb.from('articles').insert({
        author_id: sysAuthor.id,
        title,
        slug,
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: contentText }] }],
        },
        content_html: `<p>${contentText}</p><hr><p><em>Sourced from <a href="${item.url}" target="_blank" rel="noopener noreferrer">${feed.name}</a></em></p>`,
        excerpt: contentText.slice(0, 250),
        category_id: feed.category_id,
        tags: JSON.stringify(['sourced', feed.name.toLowerCase().replace(/\s+/g, '-')]),
        status: 'published',
        reading_time_minutes: readingTime,
        word_count: wordCount,
        source_name: feed.name,
        source_url: item.url,
        cover_image_url: coverImageUrl,
        published_at: item.published_at || new Date().toISOString(),
        is_featured: false,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
      });
      imported++;
    } catch (e: any) {
      if (!e.message?.includes('duplicate')) console.error('Import error:', e);
    }
  }

  return NextResponse.json({ imported, message: `Imported ${imported} articles from ${feed.name}` });
});