import type { MetadataRoute } from 'next';
import { getAppSettings } from '@/lib/settings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getAppSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://026newsblog.vercel.app';

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/auth/', '/admin/', '/author/'] },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
