import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

function j(data: unknown) {
  return NextResponse.json(JSON.parse(JSON.stringify(data, (_k: string, v: unknown) => (typeof v === 'bigint' ? Number(v) : v))));
}

export const GET = requireRole('admin', async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    userCount,
    authorCount,
    articleCount,
    publishedCount,
    pendingApplications,
    totalViews,
    totalEarnings,
    totalPayouts,
    recentUsers,
    securityEvents,
  ] = await Promise.all([
    db.user.count({ where: { isActive: true } }),
    db.user.count({ where: { role: 'author', isActive: true } }),
    db.article.count(),
    db.article.count({ where: { status: 'published' } }),
    db.authorApplication.count({ where: { status: 'pending' } }),
    db.article.aggregate({ _sum: { viewCount: true } }),
    db.earning.aggregate({ _sum: { amountUsd: true } }),
    db.payout.aggregate({
      where: { status: 'completed' },
      _sum: { amountUsd: true },
    }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.securityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { username: true, email: true } } },
    }),
  ]);

  const topArticles = await db.article.findMany({
    where: { status: 'published' },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      likeCount: true,
      author: { select: { firstName: true, lastName: true, username: true } },
    },
  });

  return j({
    overview: {
      users: userCount,
      authors: authorCount,
      articles: articleCount,
      published: publishedCount,
      pendingApplications,
      totalViews: Number(totalViews._sum.viewCount || 0),
      totalEarnings: Number(totalEarnings._sum.amountUsd || 0),
      totalPayouts: Number(totalPayouts._sum.amountUsd || 0),
      newUsers30d: recentUsers,
    },
    topArticles,
    securityEvents,
  });
});
