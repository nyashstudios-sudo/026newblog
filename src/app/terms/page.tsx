'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TermsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') setTheme('dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
  ];

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo"><span>026</span>Newsblog</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>{l.label}</Link>
            ))}
            <button onClick={toggleTheme} className="icon-btn">
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-serif), Georgia, serif', marginBottom: 12 }}>Terms of Service &amp; Privacy Policy</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Last updated: July 12, 2026</p>
        </div>

        <section style={{ marginBottom: 48, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '32px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 16 }}>Terms of Service</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
            By accessing or using 026Newsblog, you agree to these Terms of Service. You are responsible for the content you publish and must comply with applicable laws. We reserve the right to remove content that violates our community guidelines.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Accounts may be suspended for abuse, plagiarism, or repeated policy violations. Authors retain ownership of their work while granting us a license to display and distribute it on the platform.
          </p>
        </section>

        <section style={{ marginBottom: 48, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '32px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 16 }}>Privacy Policy</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
            We collect only the information necessary to operate the platform, including your account details, content, and basic usage analytics. We do not sell your personal data to third parties.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            You may request access to or deletion of your data at any time by contacting our team. Analytics are aggregated and anonymized to improve the reading experience.
          </p>
        </section>
      </div>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 32 }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px', display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>About</Link>
          <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Terms</Link>
          <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Privacy</Link>
        </div>
      </footer>
    </>
  );
}
