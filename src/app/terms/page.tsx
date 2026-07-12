'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function TermsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    router.replace(tab ? `/legal?tab=${tab}` : '/legal?tab=terms');
  }, [router, searchParams]);
  return <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-tertiary)' }}>Redirecting...</div>;
}

export default function TermsPage() {
  return <Suspense fallback={<div style={{ padding: 64, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>}><TermsRedirect /></Suspense>;
}
