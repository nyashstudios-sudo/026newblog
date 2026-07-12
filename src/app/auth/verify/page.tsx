'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CONFETTI_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#f97316'];

function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; left: string; color: string; delay: string; duration: string; size: string; borderRadius: string }[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: `${Math.random() * 0.5}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 6}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.borderRadius,
            animation: `confetti-fall ${p.duration} ease-out ${p.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
    <VerifyEmailContent />
  </Suspense>;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const verified = searchParams.get('verified') === 'true';
  const [showSuccess, setShowSuccess] = useState(verified);
  const [cooldown, setCooldown] = useState(0);
  const [resendText, setResendText] = useState('Resend verification email');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (verified) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        const meta = data.user?.user_metadata;
        setUserName(meta?.firstName || meta?.username || '');
      });
    }
  }, [verified]);

  const resendEmail = useCallback(async () => {
    if (cooldown > 0 || !email) return;
    setResendText('Email sent!');
    setCooldown(60);
    try {
      const supabase = createClient();
      await supabase.auth.resend({ email, type: 'signup' });
    } catch {}
  }, [cooldown, email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          setResendText('Resend verification email');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <style jsx global>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes flap-open { 0%, 100% { transform: translateX(-50%) rotateX(0deg); opacity: 1; } 50% { transform: translateX(-50%) rotateX(20deg); opacity: 0.8; } }
        @keyframes letter-peek { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
        @keyframes pop-in { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes confetti-fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      `}</style>

      {showSuccess && <Confetti />}

      <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 48 }}>
        <span style={{ color: 'var(--primary)' }}>026</span>Newsblog
      </div>

      {!showSuccess ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, margin: '0 auto 24px', position: 'relative' }}>
            <div style={{ width: 72, height: 52, background: 'var(--primary)', borderRadius: 6, position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)' }} />
            <div style={{ width: 0, height: 0, borderLeft: '36px solid transparent', borderRight: '36px solid transparent', borderTop: '28px solid var(--primary-hover)', position: 'absolute', bottom: 38, left: '50%', transform: 'translateX(-50%)', animation: 'flap-open 2s cubic-bezier(0.16, 1, 0.3, 1) infinite', transformOrigin: 'top center' }} />
            <div style={{ width: 56, height: 40, background: 'var(--bg-elevated)', borderRadius: 4, position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', animation: 'letter-peek 2s cubic-bezier(0.16, 1, 0.3, 1) infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 3, background: 'var(--border)', borderRadius: 2 }} />
            </div>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Check your email</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8 }}>We&apos;ve sent a verification link to</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 32 }}>{email || 'your email address'}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', marginBottom: 32, padding: 20, background: 'var(--bg-inset)', borderRadius: 12 }}>
            {['Open your email inbox (check spam/promotions too)', 'Find the email from 026Newsblog', 'Click the "Verify Email" button in the message'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', width: '100%' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            Open Gmail
          </a>

          <button onClick={() => setShowSuccess(true)} style={{ display: 'block', width: '100%', padding: '13px 28px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', marginTop: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
            I&apos;ll check later
          </button>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 8 }}>Didn&apos;t receive the email?</p>
            <button onClick={resendEmail} disabled={cooldown > 0} style={{ fontSize: '0.82rem', color: cooldown > 0 ? 'var(--text-tertiary)' : 'var(--primary)', fontWeight: 600, cursor: cooldown > 0 ? 'not-allowed' : 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>
              {resendText}
            </button>
            {cooldown > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, fontFeatureSettings: "'tnum'" }}>Resend available in {cooldown}s</p>}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 20 }}>
            Wrong email? <Link href="/auth/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Go back</Link> and use a different one.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--success-light, oklch(92% 0.04 145))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--success, oklch(50% 0.14 145))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40 }}><polyline points="20 6 9 17 4 12" /></svg>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, color: 'var(--success, oklch(50% 0.14 145))' }}>Email Verified!</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
            Your account is confirmed and ready to go. Welcome to the 026Newsblog community{userName ? `, ${userName}` : ''}.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 32 }}>
            {[
              ['Personalized feed', 'based on your interests'],
              ['Save & like', 'articles to build your library'],
              ['Join conversations', 'with authors and readers'],
              ['Listen to articles', 'narrated by AI while commuting'],
            ].map(([strong, rest], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-inset)', borderRadius: 10, fontSize: '0.85rem' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--success-light, oklch(92% 0.04 145))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--success, oklch(50% 0.14 145))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>{strong}</strong> {rest}</span>
              </div>
            ))}
          </div>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', width: '100%' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            Start Exploring
          </Link>

          <Link href="/settings" style={{ display: 'block', width: '100%', padding: '13px 28px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', marginTop: 10, textDecoration: 'none', textAlign: 'center' }}>
            Set up your profile first
          </Link>
        </div>
      )}
    </div>
  );
}
