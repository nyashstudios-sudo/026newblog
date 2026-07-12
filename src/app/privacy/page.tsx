'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/legal?tab=privacy'); }, [router]);
  return <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-tertiary)' }}>Redirecting...</div>;
}
