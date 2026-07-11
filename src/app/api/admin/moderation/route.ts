import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export const GET = requireRole('admin', async () => {
  const items = await db.moderationQueue.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ items });
});

export const PATCH = requireRole('admin', async (req, admin) => {
  const { id, action } = await req.json();

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const item = await db.moderationQueue.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.moderationQueue.update({
    where: { id },
    data: {
      status: action === 'approve' ? 'approved' : 'rejected',
      moderatedBy: admin.id,
      moderatedAt: new Date(),
      actionTaken: action,
    },
  });

  if (item.type === 'comment') {
    await db.comment.update({
      where: { id: item.contentId },
      data: { moderationStatus: action === 'approve' ? 'approved' : 'rejected' },
    });
  }

  return NextResponse.json({ success: true });
});
