'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

type Toast = { message: string; type: 'success' | 'error' } | null;
type NotifPrefs = { dailyDigest: boolean; pushNotifications: boolean; commentReplies: boolean; newFollowers: boolean; likesOnComments: boolean; weeklyRecap: boolean };

const INITIAL_NOTIFS: NotifPrefs = { dailyDigest: true, pushNotifications: true, commentReplies: true, newFollowers: false, likesOnComments: false, weeklyRecap: true };

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [notifs, setNotifs] = useState<NotifPrefs>(INITIAL_NOTIFS);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [activeSection, setActiveSection] = useState('profile');
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const sectionRefs = {
    profile: useRef<HTMLElement>(null),
    notifications: useRef<HTMLElement>(null),
    security: useRef<HTMLElement>(null),
    appearance: useRef<HTMLElement>(null),
  };

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/users/${user.username}`).then(r => r.json()).then(d => {
      const p = d.profile;
      if (p) {
        setBio(p.bio || '');
        setWebsite(p.website || '');
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setEmail(p.email || user.email || '');
      }
    }).catch(() => {});
    fetch(`/api/users/${user.username}/notifications`).then(r => r.json()).then(d => {
      if (d.preferences) setNotifs({ ...INITIAL_NOTIFS, ...d.preferences });
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light') setTheme('light');
    else if (attr === 'dark') setTheme('dark');
    else setTheme('system');
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs[id as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch(`/api/users/${user!.username}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bio, website, firstName, lastName }),
      });
      if (res.ok) showToast('Profile saved', 'success');
      else { const d = await res.json(); showToast(d.error || 'Failed to save', 'error'); }
    } catch { showToast('Connection error', 'error'); }
    finally { setProfileSaving(false); }
  };

  const toggleNotif = async (key: keyof NotifPrefs, value: boolean) => {
    setNotifSaving(true);
    setNotifs(p => ({ ...p, [key]: value }));
    try {
      const res = await fetch(`/api/users/${user!.username}/notifications`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) showToast('Notification preference updated', 'success');
      else showToast('Failed to update', 'error');
    } catch { showToast('Connection error', 'error'); }
    finally { setNotifSaving(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setPasswordSaving(true);
    try {
      const res = await fetch(`/api/users/${user!.username}/password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) { showToast('Password updated', 'success'); setCurrentPassword(''); setNewPassword(''); setShowPasswordForm(false); }
      else { const d = await res.json(); showToast(d.error || 'Failed to update password', 'error'); }
    } catch { showToast('Connection error', 'error'); }
    finally { setPasswordSaving(false); }
  };

  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setTheme(mode);
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
    showToast(`Theme set to ${mode}`, 'success');
  };

  if (authLoading) return null;

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
    { id: 'appearance', label: 'Appearance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg> },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40 }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
          background: toast.type === 'success' ? 'var(--success)' : 'var(--error)',
          color: '#fff', boxShadow: '0 4px 16px oklch(0% 0 0 / 0.15)',
          animation: 'fade-in-up 0.3s ease-out',
        }}>{toast.message}</div>
      )}

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 96, alignSelf: 'flex-start' }}>
        {navItems.map(item => (
          <li key={item.id} onClick={() => scrollToSection(item.id)} style={{
            padding: '10px 14px', borderRadius: 9, fontSize: '0.84rem', fontWeight: activeSection === item.id ? 600 : 500,
            color: activeSection === item.id ? 'var(--primary)' : 'var(--text-secondary)',
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
                <input type="email" value={email} disabled
                  style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-inset)', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Email cannot be changed</span>
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
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={saveProfile} disabled={profileSaving} style={{
                  padding: '9px 18px', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  opacity: profileSaving ? 0.6 : 1,
                }}>
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
                {profileSaving && <span className="loading-dots" style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Saving</span>}
              </div>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.notifications} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Notification Preferences</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>Control what you get notified about and how.</p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {([
              { key: 'dailyDigest' as const, name: 'Daily Digest Email', desc: 'Top stories delivered to your inbox every morning' },
              { key: 'pushNotifications' as const, name: 'Push Notifications', desc: 'Breaking news and stories from authors you follow' },
              { key: 'commentReplies' as const, name: 'Comment Replies', desc: 'When someone replies to your comments' },
              { key: 'newFollowers' as const, name: 'New Followers', desc: 'When someone follows your profile' },
              { key: 'likesOnComments' as const, name: 'Likes on Comments', desc: 'When someone likes your comment' },
              { key: 'weeklyRecap' as const, name: 'Weekly Reading Report', desc: 'Your reading stats and recommendations every Sunday' },
            ]).map(({ key, name, desc }, i) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{desc}</div>
                </div>
                <div onClick={() => !notifSaving && toggleNotif(key, !notifs[key])} style={{
                  width: 42, height: 24, borderRadius: 12,
                  background: notifs[key] ? 'var(--primary)' : 'var(--border)',
                  position: 'relative', cursor: notifSaving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', flexShrink: 0, opacity: notifSaving ? 0.6 : 1,
                }}>
                  <div style={{
                    position: 'absolute', top: 3,
                    left: notifs[key] ? 21 : 3, width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--bg-elevated)', transition: 'left 0.2s',
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
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{user.email}</div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600, background: 'var(--success-light)', color: 'var(--success)' }}>Verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Password</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Change your account password</div>
              </div>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{
                padding: '8px 16px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 600,
                background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}>{showPasswordForm ? 'Cancel' : 'Update'}</button>
            </div>
            {showPasswordForm && (
              <form onSubmit={changePassword} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Current password" required
                    style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  />
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 characters)" required minLength={8}
                    style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  />
                  <button type="submit" disabled={passwordSaving || !currentPassword || !newPassword} style={{
                    padding: '9px 18px', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600,
                    background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start',
                    opacity: passwordSaving ? 0.6 : 1,
                  }}>
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section ref={sectionRefs.appearance} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Appearance</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 24 }}>Customize how 026Newsblog looks for you.</p>

          <div style={{ display: 'flex', gap: 12 }}>
            {(['Light', 'Dark', 'System'] as const).map((name, i) => {
              const mode = name.toLowerCase() as 'light' | 'dark' | 'system';
              const isActive = theme === mode;
              return (
                <div key={name} onClick={() => setThemeMode(mode)} style={{
                  flex: 1, padding: 16, borderRadius: 12,
                  border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                }}>
                  <div style={{
                    width: '100%', height: 48, marginBottom: 8, borderRadius: 8,
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
        </section>
      </div>
    </div>
  );
}
