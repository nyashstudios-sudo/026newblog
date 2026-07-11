import type { Metadata } from 'next';
import { db } from '@/lib/db';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, coverImageUrl: true, author: { select: { firstName: true, lastName: true } } },
  });

  if (!article) {
    return { title: 'Article Not Found' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://026newsblog.vercel.app';

  return {
    title: article.title,
    description: article.excerpt || `Read ${article.title} on 026Newsblog`,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: 'article',
      authors: [`${article.author.firstName} ${article.author.lastName}`],
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || undefined,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    },
    alternates: { canonical: `${siteUrl}/article/${slug}` },
  };
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
