import { NextResponse } from 'next/server';
import { refreshAllFeeds } from '@/lib/rss';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const cronSecret = request.headers.get('x-cron-secret');
  const isVercelCron = process.env.VERCEL === '1';
  const isGitHubCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isVercelCron && !isGitHubCron && (!user || user.role !== 'admin')) {
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
