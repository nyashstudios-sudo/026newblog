import { NextResponse } from 'next/server';
import { getRecentRssItems } from '@/lib/rss';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const items = await getRecentRssItems(limit);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
