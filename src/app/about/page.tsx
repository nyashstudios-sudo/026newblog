'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
          Stories that matter, from <span style={{ color: 'var(--primary)' }}>voices that count.</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 60, margin: '0 auto', lineHeight: 1.7 }}>
          026Newsblog is a creator-first news platform built for African journalists and readers. We believe great journalism deserves great pay, and readers deserve stories told by the people who live them.
        </p>
      </section>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: '0 24px 60px', flexWrap: 'wrap' }}>
        {[
          ['12.4K', 'Active Readers'],
          ['47', 'Verified Authors'],
          ['1,200+', 'Articles Published'],
          ['$11K+', 'Paid to Authors'],
        ].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--primary)', fontFeatureSettings: "'tnum'" }}>{val}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Mission */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>Our Mission</h2>
          <p style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16, maxWidth: 65 }}>
            We&apos;re building the infrastructure for African journalism to thrive in the digital age. Traditional media models underpay writers and underserve readers. 026Newsblog changes that equation: authors keep 70% of the revenue their content generates, paid directly to their M-Pesa.
          </p>
          <p style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16, maxWidth: 65 }}>
            For readers, we provide a personalized, ad-light experience that surfaces quality writing from across the continent. No clickbait algorithms. No pay-to-play. Just good stories, well told.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 24 }}>
            {[
              { icon: '✊', title: 'Creator Ownership', desc: 'Authors own their work and earn the majority of its revenue. No hidden fees, no lock-in.' },
              { icon: '🌍', title: 'African Voices First', desc: 'Stories about Africa, told by Africans. We amplify perspectives the global media overlooks.' },
              { icon: '⚡', title: 'Mobile-Native', desc: 'Built for how Africa reads: on phones, with mobile money, on variable connections.' },
            ].map((v) => (
              <div key={v.title} style={{ padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14 }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{v.icon}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6 }}>{v.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial Standards */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>Editorial Standards</h2>
          <p style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16, maxWidth: 65 }}>
            Every article published on 026Newsblog is held to these standards. Authors who repeatedly violate them may have publishing privileges revoked.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
            {[
              ['Accuracy', 'All factual claims must be verifiable. Authors must cite sources for statistics, quotes, and non-obvious assertions. Corrections are published promptly and transparently.'],
              ['Originality', 'Content must be original work. Plagiarism, AI-generated articles without disclosure, and republished content from other platforms without permission are prohibited.'],
              ['Fairness', 'Coverage must present multiple perspectives on controversial topics. Opinion pieces are clearly labeled. Authors must disclose conflicts of interest.'],
              ['Independence', 'Editorial content is never influenced by advertisers or sponsors. Sponsored content is clearly labeled and separated from editorial. Authors maintain full editorial independence.'],
              ['Transparency', 'AI-assisted content (fact-checking, audio narration) is always disclosed. Corrections and updates are logged. Revenue relationships are transparent.'],
              ['Respect', 'Content must not promote hate, discrimination, or harassment. Coverage of sensitive topics follows ethical reporting guidelines with appropriate content warnings.'],
            ].map(([title, desc], i) => (
              <div key={title} style={{ display: 'flex', gap: 16, padding: 20, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', minWidth: 32, fontFeatureSettings: "'tnum'" }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 4 }}>{title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>The Team</h2>
          <p style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16, maxWidth: 65 }}>
            We&apos;re a small, focused team based in Nairobi, building the platform we wish existed when we started writing.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 24 }}>
            {[
              { initials: 'WN', name: 'Wayne Nyamu', role: 'Founder & CEO', gradient: 'linear-gradient(135deg, oklch(50% 0.15 175), oklch(45% 0.12 220))' },
              { initials: 'AM', name: 'Amara Mwangi', role: 'Head of Content', gradient: 'linear-gradient(135deg, oklch(50% 0.14 220), oklch(45% 0.12 200))' },
              { initials: 'KO', name: 'Kwame Osei', role: 'Head of Monetization', gradient: 'linear-gradient(135deg, oklch(50% 0.14 30), oklch(50% 0.12 50))' },
            ].map((m) => (
              <div key={m.name} style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: m.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', margin: '0 auto 12px' }}>{m.initials}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: 48, background: 'var(--primary-light)', borderRadius: 20, marginTop: 40 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Join the 026Newsblog community</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Whether you&apos;re a reader looking for quality journalism or a writer ready to earn from your craft.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ padding: '11px 22px', borderRadius: 9, fontSize: '0.84rem', fontWeight: 600, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>Start Reading</Link>
            <Link href="/author/apply" style={{ padding: '11px 22px', borderRadius: 9, fontSize: '0.84rem', fontWeight: 600, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>Become an Author</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
