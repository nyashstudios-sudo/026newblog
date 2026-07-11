'use client';

import { useState } from 'react';
import Link from 'next/link';

const interests = [
  { icon: '💻', name: 'Technology' },
  { icon: '📈', name: 'Business' },
  { icon: '🧬', name: 'Science' },
  { icon: '🎨', name: 'Culture' },
  { icon: '🏥', name: 'Health' },
  { icon: '🤖', name: 'AI & ML' },
  { icon: '⚽', name: 'Sports' },
  { icon: '🌍', name: 'Politics' },
  { icon: '💰', name: 'Fintech' },
  { icon: '🚀', name: 'Startups' },
  { icon: '🎵', name: 'Music' },
  { icon: '📚', name: 'Education' },
];

const authors = [
  { initials: 'AM', name: 'Amara Mwangi', topic: 'Technology · AI · 48K views/month', color1: 'oklch(50% 0.14 220)', color2: 'oklch(45% 0.12 200)' },
  { initials: 'KO', name: 'Kwame Osei', topic: 'Business · Fintech · 31K views/month', color1: 'oklch(50% 0.14 30)', color2: 'oklch(50% 0.12 50)' },
  { initials: 'FN', name: 'Dr. Fatima Ndegwa', topic: 'Science · Health · 24K views/month', color1: 'oklch(50% 0.14 140)', color2: 'oklch(45% 0.12 160)' },
  { initials: 'ZA', name: 'Zuri Abara', topic: 'Culture · Afrofuturism · 22K views/month', color1: 'oklch(50% 0.14 310)', color2: 'oklch(45% 0.12 330)' },
  { initials: 'ES', name: 'Eliud Sang', topic: 'Sports · Athletics · 18K views/month', color1: 'oklch(50% 0.14 25)', color2: 'oklch(50% 0.12 40)' },
];

export default function OnboardingPage() {
  const [slide, setSlide] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set(['Technology', 'Business', 'Science', 'AI & ML']));
  const [following, setFollowing] = useState<Set<string>>(new Set(['Amara Mwangi', 'Kwame Osei']));
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Daily Digest Email': true,
    'Push Notifications': true,
    'Comment Replies': true,
    'Weekly Recap': false,
  });

  const toggleInterest = (name: string) => {
    const next = new Set(selectedInterests);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedInterests(next);
  };

  const toggleFollow = (name: string) => {
    const next = new Set(following);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setFollowing(next);
  };

  const toggleNotif = (name: string) => {
    setToggles(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div style={{
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      transition: 'background 0.4s var(--ease-out-expo), color 0.4s var(--ease-out-expo)',
    }}>
      <div style={{ width: '100%', maxWidth: 600, position: 'relative' }}>
        <div style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, marginBottom: 40 }}>
          <span style={{ color: 'var(--primary)' }}>026</span>Newsblog
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s < slide ? 'var(--success)' : s === slide ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.4s var(--ease-out-expo)',
            }} />
          ))}
        </div>

        {/* Slide 1: Interests */}
        {slide === 1 && (
          <div style={{ animation: 'fadeIn 0.5s var(--ease-out-expo)' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: '3rem', marginBottom: 16, display: 'block' }}>🎯</span>
              <h1 style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: '1.8rem', fontWeight: 700, marginBottom: 8, textWrap: 'balance',
              }}>
                What are you interested in?
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '45ch', margin: '0 auto' }}>
                Pick at least 3 topics so we can personalize your feed.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 32 }}>
              {interests.map((item) => {
                const isSelected = selectedInterests.has(item.name);
                return (
                  <div
                    key={item.name}
                    onClick={() => toggleInterest(item.name)}
                    style={{
                      padding: '16px 12px', borderRadius: 12,
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                      textAlign: 'center', cursor: 'pointer', userSelect: 'none',
                      transition: 'all 0.2s var(--ease-out-expo)',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', marginBottom: 6, display: 'block' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.name}</span>
                    {isSelected && (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '6px auto 0',
                      }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 10, height: 10, color: 'oklch(98% 0.005 175)' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>
              {selectedInterests.size} selected · Pick at least 3 to continue
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setSlide(2)}
                disabled={selectedInterests.size < 3}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 11, fontSize: '0.88rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                  background: selectedInterests.size >= 3 ? 'var(--primary)' : 'var(--border)',
                  color: selectedInterests.size >= 3 ? 'oklch(98% 0.005 175)' : 'var(--text-tertiary)',
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Slide 2: Follow Authors */}
        {slide === 2 && (
          <div style={{ animation: 'fadeIn 0.5s var(--ease-out-expo)' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: '3rem', marginBottom: 16, display: 'block' }}>✍️</span>
              <h1 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>
                Follow some authors
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Get notified when these writers publish new stories.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {authors.map((author) => {
                const isFollowing = following.has(author.name);
                return (
                  <div key={author.name} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', fontWeight: 700, color: 'oklch(98% 0.005 175)',
                      background: `linear-gradient(135deg, ${author.color1}, ${author.color2})`,
                      flexShrink: 0,
                    }}>
                      {author.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{author.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{author.topic}</div>
                    </div>
                    <button
                      onClick={() => toggleFollow(author.name)}
                      style={{
                        padding: '7px 16px', borderRadius: 8,
                        border: isFollowing ? 'none' : '1.5px solid var(--border)',
                        background: isFollowing ? 'var(--primary)' : 'transparent',
                        fontSize: '0.75rem', fontWeight: 600,
                        color: isFollowing ? 'oklch(98% 0.005 175)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSlide(1)} style={{
                flex: 1, padding: '14px 24px', borderRadius: 11, fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-tertiary)',
              }}>
                ← Back
              </button>
              <button onClick={() => setSlide(3)} style={{
                flex: 1, padding: '14px 24px', borderRadius: 11, fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                background: 'var(--primary)', color: 'oklch(98% 0.005 175)',
              }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Slide 3: Notifications */}
        {slide === 3 && (
          <div style={{ animation: 'fadeIn 0.5s var(--ease-out-expo)' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: '3rem', marginBottom: 16, display: 'block' }}>🔔</span>
              <h1 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>
                Stay in the loop
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Choose how you&apos;d like to hear from us.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                { name: 'Daily Digest Email', desc: 'Top 5 stories delivered every morning', icon: 'email', bg: 'oklch(92% 0.04 175)', stroke: 'oklch(45% 0.12 175)' },
                { name: 'Push Notifications', desc: 'Breaking news and followed author updates', icon: 'bell', bg: 'oklch(92% 0.04 55)', stroke: 'oklch(55% 0.15 55)' },
                { name: 'Comment Replies', desc: 'When someone replies to your comments', icon: 'comment', bg: 'oklch(92% 0.04 145)', stroke: 'oklch(45% 0.12 145)' },
                { name: 'Weekly Recap', desc: 'Your reading stats and top stories every Sunday', icon: 'chart', bg: 'oklch(92% 0.04 310)', stroke: 'oklch(50% 0.12 310)' },
              ].map((notif) => (
                <div key={notif.name} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: 16, borderRadius: 12, background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: notif.bg,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={notif.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                      {notif.icon === 'email' && <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>}
                      {notif.icon === 'bell' && <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>}
                      {notif.icon === 'comment' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                      {notif.icon === 'chart' && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{notif.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{notif.desc}</div>
                  </div>
                  <div
                    onClick={() => setToggles(prev => ({ ...prev, [notif.name]: !prev[notif.name] }))}
                    style={{
                      width: 42, height: 24, borderRadius: 12,
                      background: toggles[notif.name] ? 'var(--primary)' : 'var(--border)',
                      position: 'relative', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3, left: toggles[notif.name] ? 21 : 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'var(--bg-elevated)',
                      transition: 'left 0.2s var(--ease-out-expo)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSlide(2)} style={{
                flex: 1, padding: '14px 24px', borderRadius: 11, fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-tertiary)',
              }}>
                ← Back
              </button>
              <button onClick={() => setSlide(4)} style={{
                flex: 1, padding: '14px 24px', borderRadius: 11, fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                background: 'var(--primary)', color: 'oklch(98% 0.005 175)',
              }}>
                Finish Setup →
              </button>
            </div>
          </div>
        )}

        {/* Slide 4: Done */}
        {slide === 4 && (
          <div style={{ animation: 'fadeIn 0.5s var(--ease-out-expo)' }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'linear-gradient(135deg, oklch(50% 0.15 175), oklch(45% 0.12 220))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: 700, color: 'oklch(98% 0.005 175)',
                margin: '0 auto 20px',
              }}>
                WN
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>
                You&apos;re all set, Wayne!
              </h1>
              <p style={{
                fontSize: '0.9rem', color: 'var(--text-secondary)',
                maxWidth: '40ch', margin: '0 auto 28px', lineHeight: 1.5,
              }}>
                Your feed is personalized and ready. Start discovering stories from East Africa&apos;s best writers.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
                {[
                  { value: selectedInterests.size, label: 'Topics selected' },
                  { value: following.size, label: 'Authors followed' },
                  { value: Object.values(toggles).filter(Boolean).length, label: 'Notifications on' },
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/">
              <button style={{
                width: '100%', padding: '14px 24px', borderRadius: 11,
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', border: 'none',
                background: 'var(--primary)', color: 'oklch(98% 0.005 175)',
              }}>
                🎉 Start Reading
              </button>
            </Link>
          </div>
        )}

        <Link href="/" style={{
          display: 'block', textAlign: 'center', marginTop: 16,
          fontSize: '0.78rem', color: 'var(--text-tertiary)', textDecoration: 'none',
        }}>
          Skip for now
        </Link>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
