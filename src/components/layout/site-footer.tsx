'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export function SiteFooter() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isAuthorDash =
    pathname.startsWith('/author/dashboard') ||
    pathname.startsWith('/author/analytics') ||
    pathname.startsWith('/author/withdraw') ||
    pathname.startsWith('/author/articles');

  if (isAdmin || isAuthorDash) return null;
  return <Footer />;
}
