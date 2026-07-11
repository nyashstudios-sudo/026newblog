import { NextResponse } from 'next/server';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { generateArticleSlug, countWords, estimateReadingTime } from '@/lib/utils';

const articleSelect = 'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, like_count, comment_count, share_count, published_at, tags, category:categories!category_id(name, slug), author:users!author_id(id, first_name, last_name, username, avatar_url)';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const category = searchParams.get('category');
  const author = searchParams.get('author');
  const sort = searchParams.get('sort') || 'published_at';
  const isOwn = searchParams.get('own') === 'true';

  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  let query = (ctx.supabase as any)
    .from('articles')
    .select(articleSelect, { count: 'exact' });

  if (!author || !isOwn) {
    query = query.eq('status', 'published');
  }
  if (author && !isOwn) {
    query = query.eq('author.username', author);
  }
  if (author && isOwn) {
    // For own articles, show all statuses
  }
  if (category) {
    query = query.eq('category.slug', category);
  }

  if (sort === 'popular') query = query.order('view_count', { ascending: false });
  else if (sort === 'likes') query = query.order('like_count', { ascending: false });
  else query = query.order('published_at', { ascending: false });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data: articles, count } = await query.range(from, to);

  return NextResponse.json({
    articles: articles || [],
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  });
}

export const POST = requireAuth(async (req, user) => {
  if (!['author', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const wordCount = body.wordCount ?? countWords(body.contentHtml || '');
  const slug = body.slug || generateArticleSlug(body.title);

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: article } = await (ctx.supabaseAdmin as any)
    .from('articles')
    .insert({
      author_id: user.id,
      title: body.title,
      subtitle: body.subtitle,
      slug,
      content: body.content || {},
      content_html: body.contentHtml,
      excerpt: body.excerpt,
      cover_image_url: body.coverImageUrl,
      cover_image_caption: body.coverImageCaption,
      category_id: body.categoryId,
      tags: JSON.stringify(body.tags || []),
      meta_description: body.metaDescription,
      reading_time_minutes: estimateReadingTime(wordCount),
      word_count: wordCount,
      status: body.status || 'draft',
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  return NextResponse.json({ article }, { status: 201 });
});
