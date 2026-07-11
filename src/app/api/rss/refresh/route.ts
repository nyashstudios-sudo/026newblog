import { NextResponse } from 'next/server';
import { refreshAllFeeds } from '@/lib/rss';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Allow Vercel cron (x-vercel-cron header) or admin auth
  const user = await getCurrentUser();
  const isCron = process.env.VERCEL === '1';

  if (!isCron && (!user || user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await refreshAllFeeds();

  return NextResponse.json({
    refreshed: true,
    feeds: results.map((r) =>
      r.status === 'fulfilled' ? r.value : { error: r.reason?.toString() }
    ),
  });
}
