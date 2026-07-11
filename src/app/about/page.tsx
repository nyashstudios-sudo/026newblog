'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
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

  const team = [
    { name: 'Amina Hassan', role: 'Editor-in-Chief', initials: 'AH' },
    { name: 'Brian Omondi', role: 'Tech Lead', initials: 'BO' },
    { name: 'Cynthia Wanjiru', role: 'Community Manager', initials: 'CW' },
    { name: 'David Kimani', role: 'News Editor', initials: 'DK' },
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, fontFamily: 'var(--font-serif), Georgia, serif', marginBottom: 16 }}>About 026Newsblog</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 620, margin: '0 auto' }}>
            A community-driven platform telling Africa&apos;s stories through independent voices, data, and culture.
          </p>
        </div>

        <section style={{ marginBottom: 64, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Our Mission</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            026Newsblog exists to amplify authentic African journalism and storytelling. We believe in open, accessible, and reader-supported media that empowers writers and informs communities. Our platform gives authors the tools to publish, track performance, and earn from their work.
          </p>
        </section>

        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Our Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {team.map(m => (
              <div key={m.name} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', margin: '0 auto 12px' }}>{m.initials}</div>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 64, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Contact Us</h2>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <input placeholder="Name" style={inputStyle} />
              <input placeholder="Email" type="email" style={inputStyle} />
            </div>
            <input placeholder="Subject" style={inputStyle} />
            <textarea placeholder="Message" rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Send Message</button>
          </form>
        </section>
      </div>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 32 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px', display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>About</Link>
          <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Terms</Link>
          <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Privacy</Link>
        </div>
      </footer>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-base)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '12px 14px',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  outline: 'none',
};
