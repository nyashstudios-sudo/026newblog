import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: articleId } = await context.params;

  await db.articleSave.upsert({
    where: { userId_articleId: { userId: user.id, articleId } },
    create: { userId: user.id, articleId },
    update: {},
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: articleId } = await context.params;

  await db.articleSave.deleteMany({ where: { userId: user.id, articleId } });

  return NextResponse.json({ saved: false });
}
