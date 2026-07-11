'use client';

import dynamic from 'next/dynamic';

const HomeClient = dynamic(() => import('./home-client'), {
  ssr: false,
  loading: () => (
    <div>
      <div className="hero"><div className="skeleton w-full h-full rounded-[20px]" /></div>
      <div className="main-layout">
        <main>
          <div className="feed-header"><h2 className="feed-title">Latest Stories</h2></div>
          <div className="article-feed" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="article-card">
                <div className="article-card-body">
                  <div style={{ height: 14, width: 80, background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ height: 24, width: '70%', background: 'var(--border-subtle)', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 24, width: '50%', background: 'var(--border-subtle)', borderRadius: 6, marginBottom: 12 }} />
                  <div style={{ height: 12, width: '90%', background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 4 }} />
                  <div style={{ height: 12, width: '60%', background: 'var(--border-subtle)', borderRadius: 4 }} />
                </div>
                <div className="article-card-image">
                  <div style={{ width: '100%', height: '100%', background: 'var(--category-bg)' }} />
                </div>
              </div>
            ))}
          </div>
        </main>
        <aside className="sidebar">
          {[1, 2, 3].map(i => (
            <div key={i} className="sidebar-section" style={{ height: 200, background: 'var(--border-subtle)' }} />
          ))}
        </aside>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <HomeClient />;
}
