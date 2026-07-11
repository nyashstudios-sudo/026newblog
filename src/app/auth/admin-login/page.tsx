'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AdminLoginPage() {
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
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      if (!data.user) { setError('Unexpected response'); setLoading(false); return; }
      if (data.user.role !== 'admin') { setError('Access denied. Admin privileges required.'); setLoading(false); return; }
      try { await refresh(); } catch {}
      router.push('/admin');
    } catch {
      setError('Connection error. Please try again.');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div className="brand-logo"><span>026</span>Newsblog</div>
        <div className="brand-content">
          <h1 className="brand-headline">Admin Portal</h1>
          <p className="brand-desc">Authorised personnel only. This portal provides access to platform management, user administration, content moderation, and system configuration.</p>
          <div className="brand-security-notice">
            <div className="brand-feature" style={{ marginTop: 24 }}>
              <div className="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <span>Secured with 256-bit encryption</span>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span>All actions are logged and audited</span>
            </div>
          </div>
        </div>
        <div className="brand-footer">
          <Link href="/auth/login" className="brand-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to main site
          </Link>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="theme-toggle">
          <ThemeToggle />
        </div>
        <div className="auth-form-wrap">
          <div className="form-header">
            <div className="admin-login-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 className="form-title">Admin Sign In</h2>
            <p className="form-subtitle">Enter your admin credentials to continue</p>
          </div>

          <form onSubmit={submit}>
            <div className="form-fields">
              <div className="field">
                <label className="field-label">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                  placeholder="admin@example.com"
                  required
                  autoFocus
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
              {loading ? 'Authenticating...' : 'Sign In to Admin'}
            </button>
          </form>

          <div className="form-footer" style={{ marginTop: 24 }}>
            <Link href="/auth/login" style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', textDecoration: 'none' }}>
              Not an admin? Sign in as regular user →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
