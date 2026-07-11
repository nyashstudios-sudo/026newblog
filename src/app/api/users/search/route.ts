import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await db.user.findMany({
    where: {
      isActive: true,
      id: { not: user.id },
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { username: { contains: q } },
        { email: { contains: q } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true },
    take: 20,
  });

  return NextResponse.json({ users });
});
