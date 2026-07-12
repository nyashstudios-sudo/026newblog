'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CookiesPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/legal?tab=cookies'); }, [router]);
  return <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-tertiary)' }}>Redirecting...</div>;
}
