import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type RouteContext = { params: Promise<{ username: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await context.params;
  const target = await db.user.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.id === user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  await db.follow.upsert({
    where: { followerId_followingId: { followerId: user.id, followingId: target.id } },
    create: { followerId: user.id, followingId: target.id },
    update: {},
  });

  await db.authorProfile.updateMany({
    where: { userId: target.id },
    data: { totalFollowers: { increment: 1 } },
  });

  return NextResponse.json({ following: true });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await context.params;
  const target = await db.user.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.follow.deleteMany({ where: { followerId: user.id, followingId: target.id } });

  await db.authorProfile.updateMany({
    where: { userId: target.id },
    data: { totalFollowers: { decrement: 1 } },
  });

  return NextResponse.json({ following: false });
}
