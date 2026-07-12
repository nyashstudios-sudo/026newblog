import { createSupabaseContext } from '@/lib/supabase/context';
import { getAppSettings } from '@/lib/settings';

export default async function sitemap() {
  const settings = await getAppSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://026newsblog.vercel.app';

  const { data: ctx } = await createSupabaseContext({ auth: 'none' });
  if (!ctx) return [];

  const sb = ctx.supabase as any;

  const { data: articles } = await sb.from('articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500);

  const { data: categories } = await sb.from('categories').select('slug');

  const staticPages = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1 },
    { url: `${siteUrl}/explore`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${siteUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    ...(settings.enable_registration !== false ? [{ url: `${siteUrl}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 }] : []),
    { url: `${siteUrl}/stats`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.4 },
    { url: `${siteUrl}/listen`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.4 },
  ];

  const articlePages = (articles || []).map((a: any) => ({
    url: `${siteUrl}/article/${a.slug}`,
    lastModified: a.updated_at || a.published_at || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const categoryPages = (categories || []).map((c: any) => ({
    url: `${siteUrl}/categories?cat=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...articlePages, ...categoryPages];
}
