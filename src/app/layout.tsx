import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Newsreader } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { RealtimeFeedProvider } from '@/components/providers/realtime-feed-provider';
import { SettingsProvider } from '@/components/providers/settings-provider';
import { JsonLd } from '@/components/seo/json-ld';
import { getAppSettings } from '@/lib/settings';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7faf8' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1412' },
  ],
};

const fallbackUrl = 'https://026newsblog.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl;
  const title = settings.site_title || '026Newsblog';
  const desc = settings.seo_description || settings.site_description || "Discover breaking news, trending stories, and insights from top authors worldwide.";
  const template = settings.seo_title_template || '%s | 026Newsblog';

  let metadataBase: URL | undefined;
  try { metadataBase = new URL(siteUrl); } catch { metadataBase = new URL(fallbackUrl); }

  return {
    metadataBase,
    title: { default: `${title} — Breaking News & Stories`, template },
    description: desc,
    keywords: ['news', 'breaking news', 'East Africa', 'technology', 'business', 'science', 'culture', 'journalism', 'stories'],
    authors: [{ name: title }],
    creator: title,
    publisher: title,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: title,
      title: `${title} — Breaking News & Stories`,
      description: desc,
      url: siteUrl,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Breaking News & Stories`,
      description: desc,
      images: ['/og-image.png'],
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: title,
    },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
    },
    alternates: { canonical: siteUrl },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${newsreader.variable} h-full`}>
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
            <RealtimeFeedProvider>
              <JsonLd />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </RealtimeFeedProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
