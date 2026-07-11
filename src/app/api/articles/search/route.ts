import { NextResponse } from 'next/server';
import { createSupabaseContext } from '@/lib/supabase/context';

const articleSelect = 'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, like_count, published_at, category:categories!category_id(name, slug), author:users!author_id(id, first_name, last_name, username, avatar_url)';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (q.length < 2) {
    return NextResponse.json({ articles: [], query: q });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabase as any;
  const tsquery = q.split(/\s+/).map((w: string) => w + ':*').join(' & ');

  const { data: articles } = await sb.from('articles').select(articleSelect)
    .eq('status', 'published')
    .textSearch('title', tsquery, { config: 'english' })
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  return NextResponse.json({ articles: articles || [], query: q });
}
