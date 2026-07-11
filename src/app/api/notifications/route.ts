import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  const where: Record<string, unknown> = { userId: user.id };
  if (type && type !== 'all') where.type = type;

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        actor: { select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true } },
        article: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
      },
    }),
    db.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
});

export const PATCH = requireAuth(async (req, user) => {
  const body = await req.json();

  if (body.markAllRead) {
    await db.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  }

  if (body.ids?.length) {
    await db.notification.updateMany({
      where: { id: { in: body.ids }, userId: user.id },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
});
