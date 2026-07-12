import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { fetchRssFeed } from '@/lib/rss';

export const POST = requireRole('admin', async (req) => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() || '';
  if (!id) return NextResponse.json({ error: 'Feed ID required' }, { status: 400 });

  try {
    const result = await fetchRssFeed(id);
    return NextResponse.json({ imported: result.imported, error: result.error });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch feed';
    return NextResponse.json({ imported: 0, error: message }, { status: 200 });
  }
});