import type { Metadata } from 'next';
import { createSupabaseContext } from '@/lib/supabase/context';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return { title: 'Article Not Found' };

  const { data: article } = await (ctx.supabase as any)
    .from('articles')
    .select('title, excerpt, cover_image_url, author:users!author_id(first_name, last_name)')
    .eq('slug', slug)
    .single();

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
      authors: [`${article.author.first_name} ${article.author.last_name}`],
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
    alternates: { canonical: `${siteUrl}/article/${slug}` },
  };
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
