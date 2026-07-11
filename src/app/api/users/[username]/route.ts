import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, articleCardSelect } from '@/lib/auth';

type RouteContext = { params: Promise<{ username: string }> };

function j(data: unknown) {
  return NextResponse.json(JSON.parse(JSON.stringify(data, (_k: string, v: unknown) => (typeof v === 'bigint' ? Number(v) : v))));
}

export async function GET(_req: Request, context: RouteContext) {
  const { username } = await context.params;

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      website: true,
      role: true,
      createdAt: true,
      authorProfile: true,
      _count: {
        select: {
          followers: true,
          following: true,
          articles: { where: { status: 'published' } },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const currentUser = await getCurrentUser();
  let isFollowing = false;
  if (currentUser && currentUser.id !== user.id) {
    const follow = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUser.id, followingId: user.id } },
    });
    isFollowing = !!follow;
  }

  const recentArticles = await db.article.findMany({
    where: { authorId: user.id, status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    select: articleCardSelect,
  });

  return j({ profile: user, isFollowing, recentArticles });
}

export async function PATCH(req: Request, context: RouteContext) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await context.params;
  if (currentUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { bio, website } = body;

  const updated = await db.user.update({
    where: { id: currentUser.id },
    data: {
      ...(bio !== undefined && { bio }),
      ...(website !== undefined && { website }),
    },
    select: { id: true, bio: true, website: true, username: true },
  });

  return j({ profile: updated });
}
