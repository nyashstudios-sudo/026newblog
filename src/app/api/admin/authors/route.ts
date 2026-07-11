import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export const GET = requireRole('admin', async (req) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';

  const applications = await db.authorApplication.findMany({
    where: status !== 'all' ? { status: status as 'pending' | 'approved' | 'rejected' | 'suspended' } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({ applications });
});

export const PATCH = requireRole('admin', async (req, admin) => {
  const { applicationId, action, rejectionReason } = await req.json();

  if (!applicationId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const application = await db.authorApplication.findUnique({
    where: { id: applicationId },
    include: { user: true },
  });

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  if (action === 'approve') {
    await db.$transaction([
      db.authorApplication.update({
        where: { id: applicationId },
        data: { status: 'approved', reviewedBy: admin.id, reviewedAt: new Date() },
      }),
      db.user.update({
        where: { id: application.userId },
        data: { role: 'author' },
      }),
      db.authorProfile.upsert({
        where: { userId: application.userId },
        update: {},
        create: { userId: application.userId },
      }),
      db.notification.create({
        data: {
          userId: application.userId,
          type: 'system',
          title: 'Author application approved',
          content: 'Congratulations! You can now publish articles on 026Newsblog.',
        },
      }),
    ]);
  } else {
    await db.authorApplication.update({
      where: { id: applicationId },
      data: {
        status: 'rejected',
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason || 'Application did not meet requirements',
      },
    });
    await db.notification.create({
      data: {
        userId: application.userId,
        type: 'system',
        title: 'Author application update',
        content: rejectionReason || 'Your author application was not approved at this time.',
      },
    });
  }

  return NextResponse.json({ success: true });
});
