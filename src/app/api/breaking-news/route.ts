import { NextResponse } from 'next/server';
import { createSupabaseContext } from '@/lib/supabase/context';

export async function GET() {
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: articles } = await (ctx.supabase as any)
    .from('articles')
    .select('id, title, slug')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(10);

  const items = (articles || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
  }));

  return NextResponse.json({ items });
}
