'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export default function AuthorWithdrawPage() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [threshold, setThreshold] = useState(50);
  const [amount, setAmount] = useState('200');
  const [phone, setPhone] = useState('712 345 678');
  const [pin, setPin] = useState(['', '', '', '']);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [message, setMessage] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!user || !['author', 'admin'].includes(user.role)) return;
    fetch('/api/earnings')
      .then((r) => r.json())
      .then((d) => {
        setBalance(d.balance || 0);
        setThreshold(d.threshold || 50);
      })
      .catch(() => {});
  }, [user]);

  const setSecurityPin = async () => {
    const res = await fetch('/api/auth/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: newPin }),
    });
    if (res.ok) {
      setShowPinModal(false);
      setMessage('PIN set successfully');
    }
  };

  const withdraw = async () => {
    const numAmount = parseFloat(amount);
    if (numAmount < threshold) {
      setMessage(`Minimum withdrawal is $${threshold}`);
      return;
    }
    if (numAmount > balance) {
      setMessage('Insufficient balance');
      return;
    }

    setWithdrawing(true);
    setMessage('');

    const res = await fetch('/api/earnings/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: numAmount, pin: pin.join(''), phone }),
    });

    setWithdrawing(false);
    const data = await res.json();

    if (res.ok) {
      setMessage(`Withdrawal initiated! Transaction: ${data.payout.transactionId}`);
      setBalance((b) => b - numAmount);
      setAmount('');
      setPin(['', '', '', '']);
      setStep(4);
      setSuccess(true);
    } else {
      setMessage(data.error || 'Withdrawal failed');
      if (data.code === 'PIN_NOT_SET') setShowPinModal(true);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const amountPresets = [50, 100, 200, balance];

  if (loading) return null;

  if (!user || !['author', 'admin'].includes(user.role)) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Withdrawals</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{user ? 'Author access required.' : 'Sign in to access withdrawals.'}</p>
        <Link href="/author/apply"><Button>Apply as author</Button></Link>
      </div>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const navItems = [
    { href: '/author/dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { href: '/author/editor', label: 'Editor', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
    { href: '/author/analytics', label: 'Analytics', icon: 'M18 20V10 M12 20V4 M6 20v-6' },
    { href: '/author/withdraw', label: 'Withdrawals', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  ];

  const kesAmount = parseFloat(amount || '0') * 129.3;
  const historyItems = [
    { amount: 'KES 12,740', date: 'Jul 3', phone: '+254 712 ***678', status: 'Completed' as const },
    { amount: 'KES 8,450', date: 'Jun 21', phone: '+254 712 ***678', status: 'Completed' as const },
    { amount: 'KES 15,200', date: 'Jun 8', phone: '+254 712 ***678', status: 'Completed' as const },
    { amount: 'KES 6,890', date: 'May 28', phone: '+254 712 ***678', status: 'Completed' as const },
    { amount: 'KES 11,350', date: 'May 15', phone: '+254 712 ***678', status: 'Completed' as const },
  ];

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
            <Link href="/settings" className="dash-sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              Settings
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
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Withdraw to M-Pesa</h1>
            <p className="dash-subtitle">Send your earnings directly to your M-Pesa account</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, maxWidth: 900 }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: 32,
          }}>
            {/* Steps Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700,
                    background: s < step ? 'var(--mpesa-green)' : s === step ? 'var(--primary)' : 'var(--bg-inset)',
                    color: s <= step ? 'oklch(98% 0.005 175)' : 'var(--text-tertiary)',
                    border: `2px solid ${s < step ? 'var(--mpesa-green)' : s === step ? 'var(--primary)' : 'var(--border)'}`,
                    transition: 'all 0.3s var(--ease-out-expo)',
                  }}>
                    {s < step ? '✓' : s === 4 ? '✓' : s}
                  </div>
                  {s < 4 && (
                    <div style={{
                      flex: 1, height: 2,
                      background: s < step ? 'var(--mpesa-green)' : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Amount */}
            {step === 1 && (
              <div>
                <div style={{
                  textAlign: 'center', padding: 28,
                  background: 'var(--mpesa-light)', borderRadius: 14, marginBottom: 24,
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                    Available Balance
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--mpesa-green)', fontFeatureSettings: '"tnum"', letterSpacing: '-0.02em' }}>
                    ${balance.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    ≈ KES {(balance * 129.3).toLocaleString()}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                    Withdrawal Amount (USD)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                      fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-tertiary)',
                    }}>$</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{
                        width: '100%', padding: '14px 16px 14px 36px', borderRadius: 10,
                        border: '2px solid var(--border)', background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 700,
                        fontFamily: 'inherit', fontFeatureSettings: '"tnum"', outline: 'none',
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {amountPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(String(preset))}
                        style={{
                          flex: 1, padding: 8, borderRadius: 8,
                          border: `1px solid ${amount === String(preset) ? 'var(--mpesa-green)' : 'var(--border)'}`,
                          background: amount === String(preset) ? 'var(--mpesa-light)' : 'transparent',
                          fontSize: '0.78rem', fontWeight: 600,
                          color: amount === String(preset) ? 'var(--mpesa-green)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {preset === balance ? 'Max' : `$${preset}`}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                    Minimum withdrawal: ${threshold} · You&apos;ll receive approximately KES {kesAmount.toLocaleString()}
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                    M-Pesa Phone Number
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select style={{
                      padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                      fontSize: '0.88rem', fontFamily: 'inherit', fontWeight: 600, width: 90,
                    }}>
                      <option>+254</option>
                      <option>+255</option>
                      <option>+256</option>
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="7XX XXX XXX"
                      style={{
                        flex: 1, padding: '12px 16px', borderRadius: 10,
                        border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)', fontSize: '0.95rem',
                        fontFamily: 'inherit', fontFeatureSettings: '"tnum"', outline: 'none',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                    Registered M-Pesa number linked to your account
                  </p>
                </div>

                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none', width: '100%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'var(--mpesa-green)', color: 'oklch(98% 0.005 145)',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  Continue to Review
                </button>
              </div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Confirm Withdrawal</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Please review the details below before confirming.
                </p>

                <div style={{ background: 'var(--bg-inset)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  {[
                    { label: 'Withdrawal Amount', value: `$${parseFloat(amount || '0').toFixed(2)}` },
                    { label: 'Exchange Rate', value: '1 USD = 129.30 KES' },
                    { label: 'Transaction Fee', value: '$0.00 (waived)' },
                    { label: 'M-Pesa Number', value: `+254 ${phone}` },
                    { label: 'Estimated Arrival', value: 'Within 24 hours' },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '0.85rem',
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontWeight: 600, fontFeatureSettings: '"tnum"' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '14px 0 0', marginTop: 8,
                    borderTop: '2px solid var(--border)', fontSize: '1rem',
                  }}>
                    <span style={{ fontWeight: 600 }}>You&apos;ll Receive</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--mpesa-green)' }}>
                      KES {kesAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(3)}
                  style={{
                    padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none', width: '100%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'var(--mpesa-green)', color: 'oklch(98% 0.005 145)',
                  }}
                >
                  Confirm & Enter PIN
                </button>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: '1px solid var(--border)',
                    width: '100%', marginTop: 10,
                    background: 'transparent', color: 'var(--text-secondary)',
                  }}
                >
                  ← Back to Edit
                </button>
              </div>
            )}

            {/* Step 3: PIN */}
            {step === 3 && (
              <div>
                <div style={{ textAlign: 'center', margin: '24px 0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Enter Your PIN</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                    Enter your 4-digit security PIN to authorize this withdrawal
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    {pin.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { pinRefs.current[i] = el; }}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(i, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                        inputMode="numeric"
                        style={{
                          width: 48, height: 56, borderRadius: 10,
                          border: `2px solid ${digit ? 'var(--mpesa-green)' : 'var(--border)'}`,
                          background: 'var(--bg-elevated)', textAlign: 'center',
                          fontSize: '1.5rem', fontWeight: 700, fontFamily: 'inherit',
                          color: 'var(--text-primary)', outline: 'none',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 12 }}>
                    Forgot PIN? <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Reset here</a>
                  </p>
                </div>

                <button
                  onClick={withdraw}
                  disabled={withdrawing || pin.some(d => !d)}
                  style={{
                    padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none', width: '100%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'var(--mpesa-green)', color: 'oklch(98% 0.005 145)',
                    opacity: withdrawing || pin.some(d => !d) ? 0.6 : 1,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {withdrawing ? 'Processing...' : 'Authorize Withdrawal'}
                </button>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: '1px solid var(--border)',
                    width: '100%', marginTop: 10,
                    background: 'transparent', color: 'var(--text-secondary)',
                  }}
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: 'var(--mpesa-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36, color: 'var(--mpesa-green)' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>Withdrawal Successful!</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  KES {kesAmount.toLocaleString()} is being sent to +254 {phone}
                </p>

                <div style={{ background: 'var(--bg-inset)', borderRadius: 12, padding: 20, textAlign: 'left', marginBottom: 20 }}>
                  {[
                    { label: 'Transaction ID', value: 'TXN-2026071089432' },
                    { label: 'Amount Sent', value: `KES ${kesAmount.toLocaleString()}` },
                    { label: 'M-Pesa Number', value: `+254 ${phone.slice(0, 3)}***${phone.slice(-3)}` },
                    { label: 'Date', value: 'Jul 10, 2026 9:30 PM' },
                    { label: 'Status', value: 'Processing', color: 'var(--mpesa-green)' },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '8px 0', fontSize: '0.82rem',
                    }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>{row.label}</span>
                      <span style={{ fontWeight: 600, fontFeatureSettings: '"tnum"', color: row.color }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setStep(1); setSuccess(false); setAmount('200'); }}
                  style={{
                    padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none', width: '100%',
                    background: 'var(--mpesa-green)', color: 'oklch(98% 0.005 145)',
                  }}
                >
                  Done
                </button>
                <button style={{
                  padding: '13px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', border: '1px solid var(--border)',
                  width: '100%', marginTop: 10,
                  background: 'transparent', color: 'var(--text-secondary)',
                }}>
                  Download Receipt
                </button>
              </div>
            )}

            {message && (
              <p style={{ fontSize: '0.82rem', color: 'var(--primary)', marginTop: 16, textAlign: 'center' }}>
                {message}
              </p>
            )}
          </div>

          {/* History Sidebar */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 16, padding: 24, height: 'fit-content',
          }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20 }}>Payout History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {historyItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 12, background: 'var(--bg-inset)', borderRadius: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: 'var(--success-light)',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--success)' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFeatureSettings: '"tnum"' }}>{item.amount}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{item.date} · {item.phone}</div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 600, padding: '3px 8px', borderRadius: 10,
                    background: 'var(--success-light)', color: 'var(--success)',
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-inset)', borderRadius: 10 }}>
              {[
                { label: 'Total Withdrawn', value: 'KES 54,630' },
                { label: 'This Month', value: 'KES 12,740' },
                { label: 'Withdrawals Count', value: '5' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0', fontSize: '0.78rem',
                }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, fontFeatureSettings: '"tnum"' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Modal open={showPinModal} onClose={() => setShowPinModal(false)} title="Set security PIN">
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Your PIN is required for withdrawals. Use 4-6 digits.
          </p>
          <Input
            type="password"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Enter PIN"
            style={{ marginBottom: 16 }}
          />
          <Button onClick={setSecurityPin} className="w-full">Save PIN</Button>
        </Modal>
      </main>
    </div>
  );
}
