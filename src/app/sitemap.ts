import { db } from '@/lib/db';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://026newsblog.vercel.app';

export default async function sitemap() {
  const articles = await db.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: 'desc' },
    take: 500,
  });

  const categories = await db.category.findMany({
    select: { slug: true },
  });

  const staticPages = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1 },
    { url: `${siteUrl}/explore`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${siteUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${siteUrl}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${siteUrl}/stats`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.4 },
    { url: `${siteUrl}/listen`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.4 },
  ];

  const articlePages = articles.map((a) => ({
    url: `${siteUrl}/article/${a.slug}`,
    lastModified: a.updatedAt || a.publishedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${siteUrl}/categories?cat=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...articlePages, ...categoryPages];
}
