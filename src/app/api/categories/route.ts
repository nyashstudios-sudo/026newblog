import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { articleCount: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      articleCount: true,
    },
  });
  return NextResponse.json({ categories });
}
