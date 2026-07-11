'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AudioArticle {
  id: string;
  title: string;
  slug: string;
  authorName: string;
  categoryName: string;
  durationSeconds: number;
  audioUrl: string;
  coverImageUrl: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ListenPage() {
  const [articles, setArticles] = useState<AudioArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const speeds = ['0.75x', '1.0x', '1.25x', '1.5x', '2.0x'];
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    fetch('/api/audio/articles')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(data => {
        const items = data.articles || [];
        setArticles(items);
        if (items.length > 0) setActiveId(items[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const activeEpisode = articles.find(a => a.id === activeId) || articles[0];

  if (loading) {
    return (
      <>
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="nav-logo"><span>026</span>Newsblog</Link>
            <ul className="nav-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/explore">Explore</Link></li>
              <li><Link href="/listen" className="active">Listen</Link></li>
            </ul>
            <button onClick={toggleTheme} className="icon-btn">
              <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="19.78" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </button>
          </div>
        </nav>
        <div className="page">
          <div className="page-header">
            <h1 className="page-title">Listen</h1>
            <p className="page-subtitle">Audio versions of articles, AI-narrated for on-the-go reading.</p>
          </div>
          <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo"><span>026</span>Newsblog</Link>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/explore">Explore</Link></li>
            <li><Link href="/listen" className="active">Listen</Link></li>
          </ul>
          <button onClick={toggleTheme} className="icon-btn">
            <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="19.78" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Listen</h1>
          <p className="page-subtitle">Audio versions of articles, AI-narrated for on-the-go reading.</p>
        </div>

        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <p>No audio articles available yet.</p>
          </div>
        ) : (
          <>
            <div className="now-playing">
              <div className="np-cover">
                <img
                  src={activeEpisode.coverImageUrl || ''}
                  alt=""
                />
                {playing && (
                  <div className="np-cover-overlay">
                    <div className="np-wave">
                      <div className="np-wave-bar"></div>
                      <div className="np-wave-bar"></div>
                      <div className="np-wave-bar"></div>
                      <div className="np-wave-bar"></div>
                      <div className="np-wave-bar"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="np-info">
                <span className="np-label">Now Playing</span>
                <h2 className="np-title">{activeEpisode.title}</h2>
                <p className="np-author">By {activeEpisode.authorName} · {activeEpisode.categoryName} · AI Narrated</p>

                <div className="player-progress">
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill"></div>
                    <div className="progress-thumb"></div>
                  </div>
                  <div className="progress-times">
                    <span>1:45</span>
                    <span>{formatDuration(activeEpisode.durationSeconds)}</span>
                  </div>
                </div>

                <div className="player-controls">
                  <button className="ctrl-btn" title="Previous">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>
                  <button className="ctrl-btn" title="Rewind 15s">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      <text x="9" y="16" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui" fontWeight="700">15</text>
                    </svg>
                  </button>
                  <button
                    onClick={() => setPlaying(!playing)}
                    className={`ctrl-btn play`}
                    title={playing ? 'Pause' : 'Play'}
                  >
                    {playing ? (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                  </button>
                  <button className="ctrl-btn" title="Forward 15s">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      <text x="9" y="16" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui" fontWeight="700">15</text>
                    </svg>
                  </button>
                  <button className="ctrl-btn" title="Next">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSpeedIdx((speedIdx + 1) % speeds.length)}
                    className="speed-btn"
                  >
                    {speeds[speedIdx]}
                  </button>
                  <div className="volume-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <div className="volume-bar">
                      <div className="volume-fill"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="playlist-section">
              <div className="section-header">
                <h2 className="section-title">Up Next</h2>
              </div>
              <div className="playlist">
                {articles.map((ep, idx) => (
                  <div
                    key={ep.id}
                    onClick={() => { setActiveId(ep.id); setPlaying(true); }}
                    className={`playlist-item ${activeId === ep.id ? 'active' : ''}`}
                  >
                    <span className="pl-num">{idx + 1}</span>
                    <img className="pl-cover" src={ep.coverImageUrl || ''} alt="" />
                    <div className="pl-info">
                      <div className="pl-title">{ep.title}</div>
                      <div className="pl-author">{ep.authorName} · {ep.categoryName}</div>
                    </div>
                    <span className="pl-duration">{formatDuration(ep.durationSeconds)}</span>
                    <button className="pl-play">
                      {activeId === ep.id && playing ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
