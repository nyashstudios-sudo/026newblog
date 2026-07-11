import { NextResponse } from 'next/server';
import { createSupabaseContext } from '@/lib/supabase/context';

export async function GET() {
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: categories } = await (ctx.supabase as any)
    .from('categories')
    .select('id, name, slug, description, icon, article_count')
    .order('article_count', { ascending: false });

  return NextResponse.json({ categories: categories || [] });
}
