'use client';

import { useState } from 'react';
import Link from 'next/link';

const levels = [0, 0, 1, 2, 3, 4, 1, 2, 0, 1, 3, 4, 2, 1, 2, 3, 1, 0, 4, 3, 2, 3, 4, 2, 1, 2, 3, 0];

const categories = [
  { name: 'Technology', pct: 72, color: 'oklch(45% 0.12 200)' },
  { name: 'Business', pct: 48, color: 'oklch(55% 0.14 55)' },
  { name: 'Science', pct: 35, color: 'oklch(50% 0.12 145)' },
  { name: 'Culture', pct: 28, color: 'oklch(50% 0.14 310)' },
  { name: 'Sports', pct: 20, color: 'oklch(55% 0.12 25)' },
];

const topArticles = [
  { rank: 1, title: 'AI-Powered Journalism Is Reshaping How Stories Reach Readers', meta: 'Amara Mwangi · Read 3 times · 15 min total' },
  { rank: 2, title: "M-Pesa's Next Chapter: Expanding Beyond Payments", meta: 'Wanjiku Muthoni · Read 2 times · 22 min total' },
  { rank: 3, title: "How Nairobi Became Africa's Silicon Savannah", meta: 'James Kariuki · Read 2 times · 14 min total' },
  { rank: 4, title: "Marathon Dominance: Inside Kenya's Training Methods", meta: 'Eliud Sang · Read 1 time · 9 min total' },
  { rank: 5, title: 'Gengetone to Global: Kenyan Music Conquering Charts', meta: 'DJ Mwas · Read 1 time · 5 min total' },
];

export default function StatsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

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
        borderBottom: '1px solid var(--border-subtle)', padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', height: 56,
        }}>
          <Link href="/" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            <span style={{ color: 'var(--primary)' }}>026</span>Newsblog
          </Link>
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
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Reading Stats</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Track your reading habits and discover patterns in what you consume.
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 20, padding: 20,
          background: 'var(--accent-light)', borderRadius: 12, marginBottom: 20,
        }}>
          <div style={{ fontSize: '2.5rem' }}>🔥</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>5 Day Streak!</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              You&apos;ve read articles 5 days in a row. Keep it going!
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <span key={i} style={{
                  width: 28, height: 28, borderRadius: 7, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600,
                  background: i < 4 ? 'var(--accent)' : i === 4 ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
                  color: i < 4 ? 'oklch(15% 0.02 55)' : 'var(--text-tertiary)',
                  border: i === 4 ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                }}>
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { icon: '📚', value: '142', label: 'Articles Read', change: '+18 this week' },
            { icon: '⏱️', value: '12.4h', label: 'Time Reading', change: '+2.1h this week' },
            { icon: '💬', value: '67', label: 'Comments Posted', change: '+8 this week' },
            { icon: '❤️', value: '89', label: 'Articles Liked', change: '+12 this week' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: 20, background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)', borderRadius: 14, textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--success)', marginTop: 4, fontWeight: 600 }}>{stat.change}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 14, padding: 24, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Reading Activity</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Last 4 weeks</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {levels.map((l, i) => (
              <div
                key={i}
                title={l === 0 ? 'No reading' : `${l} articles`}
                style={{
                  aspectRatio: '1', borderRadius: 4,
                  background: l === 0 ? 'var(--bg-inset)' : `oklch(${l === 1 ? '25%' : l === 2 ? '32%' : l === 3 ? '42%' : '55%'} 0.03 175)`,
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end', fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
            <span>Less</span>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bg-inset)' }} />
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'oklch(25% 0.03 175)' }} />
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'oklch(32% 0.06 175)' }} />
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'oklch(42% 0.09 175)' }} />
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'oklch(55% 0.12 175)' }} />
            <span>More</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 14, padding: 24,
          }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Reading by Category</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categories.map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, minWidth: 80 }}>{cat.name}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-inset)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${cat.pct}%`, background: cat.color }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', minWidth: 36, textAlign: 'right', fontFeatureSettings: '"tnum"' }}>{cat.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 14, padding: 24,
          }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Reading Goals</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { name: 'Daily Articles', progress: '3/5', pct: 60 },
                { name: 'Weekly Minutes', progress: '85/120', pct: 71 },
                { name: 'Comments', progress: '8/10', pct: 80 },
                { name: 'New Topics', progress: '2/3', pct: 67 },
              ].map((goal, i) => (
                <div key={i} style={{ padding: 16, background: 'var(--bg-inset)', borderRadius: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{goal.name}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFeatureSettings: '"tnum"' }}>{goal.progress}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: 'var(--primary)', width: `${goal.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 14, padding: 24, marginTop: 24,
        }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Most Read This Month</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topArticles.map((article) => (
              <div key={article.rank} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 10, borderRadius: 9, background: 'var(--bg-inset)',
              }}>
                <span style={{
                  fontSize: '1rem', fontWeight: 700, color: 'var(--text-tertiary)',
                  minWidth: 20, textAlign: 'center', fontFeatureSettings: '"tnum"',
                }}>
                  {article.rank}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{article.title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{article.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
