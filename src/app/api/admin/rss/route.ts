import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { fetchRssFeed } from '@/lib/rss';

export const GET = requireRole('admin', async () => {
  const feeds = await db.rssFeed.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { items: true } },
    },
  });

  return NextResponse.json({ feeds });
});

export const POST = requireRole('admin', async (req) => {
  const { name, url, categoryId, refreshIntervalMinutes } = await req.json();

  if (!name || !url) {
    return NextResponse.json({ error: 'Name and URL required' }, { status: 400 });
  }

  const feed = await db.rssFeed.create({
    data: {
      name,
      url,
      categoryId: categoryId || null,
      refreshIntervalMinutes: refreshIntervalMinutes || 60,
    },
  });

  fetchRssFeed(feed.id).catch(() => {});

  return NextResponse.json({ feed }, { status: 201 });
});

export const PATCH = requireRole('admin', async (req) => {
  const { feedId, status, refreshIntervalMinutes } = await req.json();

  if (!feedId) {
    return NextResponse.json({ error: 'Feed ID required' }, { status: 400 });
  }

  const feed = await db.rssFeed.update({
    where: { id: feedId },
    data: {
      ...(status && { status }),
      ...(refreshIntervalMinutes && { refreshIntervalMinutes }),
    },
  });

  if (status === 'active') {
    fetchRssFeed(feed.id).catch(() => {});
  }

  return NextResponse.json({ feed });
});
