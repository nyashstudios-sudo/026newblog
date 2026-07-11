import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth, articleCardSelect } from '@/lib/auth';
import { generateArticleSlug, countWords, estimateReadingTime } from '@/lib/utils';

function j(data: unknown) {
  return NextResponse.json(JSON.parse(JSON.stringify(data, (_k: string, v: unknown) => (typeof v === 'bigint' ? Number(v) : v))));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const category = searchParams.get('category');
  const author = searchParams.get('author');
  const sort = searchParams.get('sort') || 'published_at';

  const where: Record<string, unknown> = {};
  const isOwn = searchParams.get('own') === 'true';

  if (!author || !isOwn) {
    where.status = 'published';
  }
  if (category) where.category = { slug: category };
  if (author) where.author = { username: author };

  const orderBy: Record<string, 'desc'> = {};
  if (sort === 'popular') orderBy.viewCount = 'desc';
  else if (sort === 'likes') orderBy.likeCount = 'desc';
  else orderBy.publishedAt = 'desc';

  const select = isOwn
    ? { ...articleCardSelect, status: true }
    : articleCardSelect;

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select,
    }),
    db.article.count({ where }),
  ]);

  return j({
    articles,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export const POST = requireAuth(async (req, user) => {
  if (!['author', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const wordCount = body.wordCount ?? countWords(body.contentHtml || '');
  const slug = body.slug || generateArticleSlug(body.title);

  const article = await db.article.create({
    data: {
      authorId: user.id,
      title: body.title,
      subtitle: body.subtitle,
      slug,
      content: body.content || {},
      contentHtml: body.contentHtml,
      excerpt: body.excerpt,
      coverImageUrl: body.coverImageUrl,
      coverImageCaption: body.coverImageCaption,
      categoryId: body.categoryId,
      tags: JSON.stringify(body.tags || []),
      metaDescription: body.metaDescription,
      readingTimeMinutes: estimateReadingTime(wordCount),
      wordCount,
      status: body.status || 'draft',
      publishedAt: body.status === 'published' ? new Date() : null,
    },
  });

  return NextResponse.json({ article }, { status: 201 });
});
