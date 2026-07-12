'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { BreakingNewsTicker } from './breaking-news-ticker';

function useHideChrome() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isAuthorDash =
    pathname.startsWith('/author/dashboard') ||
    pathname.startsWith('/author/analytics') ||
    pathname.startsWith('/author/withdraw') ||
    pathname.startsWith('/author/articles');
  return isAdmin || isAuthorDash;
}

export function SiteHeader() {
  const pathname = usePathname();
  const hideChrome = useHideChrome();

  return (
    <>
      {pathname === '/' && <BreakingNewsTicker />}
      {!hideChrome && <Navbar />}
    </>
  );
}
