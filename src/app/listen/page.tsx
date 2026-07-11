'use client';

import { useState } from 'react';
import Link from 'next/link';

const episodes = [
  { id: 1, title: 'AI-Powered Journalism Is Reshaping How Stories Reach Readers', author: 'Amara Mwangi · Technology', duration: '5:02', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=96&h=96&fit=crop' },
  { id: 2, title: 'How Nairobi Became Africa\'s Silicon Savannah', author: 'James Kariuki · Technology', duration: '7:18', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=96&h=96&fit=crop' },
  { id: 3, title: 'M-Pesa\'s Next Chapter: Expanding Beyond Payments', author: 'Wanjiku Muthoni · Business', duration: '11:24', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=96&h=96&fit=crop' },
  { id: 4, title: 'Gengetone to Global: Kenyan Music Producers Conquering Charts', author: 'DJ Mwas · Culture', duration: '5:45', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=96&h=96&fit=crop' },
  { id: 5, title: 'Marathon Dominance: Inside Kenya\'s Training Methods', author: 'Eliud Sang · Sports', duration: '9:32', img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=96&h=96&fit=crop' },
  { id: 6, title: 'CRISPR Gene Therapy Trials Show 94% Success Rate', author: 'Dr. Fatima Ndegwa · Science', duration: '12:07', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=96&h=96&fit=crop' },
];

export default function ListenPage() {
  const [activeId, setActiveId] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const speeds = ['0.75x', '1.0x', '1.25x', '1.5x', '2.0x'];
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const activeEpisode = episodes.find(e => e.id === activeId) || episodes[0];

  return (
    <div style={{
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      transition: 'background 0.4s var(--ease-out-expo)',
    }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', height: 56,
        }}>
          <Link href="/" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            <span style={{ color: 'var(--primary)' }}>026</span>Newsblog
          </Link>
          <ul style={{ display: 'flex', gap: 24, listStyle: 'none' }}>
            <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Home</Link></li>
            <li><Link href="/explore" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Explore</Link></li>
            <li><Link href="/listen" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Listen</Link></li>
          </ul>
          <button onClick={toggleTheme} style={{
            width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
          }}>
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 140px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Listen</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Audio versions of articles, AI-narrated for on-the-go reading.
          </p>
        </div>

        {/* Now Playing */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 18, padding: 28, marginBottom: 32,
          display: 'grid', gridTemplateColumns: '200px 1fr', gap: 28, alignItems: 'center',
        }}>
          <div style={{ width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
            <img
              src={activeEpisode.img.replace('w=96&h=96', 'w=400&h=400')}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {playing && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'oklch(0% 0 0 / 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24 }}>
                  {[60, 100, 40, 80, 50].map((h, i) => (
                    <div key={i} style={{
                      width: 4, borderRadius: 2, background: 'oklch(98% 0 0)',
                      height: `${h}%`,
                      animation: 'waveAnim 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', marginBottom: 8 }}>
              Now Playing
            </span>
            <h2 style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.3, marginBottom: 6,
            }}>
              {activeEpisode.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              By {activeEpisode.author} · AI Narrated
            </p>

            <div style={{ marginBottom: 12 }}>
              <div style={{
                width: '100%', height: 6, borderRadius: 3,
                background: 'var(--bg-inset)', cursor: 'pointer', position: 'relative',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: 'var(--primary)',
                  width: '35%', transition: 'width 0.1s',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFeatureSettings: '"tnum"', marginTop: 6 }}>
                <span>1:45</span>
                <span>{activeEpisode.duration}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  <text x="9" y="16" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui" fontWeight="700">15</text>
                </svg>
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                style={{
                  width: 52, height: 52, borderRadius: '50%', border: 'none',
                  background: 'var(--primary)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'oklch(98% 0.005 175)',
                }}
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }}>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }}>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              <button style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  <text x="9" y="16" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui" fontWeight="700">15</text>
                </svg>
              </button>
              <button style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
              <button
                onClick={() => setSpeedIdx((speedIdx + 1) % speeds.length)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'transparent', fontSize: '0.7rem', fontWeight: 700,
                  color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                  marginLeft: 'auto',
                }}
              >
                {speeds[speedIdx]}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--text-tertiary)' }}>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <div style={{ width: 80, height: 4, borderRadius: 2, background: 'var(--bg-inset)', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: 'var(--primary)', width: '70%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Up Next</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {episodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => { setActiveId(ep.id); setPlaying(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg-surface)',
                  border: `1px solid ${activeId === ep.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <span style={{
                  fontSize: '0.82rem', fontWeight: 700, color: activeId === ep.id ? 'var(--primary)' : 'var(--text-tertiary)',
                  minWidth: 20, textAlign: 'center', fontFeatureSettings: '"tnum"',
                }}>
                  {ep.id}
                </span>
                <img src={ep.img} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ep.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{ep.author}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFeatureSettings: '"tnum"', minWidth: 44, textAlign: 'right' }}>
                  {ep.duration}
                </span>
                <button style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: activeId === ep.id ? 'none' : '1px solid var(--border)',
                  background: activeId === ep.id ? 'var(--primary)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: activeId === ep.id ? 'oklch(98% 0.005 175)' : 'var(--text-secondary)',
                  flexShrink: 0,
                }}>
                  {activeId === ep.id && playing ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes waveAnim {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
      `}</style>
    </div>
  );
}
