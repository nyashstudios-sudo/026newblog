import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['author', 'admin'], async (_req, user) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [articles, earnings] = await Promise.all([
    db.article.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        publishedAt: true,
      },
      orderBy: { viewCount: 'desc' },
      take: 10,
    }),
    db.earning.aggregate({
      where: { authorId: user.id, createdAt: { gte: thirtyDaysAgo } },
      _sum: { amountUsd: true },
    }),
  ]);

  const totals = articles.reduce(
    (acc, a) => ({
      views: acc.views + Number(a.viewCount),
      likes: acc.likes + a.likeCount,
      comments: acc.comments + a.commentCount,
      shares: acc.shares + a.shareCount,
    }),
    { views: 0, likes: 0, comments: 0, shares: 0 }
  );

  const dailyViews: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyViews.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }

  const viewRecords = await db.articleView.findMany({
    where: {
      article: { authorId: user.id },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true },
  });

  viewRecords.forEach((v) => {
    const key = new Date(v.createdAt).toISOString().slice(0, 10);
    const entry = dailyViews.find((d) => d.date === key);
    if (entry) entry.count += 1;
  });

  return NextResponse.json({
    totals,
    monthlyEarnings: Number(earnings._sum.amountUsd || 0),
    topArticles: articles,
    dailyViews,
  });
});
