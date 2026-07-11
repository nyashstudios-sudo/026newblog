'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const authorColors = [
  { color1: 'oklch(50% 0.14 220)', color2: 'oklch(45% 0.12 200)' },
  { color1: 'oklch(50% 0.14 30)', color2: 'oklch(50% 0.12 50)' },
  { color1: 'oklch(50% 0.14 140)', color2: 'oklch(45% 0.12 160)' },
  { color1: 'oklch(50% 0.14 310)', color2: 'oklch(45% 0.12 330)' },
  { color1: 'oklch(50% 0.14 25)', color2: 'oklch(50% 0.12 40)' },
  { color1: 'oklch(50% 0.14 90)', color2: 'oklch(45% 0.12 110)' },
  { color1: 'oklch(50% 0.14 180)', color2: 'oklch(45% 0.12 200)' },
  { color1: 'oklch(50% 0.14 350)', color2: 'oklch(45% 0.12 10)' },
  { color1: 'oklch(50% 0.14 60)', color2: 'oklch(50% 0.12 80)' },
  { color1: 'oklch(50% 0.14 280)', color2: 'oklch(45% 0.12 300)' },
];

const notifPrefs = [
  { name: 'Daily Digest Email', desc: 'Top 5 stories delivered every morning', icon: 'email', bg: 'oklch(92% 0.04 175)', stroke: 'oklch(45% 0.12 175)' },
  { name: 'Push Notifications', desc: 'Breaking news and followed author updates', icon: 'bell', bg: 'oklch(92% 0.04 55)', stroke: 'oklch(55% 0.15 55)' },
  { name: 'Comment Replies', desc: 'When someone replies to your comments', icon: 'comment', bg: 'oklch(92% 0.04 145)', stroke: 'oklch(45% 0.12 145)' },
  { name: 'Weekly Recap', desc: 'Your reading stats and top stories every Sunday', icon: 'chart', bg: 'oklch(92% 0.04 310)', stroke: 'oklch(50% 0.12 310)' },
];

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Author {
  id: string;
  name: string;
  initials: string;
  topic: string;
}

export default function OnboardingPage() {
  const [slide, setSlide] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Daily Digest Email': true,
    'Push Notifications': true,
    'Comment Replies': true,
    'Weekly Recap': false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/onboarding')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(data => {
        const cats = data.categories || [];
        const auths = (data.popularAuthors || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          initials: a.initials || a.id.slice(0, 2).toUpperCase(),
          topic: a.topic || 'Author',
        }));
        setCategories(cats);
        setAuthors(auths);
        setSelectedInterests(new Set(cats.slice(0, 4).map((c: any) => c.name)));
        setFollowing(new Set(auths.slice(0, 2).map((a: any) => a.id)));
      })
      .catch(() => setError('Could not load onboarding data'))
      .finally(() => setLoading(false));
  }, []);

  const toggleInterest = (name: string) => {
    const next = new Set(selectedInterests);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedInterests(next);
  };

  const toggleFollow = (id: string) => {
    const next = new Set(following);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFollowing(next);
  };

  const toggleNotif = (name: string) => {
    setToggles(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: Array.from(selectedInterests),
          followIds: Array.from(following),
          notificationPrefs: {
            dailyDigest: toggles['Daily Digest Email'],
            pushNotifications: toggles['Push Notifications'],
            commentReplies: toggles['Comment Replies'],
            weeklyRecap: toggles['Weekly Recap'],
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px 24px' }}>
        <div className="onboard-container">
          <div className="onboard-logo"><span>026</span>Newsblog</div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '32px 24px',
    }}>
      <div className="onboard-container">
        <div className="onboard-logo"><span>026</span>Newsblog</div>

        <div className="onboard-progress">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`progress-seg${s < slide ? ' done' : ''}${s === slide ? ' active' : ''}`}
            />
          ))}
        </div>

        <div className={`onboard-slide${slide === 1 ? ' active' : ''}`}>
          <div className="slide-header">
            <span className="slide-emoji">🎯</span>
            <h1 className="slide-title">What are you interested in?</h1>
            <p className="slide-desc">Pick at least 3 topics so we can personalize your feed.</p>
          </div>

          <div className="interest-grid">
            {categories.map((item) => {
              const isSelected = selectedInterests.has(item.name);
              return (
                <div
                  key={item.name}
                  className={`interest-item${isSelected ? ' selected' : ''}`}
                  onClick={() => toggleInterest(item.name)}
                >
                  <span className="interest-icon">{item.icon}</span>
                  <span className="interest-name">{item.name}</span>
                  <div className="interest-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="interest-hint">{selectedInterests.size} selected · Pick at least 3 to continue</p>

          <div className="onboard-actions">
            <button
              className="btn btn-primary"
              onClick={() => setSlide(2)}
              disabled={selectedInterests.size < 3}
              style={{ opacity: selectedInterests.size >= 3 ? 1 : 0.5 }}
            >
              Continue →
            </button>
          </div>
        </div>

        <div className={`onboard-slide${slide === 2 ? ' active' : ''}`}>
          <div className="slide-header">
            <span className="slide-emoji">✍️</span>
            <h1 className="slide-title">Follow some authors</h1>
            <p className="slide-desc">Get notified when these writers publish new stories.</p>
          </div>

          <div className="author-follow-grid">
            {authors.map((author, i) => {
              const isFollowing = following.has(author.id);
              const colors = authorColors[i % authorColors.length];
              return (
                <div key={author.id} className="author-follow-item">
                  <div
                    className="author-follow-avatar"
                    style={{ background: `linear-gradient(135deg, ${colors.color1}, ${colors.color2})` }}
                  >
                    {author.initials}
                  </div>
                  <div className="author-follow-info">
                    <div className="author-follow-name">{author.name}</div>
                    <div className="author-follow-topic">{author.topic}</div>
                  </div>
                  <button
                    className={`follow-btn${isFollowing ? ' following' : ''}`}
                    onClick={() => toggleFollow(author.id)}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="onboard-actions">
            <button className="btn btn-ghost" onClick={() => setSlide(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setSlide(3)}>Continue →</button>
          </div>
        </div>

        <div className={`onboard-slide${slide === 3 ? ' active' : ''}`}>
          <div className="slide-header">
            <span className="slide-emoji">🔔</span>
            <h1 className="slide-title">Stay in the loop</h1>
            <p className="slide-desc">Choose how you&apos;d like to hear from us.</p>
          </div>

          <div className="notif-prefs">
            {notifPrefs.map((notif) => {
              const isActive = toggles[notif.name];
              return (
                <div key={notif.name} className="notif-pref-item">
                  <div className="notif-pref-icon" style={{ background: notif.bg }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={notif.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {notif.icon === 'email' && <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>}
                      {notif.icon === 'bell' && <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>}
                      {notif.icon === 'comment' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                      {notif.icon === 'chart' && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
                    </svg>
                  </div>
                  <div className="notif-pref-info">
                    <div className="notif-pref-name">{notif.name}</div>
                    <div className="notif-pref-desc">{notif.desc}</div>
                  </div>
                  <div
                    className={`toggle${isActive ? ' active' : ''}`}
                    onClick={() => toggleNotif(notif.name)}
                  />
                </div>
              );
            })}
          </div>

          <div className="onboard-actions">
            <button className="btn btn-ghost" onClick={() => setSlide(2)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setSlide(4)}>Finish Setup →</button>
          </div>
        </div>

        <div className={`onboard-slide${slide === 4 ? ' active' : ''}`}>
          <div className="welcome-final">
            <div className="welcome-avatar">WN</div>
            <h1 className="welcome-name">You&apos;re all set, Wayne!</h1>
            <p className="welcome-msg">Your feed is personalized and ready. Start discovering stories from East Africa&apos;s best writers.</p>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <div className="welcome-stat-value">{selectedInterests.size}</div>
                <div className="welcome-stat-label">Topics selected</div>
              </div>
              <div className="welcome-stat">
                <div className="welcome-stat-value">{following.size}</div>
                <div className="welcome-stat-label">Authors followed</div>
              </div>
              <div className="welcome-stat">
                <div className="welcome-stat-value">{Object.values(toggles).filter(Boolean).length}</div>
                <div className="welcome-stat-label">Notifications on</div>
              </div>
            </div>
            {error && <p style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '12px' }}>{error}</p>}
          </div>
          <div className="onboard-actions">
            <button
              className="btn btn-primary"
              style={{ fontSize: '1rem', width: '100%', flex: 1, textDecoration: 'none' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : '🎉 Start Reading'}
            </button>
          </div>
        </div>

        <Link href="/" className="skip-link">Skip for now</Link>
      </div>
    </div>
  );
}
