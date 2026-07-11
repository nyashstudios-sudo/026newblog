'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type StatsData = {
  streak: { current: number; longest: number; lastReadDate: string | null };
  totals: { articlesRead: number; readingTimeMinutes: number; commentsPosted: number; articlesLiked: number };
  weeklyActivity: number[];
  categoryBreakdown: Array<{ name: string; pct: number; count: number; color: string }>;
  goals: {
    dailyArticles: { current: number; target: number };
    weeklyMinutes: { current: number; target: number };
    comments: { current: number; target: number };
    newTopics: { current: number; target: number };
  };
  mostRead: Array<{ rank: number; title: string; author: string; readCount: number; totalMinutes: number }>;
};

const defaultStats: StatsData = {
  streak: { current: 0, longest: 0, lastReadDate: null },
  totals: { articlesRead: 0, readingTimeMinutes: 0, commentsPosted: 0, articlesLiked: 0 },
  weeklyActivity: Array(28).fill(0),
  categoryBreakdown: [],
  goals: {
    dailyArticles: { current: 0, target: 5 },
    weeklyMinutes: { current: 0, target: 120 },
    comments: { current: 0, target: 10 },
    newTopics: { current: 0, target: 3 },
  },
  mostRead: [],
};

function formatMinutes(minutes: number) {
  if (minutes >= 60) return `${(minutes / 60).toFixed(1)}h`;
  return `${minutes}m`;
}

export default function StatsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [stats, setStats] = useState<StatsData>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats({
          streak: data.streak ?? defaultStats.streak,
          totals: data.totals ?? defaultStats.totals,
          weeklyActivity: data.weeklyActivity ?? defaultStats.weeklyActivity,
          categoryBreakdown: data.categoryBreakdown ?? defaultStats.categoryBreakdown,
          goals: data.goals ?? defaultStats.goals,
          mostRead: data.mostRead ?? defaultStats.mostRead,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const levels = stats.weeklyActivity.map((v) => Math.min(v, 4));

  const streakDays = Math.min(stats.streak.current, 7);

  const statCards = [
    { icon: '📚', value: String(stats.totals.articlesRead), label: 'Articles Read' },
    { icon: '⏱️', value: formatMinutes(stats.totals.readingTimeMinutes), label: 'Time Reading' },
    { icon: '💬', value: String(stats.totals.commentsPosted), label: 'Comments Posted' },
    { icon: '❤️', value: String(stats.totals.articlesLiked), label: 'Articles Liked' },
  ];

  const goalItems = [
    { name: 'Daily Articles', progress: `${stats.goals.dailyArticles.current}/${stats.goals.dailyArticles.target}`, pct: stats.goals.dailyArticles.target > 0 ? Math.round((stats.goals.dailyArticles.current / stats.goals.dailyArticles.target) * 100) : 0 },
    { name: 'Weekly Minutes', progress: `${stats.goals.weeklyMinutes.current}/${stats.goals.weeklyMinutes.target}`, pct: stats.goals.weeklyMinutes.target > 0 ? Math.round((stats.goals.weeklyMinutes.current / stats.goals.weeklyMinutes.target) * 100) : 0 },
    { name: 'Comments', progress: `${stats.goals.comments.current}/${stats.goals.comments.target}`, pct: stats.goals.comments.target > 0 ? Math.round((stats.goals.comments.current / stats.goals.comments.target) * 100) : 0 },
    { name: 'New Topics', progress: `${stats.goals.newTopics.current}/${stats.goals.newTopics.target}`, pct: stats.goals.newTopics.target > 0 ? Math.round((stats.goals.newTopics.current / stats.goals.newTopics.target) * 100) : 0 },
  ];

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo"><span>026</span>Newsblog</Link>
          <button onClick={toggleTheme} className="icon-btn">
            {theme === 'light' ? (
              <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div className="stats-page">
        <div className="page-header">
          <h1 className="page-title">Your Reading Stats</h1>
          <p className="page-subtitle">Track your reading habits and discover patterns in what you consume.</p>
        </div>

        {loading ? (
          <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
            <p>Loading your stats...</p>
          </div>
        ) : (
          <>
            <div className="streak-section">
              <div className="streak-icon">🔥</div>
              <div className="streak-info">
                <div className="streak-value">{stats.streak.current > 0 ? `${stats.streak.current} Day Streak!` : 'No active streak'}</div>
                <div className="streak-label">You&apos;ve read articles {stats.streak.current > 0 ? `${stats.streak.current} days in a row. Keep it going!` : 'recently. Start a streak today!'}</div>
                <div className="streak-days">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <span key={i} className={`streak-day ${i < streakDays ? 'done' : i === streakDays && streakDays > 0 ? 'today' : ''}`}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="stats-grid">
              {statCards.map((stat, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-change"></div>
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Reading Activity</h2>
                <span className="panel-period">Last 4 weeks</span>
              </div>
              <div className="heatmap">
                {levels.map((l, i) => (
                  <div key={i} className={`heat-cell${l > 0 ? ` l${l}` : ''}`} title={l === 0 ? 'No reading' : `${l} articles`} />
                ))}
              </div>
              <div className="heat-labels">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="heat-legend">
                <span>Less</span>
                <div className="heat-legend-cell" style={{ background: 'var(--bg-inset)' }} />
                <div className="heat-legend-cell l1" />
                <div className="heat-legend-cell l2" />
                <div className="heat-legend-cell l3" />
                <div className="heat-legend-cell l4" />
                <span>More</span>
              </div>
            </div>

            <div className="grid-2">
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Reading by Category</h2>
                </div>
                <div className="cat-list">
                  {stats.categoryBreakdown.length > 0 ? (
                    stats.categoryBreakdown.map((cat, i) => (
                      <div key={i} className="cat-item">
                        <span className="cat-name">{cat.name}</span>
                        <div className="cat-bar-wrap">
                          <div className="cat-bar" style={{ width: `${cat.pct}%`, background: cat.color }} />
                        </div>
                        <span className="cat-pct">{cat.pct}%</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ padding: 16, color: 'var(--text-muted)' }}>No category data yet.</p>
                  )}
                </div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Reading Goals</h2>
                </div>
                <div className="goals-grid">
                  {goalItems.map((goal, i) => (
                    <div key={i} className="goal-item">
                      <div className="goal-header">
                        <span className="goal-name">{goal.name}</span>
                        <span className="goal-progress">{goal.progress}</span>
                      </div>
                      <div className="goal-bar">
                        <div className="goal-fill" style={{ width: `${Math.min(goal.pct, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 24 }}>
              <div className="panel-header">
                <h2 className="panel-title">Most Read This Month</h2>
              </div>
              <div className="top-list">
                {stats.mostRead.length > 0 ? (
                  stats.mostRead.map((article) => (
                    <div key={article.rank} className="top-item">
                      <span className="top-rank">{article.rank}</span>
                      <div className="top-info">
                        <div className="top-title">{article.title}</div>
                        <div className="top-meta">{article.author} · Read {article.readCount} time{article.readCount !== 1 ? 's' : ''} · {article.totalMinutes} min total</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: 16, color: 'var(--text-muted)' }}>No reading data yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
