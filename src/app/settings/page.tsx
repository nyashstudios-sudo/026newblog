'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [saved, setSaved] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [activeSection, setActiveSection] = useState('profile');

  const sectionRefs = {
    profile: useRef<HTMLElement>(null),
    notifications: useRef<HTMLElement>(null),
    security: useRef<HTMLElement>(null),
    connected: useRef<HTMLElement>(null),
    appearance: useRef<HTMLElement>(null),
    danger: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user.username}`)
        .then(r => r.json())
        .then(d => {
          const p = d.profile;
          if (p) {
            setBio(p.bio || '');
            setWebsite(p.website || '');
            setFirstName(p.firstName || '');
            setLastName(p.lastName || '');
            setEmail(p.email || user.email || '');
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs[id as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveProfile = async () => {
    setSaved(false);
    try {
      const res = await fetch(`/api/users/${user!.username}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bio, website, firstName, lastName }),
      });
      if (res.ok) setSaved(true);
    } catch { /* ignore */ }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Settings</h1>
        <Link href="/auth/login" style={{ padding: '10px 22px', borderRadius: 9, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
      </div>
    );
  }

  const navItems = [
    { id: 'profile', label: 'Profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'notifications', label: 'Notifications', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { id: 'security', label: 'Security', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { id: 'connected', label: 'Connected', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { id: 'appearance', label: 'Appearance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg> },
    { id: 'danger', label: 'Delete Account', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>, danger: true },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40 }}>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 96, alignSelf: 'flex-start' }}>
        {navItems.map(item => (
          <li key={item.id} onClick={() => scrollToSection(item.id)} style={{
            padding: '10px 14px', borderRadius: 9, fontSize: '0.84rem', fontWeight: activeSection === item.id ? 600 : 500,
            color: item.danger ? 'var(--error)' : activeSection === item.id ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10,
            background: activeSection === item.id ? 'var(--primary-light)' : 'transparent',
          }}
            onMouseEnter={e => { if (activeSection !== item.id) e.currentTarget.style.background = 'var(--bg-inset)'; }}
            onMouseLeave={e => { if (activeSection !== item.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ width: 16, height: 16, opacity: activeSection === item.id ? 1 : 0.7 }}>{item.icon}</span>
            {item.label}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <section ref={sectionRefs.profile} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Profile</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>Your public profile information visible to other readers and authors.</p>

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 18,
                background: 'linear-gradient(135deg, oklch(50% 0.15 175), oklch(45% 0.12 220))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, color: 'oklch(98% 0.005 175)',
              }}>
                {firstName && lastName ? `${firstName[0]}${lastName[0]}` : '?'}
              </div>
              <div style={{
                position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: 7,
                background: 'var(--primary)', border: '2px solid var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(98% 0.005 175)" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', minHeight: 80, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Website</label>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com"
                  style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.notifications} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Notification Preferences</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>Control what you get notified about and how.</p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { name: 'Daily Digest Email', desc: 'Top stories delivered to your inbox every morning' },
              { name: 'Push Notifications', desc: 'Breaking news and stories from authors you follow' },
              { name: 'Comment Replies', desc: 'When someone replies to your comments' },
              { name: 'New Followers', desc: 'When someone follows your profile' },
              { name: 'Likes on Comments', desc: 'When someone likes your comment' },
              { name: 'Weekly Reading Report', desc: 'Your reading stats and recommendations every Sunday' },
            ].map((notif, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{notif.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{notif.desc}</div>
                </div>
                <div onClick={e => (e.currentTarget as HTMLElement).classList.toggle('active')} style={{
                  width: 42, height: 24, borderRadius: 12, background: i < 3 ? 'var(--primary)' : 'var(--border)',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: i < 3 ? 21 : 3, width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--bg-elevated)', transition: 'transform 0.2s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={sectionRefs.security} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Security</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>Keep your account secure.</p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Email</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{email || user.email}</div>
              </div>
              <button style={{ padding: '8px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 600, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Change</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Password</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Last changed 3 months ago</div>
              </div>
              <button style={{ padding: '8px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 600, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Update</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Two-Factor Authentication</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Add an extra layer of security to your account</div>
              </div>
              <div onClick={e => (e.currentTarget as HTMLElement).classList.toggle('active')} style={{
                width: 42, height: 24, borderRadius: 12, background: 'var(--border)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--bg-elevated)', transition: 'transform 0.2s',
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Active Sessions</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>2 devices currently logged in</div>
              </div>
              <button style={{ padding: '8px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 600, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Manage</button>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.connected} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Connected Accounts</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>Link external accounts for faster login and sharing.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 11, background: 'var(--bg-inset)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'oklch(92% 0.02 0)' }}>
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Google</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{email || 'Connected'}</div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, background: 'var(--success-light)', color: 'var(--success)' }}>Connected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 11, background: 'var(--bg-inset)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'oklch(92% 0.01 180)' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: 'var(--text-primary)' }}><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21.5c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>GitHub</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Not connected</div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, background: 'var(--bg-surface)', color: 'var(--text-tertiary)', border: '1px solid var(--border)', cursor: 'pointer' }}>Connect</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 11, background: 'var(--bg-inset)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'oklch(92% 0.04 145)' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="oklch(50% 0.14 145)" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>M-Pesa</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>+254 712 ***678</div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, background: 'var(--success-light)', color: 'var(--success)' }}>Connected</span>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.appearance} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Appearance</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>Customize how 026Newsblog looks for you.</p>

          <div style={{ display: 'flex', gap: 12 }}>
            {['Light', 'Dark', 'System'].map((name, i) => {
              const isActive = (i === 0 && document.documentElement.getAttribute('data-theme') === 'light') ||
                              (i === 1 && document.documentElement.getAttribute('data-theme') === 'dark') ||
                              (i === 2 && !document.documentElement.getAttribute('data-theme'));
              return (
                <div key={name} onClick={() => {
                  if (i === 0) document.documentElement.setAttribute('data-theme', 'light');
                  else if (i === 1) document.documentElement.setAttribute('data-theme', 'dark');
                  else document.documentElement.removeAttribute('data-theme');
                }} style={{
                  flex: 1, padding: 16, borderRadius: 12,
                  border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                }}>
                  <div style={{
                    width: '100%', height: 48, marginBottom: 8,
                    borderRadius: 8,
                    background: i === 0 ? 'linear-gradient(135deg, oklch(97% 0.008 180), oklch(92% 0.01 180))' :
                                i === 1 ? 'linear-gradient(135deg, oklch(14% 0.015 175), oklch(20% 0.02 175))' :
                                'linear-gradient(135deg, oklch(97% 0.008 180) 50%, oklch(14% 0.015 175) 50%)',
                    border: '1px solid var(--border)',
                  }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{name}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Reduce Motion</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Minimize animations throughout the interface</div>
              </div>
              <div onClick={e => (e.currentTarget as HTMLElement).classList.toggle('active')} style={{
                width: 42, height: 24, borderRadius: 12, background: 'var(--border)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--bg-elevated)', transition: 'transform 0.2s',
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Compact View</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Show more articles with smaller cards</div>
              </div>
              <div onClick={e => (e.currentTarget as HTMLElement).classList.toggle('active')} style={{
                width: 42, height: 24, borderRadius: 12, background: 'var(--border)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--bg-elevated)', transition: 'transform 0.2s',
                }} />
              </div>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.danger} style={{ background: 'var(--bg-surface)', border: '1px solid oklch(85% 0.03 25)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4, color: 'var(--error)' }}>Danger Zone</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>Irreversible actions. Proceed with caution.</p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              padding: '10px 18px', borderRadius: 9, fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', border: '1px solid var(--error-light)',
              background: 'transparent', color: 'var(--error)',
            }}>Deactivate Account</button>
            <button onClick={logout} style={{
              padding: '10px 18px', borderRadius: 9, fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', border: 'none',
              background: 'var(--error)', color: 'oklch(98% 0.005 25)',
            }}>Delete Account Permanently</button>
          </div>
        </section>

        <div style={{
          position: 'sticky', bottom: 24, display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14,
          padding: '12px 20px', alignSelf: 'center', zIndex: 40,
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>You have unsaved changes</span>
          <button style={{
            padding: '8px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 600,
            background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Discard</button>
          <button onClick={saveProfile} style={{
            padding: '8px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 600,
            background: 'var(--primary)', color: 'oklch(98% 0.005 175)', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{saved ? 'Saved!' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}
