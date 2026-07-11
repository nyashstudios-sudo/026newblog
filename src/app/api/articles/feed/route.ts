import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { cacheGet, cacheSet } from '@/lib/redis';

const articleSelect = 'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, like_count, comment_count, share_count, published_at, tags, category:categories!category_id(name, slug), author:users!author_id(id, first_name, last_name, username, avatar_url)';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const tab = searchParams.get('tab') || 'recent';

  const user = await getCurrentUser();
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;
  let articles;

  if (tab === 'foryou' && user) {
    const { data: ctx2 } = await createSupabaseContext({ auth: 'secret' });
    if (!ctx2) return NextResponse.json({ error: 'Server error' }, { status: 500 });
    const admin = ctx2.supabaseAdmin as any;

    const { data: interests } = await admin.from('user_interests').select('category_id').eq('user_id', user.id);
    const { data: following } = await admin.from('follows').select('following_id').eq('follower_id', user.id);

    const categoryIds = (interests || []).map((i: any) => i.category_id);
    const authorIds = (following || []).map((f: any) => f.following_id);

    let query = sb.from('articles').select(articleSelect)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (categoryIds.length || authorIds.length) {
      const ors: string[] = [];
      if (categoryIds.length) ors.push(`category_id.in.(${categoryIds.join(',')})`);
      if (authorIds.length) ors.push(`author_id.in.(${authorIds.join(',')})`);
      query = query.or(ors.join(','));
    }

    const { data: data1 } = await query;
    articles = data1;

    if (!articles || articles.length === 0) {
      const { data: data2 } = await sb.from('articles').select(articleSelect)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      articles = data2;
    }
  } else if (tab === 'popular') {
    const cacheKey = `feed:popular:page${page}`;
    const cached = await cacheGet<{ articles: unknown[] }>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, page, hasMore: cached.articles.length === limit });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: data2 } = await sb.from('articles').select(articleSelect)
      .eq('status', 'published')
      .gte('published_at', weekAgo)
      .order('like_count', { ascending: false })
      .order('view_count', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    articles = data2;

    await cacheSet(cacheKey, { articles }, 300);
  } else {
    const { data: data2 } = await sb.from('articles').select(articleSelect)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    articles = data2;
  }

  return NextResponse.json({ articles: articles || [], page, hasMore: (articles?.length || 0) === limit });
}
