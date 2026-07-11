import { NextResponse } from 'next/server';
import { createSupabaseContext } from '@/lib/supabase/context';

const articleSelect = 'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, like_count, comment_count, share_count, published_at, tags, category:categories!category_id(name, slug), author:users!author_id(id, first_name, last_name, username, avatar_url)';

export async function GET() {
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: articles } = await (ctx.supabase as any)
    .from('articles')
    .select(articleSelect)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(6);

  const trending = (articles || []).map((a: any) => {
    const author = a.author ? `${a.author.first_name} ${a.author.last_name}`.trim() : 'Unknown';
    const views = Number(a.view_count || 0);
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      meta: `${author} · ${views.toLocaleString()} views`,
    };
  });

  return NextResponse.json({ trending });
}
