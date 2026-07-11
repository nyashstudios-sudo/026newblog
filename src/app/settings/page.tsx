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
  const [username, setUsername] = useState('');
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const sectionRefs: Record<string, React.RefObject<HTMLElement | null>> = {
    profile: useRef<HTMLElement>(null),
    notifications: useRef<HTMLElement>(null),
    security: useRef<HTMLElement>(null),
    accounts: useRef<HTMLElement>(null),
    appearance: useRef<HTMLElement>(null),
    danger: useRef<HTMLElement>(null),
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
        setUsername(p.username || user.username || '');
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
    sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      <div className="settings-layout" style={{ maxWidth: 500, textAlign: 'center', padding: '96px 24px', display: 'block' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Settings</h1>
        <Link href="/auth/login" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Sign in</Link>
      </div>
    );
  }

  const navItems = [
    { id: 'profile', label: 'Profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'notifications', label: 'Notifications', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { id: 'security', label: 'Security', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { id: 'accounts', label: 'Connected', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { id: 'appearance', label: 'Appearance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg> },
    { id: 'danger', label: 'Delete Account', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> },
  ];

  return (
    <div className="settings-layout">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
          background: toast.type === 'success' ? 'var(--success)' : 'var(--error)',
          color: '#fff', boxShadow: '0 4px 16px oklch(0% 0 0 / 0.15)',
          animation: 'fade-in-up 0.3s ease-out',
        }}>{toast.message}</div>
      )}

      <ul className="settings-nav">
        {navItems.map(item => {
          const isDanger = item.id === 'danger';
          return (
            <li
              key={item.id}
              className={`settings-nav-item${activeSection === item.id ? ' active' : ''}${isDanger ? ' danger' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.icon}
              {item.label}
            </li>
          );
        })}
      </ul>

      <div className="settings-content">
        <section ref={sectionRefs.profile} className="settings-section">
          <h2 className="section-title">Profile</h2>
          <p className="section-desc">Your public profile information visible to other readers and authors.</p>

          <div className="profile-edit-row">
            <div className="profile-avatar-edit">
              <div className="profile-avatar">
                {firstName && lastName ? `${firstName[0]}${lastName[0]}` : '?'}
              </div>
              <div className="avatar-edit-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
            </div>
            <div className="profile-fields">
              <div className="field">
                <label className="field-label">First Name</label>
                <input type="text" className="field-input" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Last Name</label>
                <input type="text" className="field-input" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="field field-full">
                <label className="field-label">Username</label>
                <input type="text" className="field-input" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div className="field field-full">
                <label className="field-label">Email</label>
                <input type="email" className="field-input" value={email} disabled style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)', cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Email cannot be changed</span>
              </div>
              <div className="field field-full">
                <label className="field-label">Bio</label>
                <textarea className="field-input" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself" />
              </div>
              <div className="field field-full">
                <label className="field-label">Website</label>
                <input type="url" className="field-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
              </div>
              <div className="field-full" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={saveProfile} disabled={profileSaving} className="btn btn-primary" style={{ opacity: profileSaving ? 0.6 : 1 }}>
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
                {profileSaving && <span className="loading-dots" style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Saving</span>}
              </div>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.notifications} className="settings-section">
          <h2 className="section-title">Notification Preferences</h2>
          <p className="section-desc">Control what you get notified about and how.</p>

          <div className="toggle-list">
            {([
              { key: 'dailyDigest' as const, name: 'Daily Digest Email', desc: 'Top stories delivered to your inbox every morning' },
              { key: 'pushNotifications' as const, name: 'Push Notifications', desc: 'Breaking news and stories from authors you follow' },
              { key: 'commentReplies' as const, name: 'Comment Replies', desc: 'When someone replies to your comments' },
              { key: 'newFollowers' as const, name: 'New Followers', desc: 'When someone follows your profile' },
              { key: 'likesOnComments' as const, name: 'Likes on Comments', desc: 'When someone likes your comment' },
              { key: 'weeklyRecap' as const, name: 'Weekly Reading Report', desc: 'Your reading stats and recommendations every Sunday' },
            ]).map(({ key, name, desc }) => (
              <div key={key} className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-name">{name}</div>
                  <div className="toggle-desc">{desc}</div>
                </div>
                <div
                  className={`toggle-switch${notifs[key] ? ' active' : ''}`}
                  style={{ opacity: notifSaving ? 0.6 : 1, cursor: notifSaving ? 'not-allowed' : 'pointer' }}
                  onClick={() => !notifSaving && toggleNotif(key, !notifs[key])}
                />
              </div>
            ))}
          </div>
        </section>

        <section ref={sectionRefs.security} className="settings-section">
          <h2 className="section-title">Security</h2>
          <p className="section-desc">Keep your account secure.</p>

          <div className="toggle-list">
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-name">Email</div>
                <div className="toggle-desc">{user.email}</div>
              </div>
              <span className="connected-status linked">Verified</span>
            </div>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-name">Password</div>
                <div className="toggle-desc">Change your account password</div>
              </div>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="btn btn-ghost" style={{ flexShrink: 0 }}>
                {showPasswordForm ? 'Cancel' : 'Update'}
              </button>
            </div>
            {showPasswordForm && (
              <form onSubmit={changePassword} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Current password" required className="field-input" style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 characters)" required minLength={8}
                    className="field-input" style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                  <button type="submit" disabled={passwordSaving || !currentPassword || !newPassword} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: passwordSaving ? 0.6 : 1 }}>
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-name">Two-Factor Authentication</div>
                <div className="toggle-desc">Add an extra layer of security to your account</div>
              </div>
              <div
                className={`toggle-switch${twoFactorEnabled ? ' active' : ''}`}
                onClick={() => { setTwoFactorEnabled(!twoFactorEnabled); showToast(twoFactorEnabled ? '2FA disabled' : '2FA enabled', 'success'); }}
              />
            </div>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-name">Active Sessions</div>
                <div className="toggle-desc">2 devices currently logged in</div>
              </div>
              <button className="btn btn-ghost" style={{ flexShrink: 0 }}>Manage</button>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.accounts} className="settings-section">
          <h2 className="section-title">Connected Accounts</h2>
          <p className="section-desc">Link external accounts for faster login and sharing.</p>

          <div className="connected-list">
            <div className="connected-item">
              <div className="connected-icon" style={{ background: 'oklch(92% 0.02 0)' }}>
                <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
              <div className="connected-info">
                <div className="connected-name">Google</div>
                <div className="connected-detail">{email || 'Not connected'}</div>
              </div>
              <span className="connected-status linked">Connected</span>
            </div>
            <div className="connected-item">
              <div className="connected-icon" style={{ background: 'oklch(92% 0.01 180)' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-primary)' }}><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21.5c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              </div>
              <div className="connected-info">
                <div className="connected-name">GitHub</div>
                <div className="connected-detail">Not connected</div>
              </div>
              <span className="connected-status unlinked">Connect</span>
            </div>
            <div className="connected-item">
              <div className="connected-icon" style={{ background: 'var(--mpesa-light)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--mpesa-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div className="connected-info">
                <div className="connected-name">M-Pesa</div>
                <div className="connected-detail">+254 712 ***678</div>
              </div>
              <span className="connected-status linked">Connected</span>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.appearance} className="settings-section">
          <h2 className="section-title">Appearance</h2>
          <p className="section-desc">Customize how 026Newsblog looks for you.</p>

          <div className="theme-options">
            {(['Light', 'Dark', 'System'] as const).map((name, i) => {
              const mode = name.toLowerCase() as 'light' | 'dark' | 'system';
              const isActive = theme === mode;
              return (
                <div key={name} className={`theme-option${isActive ? ' active' : ''}`} onClick={() => setThemeMode(mode)}>
                  <div className="theme-preview" style={{
                    background: i === 0 ? 'linear-gradient(135deg, oklch(97% 0.008 180), oklch(92% 0.01 180))' :
                                i === 1 ? 'linear-gradient(135deg, oklch(14% 0.015 175), oklch(20% 0.02 175))' :
                                'linear-gradient(135deg, oklch(97% 0.008 180) 50%, oklch(14% 0.015 175) 50%)',
                    border: '1px solid var(--border)',
                  }} />
                  <span className="theme-option-name">{name}</span>
                </div>
              );
            })}
          </div>

          <div className="toggle-list" style={{ marginTop: 20 }}>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-name">Reduce Motion</div>
                <div className="toggle-desc">Minimize animations throughout the interface</div>
              </div>
              <div className={`toggle-switch${reduceMotion ? ' active' : ''}`} onClick={() => setReduceMotion(!reduceMotion)} />
            </div>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-name">Compact View</div>
                <div className="toggle-desc">Show more articles with smaller cards</div>
              </div>
              <div className={`toggle-switch${compactView ? ' active' : ''}`} onClick={() => setCompactView(!compactView)} />
            </div>
          </div>
        </section>

        <section ref={sectionRefs.danger} className="settings-section danger-section">
          <h2 className="section-title" style={{ color: 'var(--error)' }}>Danger Zone</h2>
          <p className="section-desc">Irreversible actions. Proceed with caution.</p>

          <div className="danger-actions">
            <button className="btn btn-danger-ghost">Deactivate Account</button>
            <button className="btn btn-danger">Delete Account Permanently</button>
          </div>
        </section>
      </div>

      <div className="save-bar">
        <span className="save-bar-text">You have unsaved changes</span>
        <button className="btn btn-ghost" style={{ flex: 'none' }}>Discard</button>
        <button className="btn btn-primary" style={{ flex: 'none' }}>Save Changes</button>
      </div>
    </div>
  );
}
