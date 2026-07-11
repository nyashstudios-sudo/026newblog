import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';
import { fetchRssFeed } from '@/lib/rss';

export const GET = requireRole('admin', async () => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: feeds } = await (ctx.supabaseAdmin as any)
    .from('rss_feeds')
    .select('*, category:categories(name, slug)')
    .order('created_at', { ascending: false });

  return NextResponse.json({ feeds: feeds || [] });
});

export const POST = requireRole('admin', async (req) => {
  const { name, url, categoryId, refreshIntervalMinutes } = await req.json();

  if (!name || !url) {
    return NextResponse.json({ error: 'Name and URL required' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: feed } = await (ctx.supabaseAdmin as any)
    .from('rss_feeds')
    .insert({
      name,
      url,
      category_id: categoryId || null,
      refresh_interval_minutes: refreshIntervalMinutes || 60,
    })
    .select()
    .single();

  if (feed) fetchRssFeed(feed.id).catch(() => {});

  return NextResponse.json({ feed }, { status: 201 });
});

export const PATCH = requireRole('admin', async (req) => {
  const { feedId, status, refreshIntervalMinutes } = await req.json();

  if (!feedId) {
    return NextResponse.json({ error: 'Feed ID required' }, { status: 400 });
  }

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;
  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (refreshIntervalMinutes) updateData.refresh_interval_minutes = refreshIntervalMinutes;

  const { data: feed } = await sb.from('rss_feeds').update(updateData).eq('id', feedId).select().single();

  if (status === 'active' && feed) {
    fetchRssFeed(feed.id).catch(() => {});
  }

  return NextResponse.json({ feed });
});
