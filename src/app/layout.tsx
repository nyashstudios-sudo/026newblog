import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Newsreader } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { RealtimeFeedProvider } from '@/components/providers/realtime-feed-provider';
import { JsonLd } from '@/components/seo/json-ld';
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

const siteUrl = 'https://026newsblog.vercel.app';
let metadataBase: URL | undefined;
try {
  metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || siteUrl);
} catch {
  metadataBase = new URL(siteUrl);
}

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: '026Newsblog — Breaking News & Stories',
    template: '%s | 026Newsblog',
  },
  description: 'Discover breaking news, trending stories, and insights from top authors worldwide. Your source for technology, business, science, and culture from East Africa and beyond.',
  keywords: ['news', 'breaking news', 'East Africa', 'technology', 'business', 'science', 'culture', 'journalism', 'stories'],
  authors: [{ name: '026Newsblog' }],
  creator: '026Newsblog',
  publisher: '026Newsblog',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: '026Newsblog',
    title: '026Newsblog — Breaking News & Stories',
    description: 'Discover breaking news, trending stories, and insights from top authors worldwide.',
    url: siteUrl,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '026Newsblog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '026Newsblog — Breaking News & Stories',
    description: 'Discover breaking news, trending stories, and insights from top authors worldwide.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${newsreader.variable} h-full`}>
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <RealtimeFeedProvider>
              <JsonLd />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </RealtimeFeedProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
