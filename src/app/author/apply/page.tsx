'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STEPS = ['Personal Info', 'Writing Experience', 'Topics & Portfolio', 'Review & Submit'];

export default function AuthorApplyPage() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    professionalTitle: '',
    writingNiche: '',
    yearsExperience: '',
    bio: '',
    portfolioUrl: '',
    linkedinUrl: '',
    motivation: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/author/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Become an Author</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Sign in to apply as a content creator</p>
        <Link href="/auth/login"><Button>Sign in</Button></Link>
      </div>
    );
  }

  if (submitted) {
    const initials = `${user.firstName[0]}${user.lastName[0]}`;
    return (
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <Link href="/" className="dash-sidebar-logo"><span>026</span>Newsblog</Link>
          <div className="dash-sidebar-role">Author</div>
          <div className="dash-sidebar-section">
            <div className="dash-sidebar-label">Main</div>
            <nav className="dash-sidebar-nav">
              <Link href="/author/dashboard" className="dash-sidebar-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="dash-sidebar-section">
            <div className="dash-sidebar-label">Quick Links</div>
            <nav className="dash-sidebar-nav">
              <Link href="/" className="dash-sidebar-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                Public Home
              </Link>
            </nav>
          </div>
          <div className="dash-sidebar-footer">
            <Link href={`/profile/${user.username}`} className="dash-sidebar-profile" style={{ textDecoration: 'none' }}>
              <div className="dash-sidebar-avatar">{initials}</div>
              <div className="dash-sidebar-profile-info">
                <div className="dash-sidebar-profile-name">{user.firstName} {user.lastName}</div>
                <div className="dash-sidebar-profile-role">{user.role}</div>
              </div>
            </Link>
          </div>
        </aside>
        <main className="dash-main">
          <div style={{ maxWidth: 620, margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 36, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36, color: 'var(--success)' }}><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Application Submitted!</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '40ch', margin: '0 auto 24px' }}>Our editorial team will review your portfolio within 48 hours. You&apos;ll receive an email with the decision.</p>
              <Link href="/"><Button>← Back to Homepage</Button></Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const navItems = [
    { href: '/author/dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { href: '/author/editor', label: 'Editor', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
  ];

  const stepCircle = (n: number) => {
    const isActive = step === n;
    const isDone = n < step;
    return (
      <div key={n} style={{
        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700,
        background: isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--bg-inset)',
        color: '#fff',
        border: `2px solid ${isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--border)'}`,
        transition: 'all 0.3s',
      }}>
        {isDone ? '✓' : n}
      </div>
    );
  };

  const stepLine = (n: number) => (
    <div key={`l${n}`} style={{
      flex: 1, height: 2,
      background: n < step ? 'var(--success)' : 'var(--border)',
      transition: 'background 0.3s',
    }} />
  );

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-logo"><span>026</span>Newsblog</Link>
        <div className="dash-sidebar-role">Author</div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Main</div>
          <nav className="dash-sidebar-nav">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`dash-sidebar-link${active ? ' active' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Quick Links</div>
          <nav className="dash-sidebar-nav">
            <Link href="/" className="dash-sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Public Home
            </Link>
          </nav>
        </div>
        <div className="dash-sidebar-footer">
          <Link href={`/profile/${user.username}`} className="dash-sidebar-profile" style={{ textDecoration: 'none' }}>
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className="dash-sidebar-profile-info">
              <div className="dash-sidebar-profile-name">{user.firstName} {user.lastName}</div>
              <div className="dash-sidebar-profile-role">{user.role}</div>
            </div>
          </Link>
        </div>
      </aside>

      <main className="dash-main">
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div className="dash-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <h1 className="dash-title">Become an Author</h1>
              <p className="dash-subtitle">Share your stories with the 026Newsblog community</p>
            </div>
          </div>

          <form onSubmit={submit}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
              {stepCircle(1)}{stepLine(1)}{stepCircle(2)}{stepLine(2)}{stepCircle(3)}{stepLine(3)}{stepCircle(4)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -28, marginBottom: 32, fontSize: '0.72rem', color: 'var(--text-tertiary)', padding: '0 4px' }}>
              {STEPS.map((label, i) => (
                <span key={i} style={{ fontWeight: step >= i + 1 ? 600 : 400, color: step >= i + 1 ? 'var(--primary)' : undefined, textAlign: 'center', width: 90 }}>{label}</span>
              ))}
            </div>

            {error && <p style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: 16, textAlign: 'center' }}>{error}</p>}

            {step === 1 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 36, marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>About You</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, maxWidth: '45ch', margin: '0 auto 32px' }}>Tell us who you are and what you write about.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>First Name</label>
                    <Input value={form.firstName} onChange={e => update('firstName', e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Last Name</label>
                    <Input value={form.lastName} onChange={e => update('lastName', e.target.value)} required />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Professional Title</label>
                  <Input value={form.professionalTitle} onChange={e => update('professionalTitle', e.target.value)} placeholder="e.g. Tech Journalist, Business Analyst, Researcher" required />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Writing Niche</label>
                  <select
                    value={form.writingNiche}
                    onChange={e => update('writingNiche', e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.88rem',
                      fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                    }}
                  >
                    <option value="">Select a niche</option>
                    <option>Technology</option>
                    <option>Business & Finance</option>
                    <option>Science & Health</option>
                    <option>Culture & Arts</option>
                    <option>Sports</option>
                    <option>Politics</option>
                    <option>Opinion</option>
                    <option>Education</option>
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Bio (public)</label>
                  <textarea
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    placeholder="Tell readers what you write about and why they should follow you..."
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.88rem',
                      fontFamily: 'inherit', outline: 'none', minHeight: 100, resize: 'vertical', lineHeight: 1.5,
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>150-300 characters recommended</span>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Years of Writing Experience</label>
                  <select
                    value={form.yearsExperience}
                    onChange={e => update('yearsExperience', e.target.value)}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.88rem',
                      fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                    }}
                  >
                    <option value="">Select experience</option>
                    <option>Less than 1 year</option>
                    <option>1-3 years</option>
                    <option>3-5 years</option>
                    <option>5-10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={nextStep} style={{
                    flex: 1, padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                    background: 'var(--primary)', color: '#fff', transition: 'all 0.2s',
                  }}>Continue →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 36, marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Writing Experience</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, maxWidth: '45ch', margin: '0 auto 32px' }}>Share your background and writing experience with us.</p>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Portfolio URL (optional)</label>
                  <Input type="url" value={form.portfolioUrl} onChange={e => update('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.com or Medium/Substack link" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>Link to your blog, Medium, Substack, or professional portfolio</span>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>LinkedIn Profile</label>
                  <Input type="url" value={form.linkedinUrl} onChange={e => update('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Upload Sample Articles (PDF or DOC)</label>
                  <div style={{
                    border: '2px dashed var(--border)', borderRadius: 12, padding: 28, textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.2s', background: 'var(--bg-inset)',
                  }}>
                    <div style={{ marginBottom: 8, color: 'var(--text-tertiary)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--primary)' }}>Click to upload</strong> or drag and drop</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>PDF or DOC up to 10MB · Max 3 files</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={prevStep} style={{
                    flex: 1, padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', background: 'transparent',
                    color: 'var(--text-secondary)', border: '1px solid var(--border)',
                  }}>← Back</button>
                  <button type="button" onClick={nextStep} style={{
                    flex: 1, padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                    background: 'var(--primary)', color: '#fff',
                  }}>Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 36, marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Topics & Portfolio</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, maxWidth: '45ch', margin: '0 auto 32px' }}>Tell us about your topics of interest and upload your best work.</p>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Topics You Want to Cover</label>
                  <textarea
                    placeholder="List the topics you're most interested in writing about..."
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.88rem',
                      fontFamily: 'inherit', outline: 'none', minHeight: 100, resize: 'vertical', lineHeight: 1.5,
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Additional Portfolio Links</label>
                  <Input placeholder="https://github.com/yourname, https://contently.com/..." />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>Comma-separated links to your writing samples</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={prevStep} style={{
                    flex: 1, padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', background: 'transparent',
                    color: 'var(--text-secondary)', border: '1px solid var(--border)',
                  }}>← Back</button>
                  <button type="button" onClick={nextStep} style={{
                    flex: 1, padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                    background: 'var(--primary)', color: '#fff',
                  }}>Continue →</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 36, marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Review & Submit</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, maxWidth: '45ch', margin: '0 auto 32px' }}>Here&apos;s what you get as a 026Newsblog author.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                  <div style={{ padding: 16, background: 'var(--bg-inset)', borderRadius: 11, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>💰</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>70% Revenue Share</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Earn from every article view</div>
                  </div>
                  <div style={{ padding: 16, background: 'var(--bg-inset)', borderRadius: 11, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📊</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Analytics Dashboard</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Track views, likes, engagement</div>
                  </div>
                  <div style={{ padding: 16, background: 'var(--bg-inset)', borderRadius: 11, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📱</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>M-Pesa Withdrawals</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Cash out at $50+ threshold</div>
                  </div>
                  <div style={{ padding: 16, background: 'var(--bg-inset)', borderRadius: 11, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✍️</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Rich Editor</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Media embeds, SEO tools</div>
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Why do you want to write for 026Newsblog?</label>
                  <textarea
                    value={form.motivation}
                    onChange={e => update('motivation', e.target.value)}
                    placeholder="What unique perspective or expertise will you bring to our readers?"
                    required
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.88rem',
                      fontFamily: 'inherit', outline: 'none', minHeight: 100, resize: 'vertical', lineHeight: 1.5,
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
                  <input type="checkbox" required style={{ marginTop: 3, accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    I agree to the <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Author Terms</a> and <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Content Guidelines</a>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={prevStep} style={{
                    flex: 1, padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', background: 'transparent',
                    color: 'var(--text-secondary)', border: '1px solid var(--border)',
                  }}>← Back</button>
                  <button type="submit" disabled={submitting} style={{
                    flex: 1, padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', border: 'none',
                    background: 'var(--primary)', color: '#fff', opacity: submitting ? 0.7 : 1,
                  }}>
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
