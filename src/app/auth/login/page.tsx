'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      await refresh();
      if (data.user.role === 'admin') router.push('/admin');
      else if (data.user.role === 'author') router.push('/author/dashboard');
      else router.push('/');
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div className="brand-logo"><span>026</span>Newsblog</div>
        <div className="brand-content">
          <h1 className="brand-headline">Stories that matter, from voices that count.</h1>
          <p className="brand-desc">Join thousands of readers discovering the best writing on technology, business, culture, and innovation across East Africa and beyond.</p>
          <div className="brand-features">
            {[
              { icon: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z', text: 'Save articles and build your personal reading list' },
              { icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', text: 'Join conversations and connect with authors' },
              { icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', text: 'Get personalized recommendations based on your interests' },
              { icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', text: 'Apply to become an author and earn from your writing' },
            ].map((f, i) => (
              <div key={i} className="brand-feature">
                <div className="brand-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div className="brand-footer">
          {[
            { value: '12K+', label: 'Active Readers' },
            { value: '47', label: 'Authors' },
            { value: '1,200+', label: 'Articles' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="brand-stat-divider" />}
              <div className="brand-stat">
                <div className="brand-stat-value">{s.value}</div>
                <div className="brand-stat-label">{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="theme-toggle">
          <ThemeToggle />
        </div>
        <div className="auth-form-wrap">
          <div className="form-header">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">
              Don&apos;t have an account? <Link href="/auth/register">Sign up free</Link>
            </p>
          </div>

          <div className="oauth-buttons">
            <button className="oauth-btn">
              <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button className="oauth-btn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21.5c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              Continue with GitHub
            </button>
          </div>

          <div className="form-divider">
            <div className="form-divider-line" />
            <span className="form-divider-text">or with email</span>
            <div className="form-divider-line" />
          </div>

          <form onSubmit={submit}>
            <div className="form-fields">
              <div className="field">
                <label className="field-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                  placeholder="wayne@example.com"
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field-input"
                    placeholder="Enter your password"
                    required
                  />
                  <span className="field-icon" onClick={() => setShowPassword(!showPassword)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={showPassword ? 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22' : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'} />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            {error && <p className="field-helper" style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="form-footer">
            Secured with 256-bit encryption
          </div>

          <div className="author-banner">
            <div className="author-banner-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            </div>
            <div className="author-banner-text">
              <div className="author-banner-title">Want to write?</div>
              <div className="author-banner-desc">Apply to become an author and earn from your content</div>
            </div>
            <Link href="/author/apply" className="author-banner-link">Apply →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
