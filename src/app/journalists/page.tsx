'use client';

import { useState } from 'react';
import Link from 'next/link';

const journalists = [
  { name: 'Amara Mwangi', initials: 'AM', title: 'Tech Journalist · AI & Media Researcher', topics: ['AI', 'Media', 'Startups'], bio: 'Covering the intersection of AI, media, and society in East Africa. Previously at Nation Media Group. Speaker at AfricaTech 2025 and Digital Media Summit.', views: '48.2K', articles: 12, followers: '2.1K', gradient: 'linear-gradient(135deg, oklch(50% 0.14 220), oklch(45% 0.12 200))' },
  { name: 'Kwame Osei', initials: 'KO', title: 'Business Analyst · Fintech Writer', topics: ['Fintech', 'Business', 'M-Pesa'], bio: 'Tracking mobile money, digital banking, and startup funding across East Africa. Former financial analyst at Equity Bank. CFA charterholder.', views: '31.7K', articles: 8, followers: '1.4K', gradient: 'linear-gradient(135deg, oklch(50% 0.14 30), oklch(50% 0.12 50))' },
  { name: 'Dr. Fatima Ndegwa', initials: 'FN', title: 'PhD Researcher · Science Writer', topics: ['Science', 'Health', 'Biotech'], bio: 'PhD in molecular biology from University of Nairobi. Writing about gene therapy, vaccine manufacturing, and the future of healthcare in Africa.', views: '24.1K', articles: 6, followers: '980', gradient: 'linear-gradient(135deg, oklch(50% 0.14 140), oklch(45% 0.12 160))' },
  { name: 'Zuri Abara', initials: 'ZA', title: 'Culture Journalist · Arts Critic', topics: ['Culture', 'Afrofuturism', 'Music'], bio: 'Exploring how African creatives are redefining global pop culture. From Gengetone to Nollywood, fashion to fine art. Based in Nairobi and Lagos.', views: '22.8K', articles: 9, followers: '1.7K', gradient: 'linear-gradient(135deg, oklch(50% 0.14 310), oklch(45% 0.12 330))' },
  { name: 'Eliud Sang', initials: 'ES', title: 'Sports Columnist · Former Runner', topics: ['Marathon', 'Athletics', 'Sports Science'], bio: 'Former competitive distance runner turned journalist. Covering marathon training, sports science, and athletic culture from Iten, Kenya\'s running capital.', views: '18.9K', articles: 5, followers: '890', gradient: 'linear-gradient(135deg, oklch(50% 0.14 25), oklch(50% 0.12 40))' },
  { name: 'James Kariuki', initials: 'JK', title: 'Startup Ecosystem Reporter', topics: ['Startups', 'VC', 'Innovation'], bio: 'Documenting the rise of African tech from iHub to global unicorns. Deep dives into funding rounds, founder stories, and ecosystem dynamics.', views: '15.4K', articles: 5, followers: '720', gradient: 'linear-gradient(135deg, oklch(50% 0.14 90), oklch(45% 0.12 110))' },
];

export default function JournalistsPage() {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const toggleFollow = (name: string) => {
    setFollowed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Our Journalists</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 50, margin: '0 auto' }}>Meet the voices behind 026Newsblog. Independent writers, researchers, and reporters covering what matters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {journalists.map((j) => (
          <div key={j.name} style={{ padding: 28, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: j.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0 }}>{j.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{j.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{j.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {j.topics.map((t) => (
                    <span key={t} style={{ padding: '3px 10px', background: 'var(--primary-light)', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary)' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{j.bio}</p>
            <div style={{ display: 'flex', gap: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{j.views}</strong> views</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{j.articles}</strong> articles</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{j.followers}</strong> followers</span>
            </div>
            <button onClick={() => toggleFollow(j.name)} style={{ marginTop: 16, width: '100%', padding: 9, borderRadius: 8, border: '1px solid var(--border)', background: followed[j.name] ? 'var(--primary)' : 'transparent', fontSize: '0.8rem', fontWeight: 600, color: followed[j.name] ? 'oklch(98% 0.005 175)' : 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {followed[j.name] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 56, textAlign: 'center', padding: 48, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Want to write for 026Newsblog?</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>We&apos;re always looking for talented writers with expertise in technology, business, science, culture, and more. Earn 70% of revenue from your content.</p>
        <Link href="/author/apply" style={{ padding: '11px 24px', borderRadius: 9, fontSize: '0.84rem', fontWeight: 600, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Apply to Become an Author →</Link>
      </div>
    </div>
  );
}
