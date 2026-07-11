import { NextResponse } from 'next/server';
import { createSupabaseContext } from '@/lib/supabase/context';

const articleSelect = 'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, like_count, comment_count, share_count, published_at, tags, category:categories!category_id(name, slug), author:users!author_id(id, first_name, last_name, username, avatar_url)';

export async function GET() {
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;

  const [featured, topLiked] = await Promise.all([
    sb.from('articles').select(articleSelect)
      .eq('status', 'published').eq('is_featured', true)
      .order('published_at', { ascending: false }).limit(5),
    sb.from('articles').select(articleSelect)
      .eq('status', 'published')
      .order('like_count', { ascending: false }).limit(5),
  ]);

  const seen = new Set<string>();
  const slides = [...(featured.data || []), ...(topLiked.data || [])].filter((a: any) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return NextResponse.json({ slides: slides.slice(0, 6) });
}
