'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';

export default function AuthorApplyPage() {
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

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  if (loading) return null;

  if (!user) {
    return (
      <div className="apply-container">
        <div className="apply-logo"><span>026</span>Newsblog</div>
        <div className="apply-card" style={{ textAlign: 'center', padding: '60px 36px' }}>
          <h1 className="apply-card-title">Become an Author</h1>
          <p className="apply-card-desc">Sign in to apply as a content creator</p>
          <Link href="/auth/login"><Button>Sign in</Button></Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="apply-container">
        <div className="apply-logo"><span>026</span>Newsblog</div>
        <div className="apply-card">
          <div className="apply-success">
            <div className="apply-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="apply-success-title">Application Submitted!</h2>
            <p className="apply-success-desc">Our editorial team will review your portfolio within 48 hours. You&apos;ll receive an email with the decision.</p>
            <Link href="/"><Button>← Back to Homepage</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const stepCircle = (n: number, isCheck = false) => {
    const isActive = step === n;
    const isDone = n < step;
    let cls = 'apply-step';
    if (isDone || isCheck) cls += ' done';
    else if (isActive) cls += ' active';
    return (
      <div key={n} className={cls}>
        {isDone || isCheck ? '✓' : n}
      </div>
    );
  };

  const stepLine = (n: number) => (
    <div key={`l${n}`} className={`apply-line${n < step ? ' done' : ''}`} />
  );

  return (
    <div className="apply-container">
      <div className="apply-logo"><span>026</span>Newsblog</div>

      <div className="apply-progress">
        {stepCircle(1)}{stepLine(1)}{stepCircle(2)}{stepLine(2)}{stepCircle(3)}{stepLine(3)}{stepCircle(4, true)}
      </div>

      <form onSubmit={submit}>
        {error && <p style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: 16, textAlign: 'center' }}>{error}</p>}

        <div className={`apply-slide${step === 1 ? ' active' : ''}`}>
          <div className="apply-card">
            <h1 className="apply-card-title">About You</h1>
            <p className="apply-card-desc">Tell us who you are and what you write about.</p>
            <div className="apply-field-row">
              <div className="apply-field">
                <label className="apply-label">First Name</label>
                <input type="text" className="apply-input" value={form.firstName} onChange={e => update('firstName', e.target.value)} required />
              </div>
              <div className="apply-field">
                <label className="apply-label">Last Name</label>
                <input type="text" className="apply-input" value={form.lastName} onChange={e => update('lastName', e.target.value)} required />
              </div>
            </div>
            <div className="apply-field">
              <label className="apply-label">Professional Title</label>
              <input type="text" className="apply-input" value={form.professionalTitle} onChange={e => update('professionalTitle', e.target.value)} placeholder="e.g. Tech Journalist, Business Analyst, Researcher" required />
            </div>
            <div className="apply-field">
              <label className="apply-label">Writing Niche</label>
              <select className="apply-input" value={form.writingNiche} onChange={e => update('writingNiche', e.target.value)} required>
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
            <div className="apply-field">
              <label className="apply-label">Bio (public)</label>
              <textarea className="apply-input" value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell readers what you write about and why they should follow you..." />
              <span className="apply-hint">150-300 characters recommended</span>
            </div>
            <div className="apply-field">
              <label className="apply-label">Years of Writing Experience</label>
              <select className="apply-input" value={form.yearsExperience} onChange={e => update('yearsExperience', e.target.value)}>
                <option value="">Select experience</option>
                <option>Less than 1 year</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5-10 years</option>
                <option>10+ years</option>
              </select>
            </div>
            <div className="apply-btn-row">
              <button type="button" className="apply-btn apply-btn-primary" onClick={nextStep}>Continue →</button>
            </div>
          </div>
        </div>

        <div className={`apply-slide${step === 2 ? ' active' : ''}`}>
          <div className="apply-card">
            <h1 className="apply-card-title">Your Portfolio</h1>
            <p className="apply-card-desc">Share your best writing so our editors can review your work.</p>
            <div className="apply-field">
              <label className="apply-label">Portfolio URL (optional)</label>
              <input type="url" className="apply-input" value={form.portfolioUrl} onChange={e => update('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.com or Medium/Substack link" />
              <span className="apply-hint">Link to your blog, Medium, Substack, or professional portfolio</span>
            </div>
            <div className="apply-field">
              <label className="apply-label">LinkedIn Profile</label>
              <input type="url" className="apply-input" value={form.linkedinUrl} onChange={e => update('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div className="apply-field">
              <label className="apply-label">Upload Sample Articles (PDF or DOC)</label>
              <div className="apply-upload">
                <div className="apply-upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <div className="apply-upload-text"><strong>Click to upload</strong> or drag and drop</div>
                <div className="apply-upload-hint">PDF or DOC up to 10MB · Max 3 files</div>
              </div>
            </div>
            <div className="apply-btn-row">
              <button type="button" className="apply-btn apply-btn-ghost" onClick={prevStep}>← Back</button>
              <button type="button" className="apply-btn apply-btn-primary" onClick={nextStep}>Continue →</button>
            </div>
          </div>
        </div>

        <div className={`apply-slide${step === 3 ? ' active' : ''}`}>
          <div className="apply-card">
            <h1 className="apply-card-title">Review & Submit</h1>
            <p className="apply-card-desc">Here&apos;s what you get as a 026Newsblog author.</p>
            <div className="apply-perks">
              <div className="apply-perk">
                <div className="apply-perk-icon">💰</div>
                <div className="apply-perk-name">70% Revenue Share</div>
                <div className="apply-perk-desc">Earn from every article view</div>
              </div>
              <div className="apply-perk">
                <div className="apply-perk-icon">📊</div>
                <div className="apply-perk-name">Analytics Dashboard</div>
                <div className="apply-perk-desc">Track views, likes, engagement</div>
              </div>
              <div className="apply-perk">
                <div className="apply-perk-icon">📱</div>
                <div className="apply-perk-name">M-Pesa Withdrawals</div>
                <div className="apply-perk-desc">Cash out at $50+ threshold</div>
              </div>
              <div className="apply-perk">
                <div className="apply-perk-icon">✍️</div>
                <div className="apply-perk-name">Rich Editor</div>
                <div className="apply-perk-desc">Media embeds, SEO tools</div>
              </div>
            </div>
            <div className="apply-field">
              <label className="apply-label">Why do you want to write for 026Newsblog?</label>
              <textarea className="apply-input" value={form.motivation} onChange={e => update('motivation', e.target.value)} placeholder="What unique perspective or expertise will you bring to our readers?" required />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
              <input type="checkbox" required style={{ marginTop: 3, accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                I agree to the <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Author Terms</a> and <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Content Guidelines</a>
              </span>
            </div>
            <div className="apply-btn-row">
              <button type="button" className="apply-btn apply-btn-ghost" onClick={prevStep}>← Back</button>
              <button type="submit" className="apply-btn apply-btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
