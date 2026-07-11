import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export const GET = requireRole(['author', 'admin'], async (_req, user) => {
  const [earningsAgg, payoutsAgg, recentEarnings, recentPayouts, profile] = await Promise.all([
    db.earning.aggregate({
      where: { authorId: user.id },
      _sum: { amountUsd: true },
    }),
    db.payout.aggregate({
      where: { authorId: user.id, status: { in: ['completed', 'processing', 'pending'] } },
      _sum: { amountUsd: true },
    }),
    db.earning.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { article: { select: { id: true, title: true, slug: true } } },
    }),
    db.payout.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    db.authorProfile.findUnique({ where: { userId: user.id } }),
  ]);

  const totalEarned = Number(earningsAgg._sum.amountUsd || 0);
  const totalWithdrawn = Number(payoutsAgg._sum.amountUsd || 0);
  const balance = totalEarned - totalWithdrawn;

  const settings = await db.platformSetting.findUnique({ where: { key: 'withdrawal_threshold_usd' } });
  const threshold = Number((settings?.value as { amount?: number })?.amount ?? 50);

  return NextResponse.json({
    balance,
    totalEarned,
    totalWithdrawn,
    threshold,
    revenueSharePct: profile?.revenueSharePct ?? 70,
    recentEarnings,
    recentPayouts,
  });
});
