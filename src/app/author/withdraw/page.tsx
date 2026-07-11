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

  useEffect(() => {
    if (step === 3) {
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
    }
  }, [step]);

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

  const stepDotClass = (s: number) => {
    if (s < step) return 'step-dot done';
    if (s === step) return 'step-dot active';
    return 'step-dot';
  };

  const stepLineClass = (s: number) => {
    return s < step ? 'step-line done' : 'step-line';
  };

  const stepDotContent = (s: number) => {
    if (s < step) return '✓';
    if (s === 4) return '✓';
    return String(s);
  };

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

        <div className="withdraw-layout">
          <div className="withdraw-panel">
            {/* Steps Indicator */}
            <div className="steps-indicator">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div className={stepDotClass(s)}>{stepDotContent(s)}</div>
                  {s < 4 && <div className={stepLineClass(s)} />}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Amount */}
            {step === 1 && (
              <div>
                <div className="balance-display">
                  <div className="balance-label">Available Balance</div>
                  <div className="balance-amount">${balance.toFixed(2)}</div>
                  <div className="balance-kes">≈ KES {(balance * 129.3).toLocaleString()}</div>
                </div>

                <div className="amount-section">
                  <label className="field-label">Withdrawal Amount (USD)</label>
                  <div className="amount-input-wrap">
                    <span className="amount-prefix">$</span>
                    <input
                      type="text"
                      className="amount-input"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="amount-presets">
                    {amountPresets.map((preset) => (
                      <button
                        key={preset}
                        className={`amount-preset${amount === String(preset) ? ' active' : ''}`}
                        onClick={() => setAmount(String(preset))}
                      >
                        {preset === balance ? 'Max' : `$${preset}`}
                      </button>
                    ))}
                  </div>
                  <p className="field-helper">
                    Minimum withdrawal: ${threshold} · You&apos;ll receive approximately KES {kesAmount.toLocaleString()}
                  </p>
                </div>

                <div className="amount-section">
                  <label className="field-label">M-Pesa Phone Number</label>
                  <div className="phone-input-wrap">
                    <select className="phone-prefix-select">
                      <option>+254</option>
                      <option>+255</option>
                      <option>+256</option>
                    </select>
                    <input
                      type="tel"
                      className="phone-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="7XX XXX XXX"
                    />
                  </div>
                  <p className="field-helper">Registered M-Pesa number linked to your account</p>
                </div>

                <button className="btn btn-mpesa" onClick={() => setStep(2)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                <div className="confirm-details">
                  <div className="confirm-row">
                    <span className="confirm-label">Withdrawal Amount</span>
                    <span className="confirm-value">${parseFloat(amount || '0').toFixed(2)}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Exchange Rate</span>
                    <span className="confirm-value">1 USD = 129.30 KES</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Transaction Fee</span>
                    <span className="confirm-value">$0.00 (waived)</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">M-Pesa Number</span>
                    <span className="confirm-value">+254 {phone}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Estimated Arrival</span>
                    <span className="confirm-value">Within 24 hours</span>
                  </div>
                  <div className="confirm-total">
                    <span style={{ fontWeight: 600 }}>You&apos;ll Receive</span>
                    <span className="confirm-total-value">KES {kesAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button className="btn btn-mpesa" onClick={() => setStep(3)}>Confirm & Enter PIN</button>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back to Edit</button>
              </div>
            )}

            {/* Step 3: PIN */}
            {step === 3 && (
              <div>
                <div className="pin-section">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Enter Your PIN</h3>
                  <p className="pin-label">Enter your 4-digit security PIN to authorize this withdrawal</p>
                  <div className="pin-inputs">
                    {pin.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { pinRefs.current[i] = el; }}
                        type="password"
                        className="pin-digit"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(i, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                        inputMode="numeric"
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 12 }}>
                    Forgot PIN? <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Reset here</a>
                  </p>
                </div>

                <button
                  className="btn btn-mpesa"
                  onClick={withdraw}
                  disabled={withdrawing || pin.some(d => !d)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {withdrawing ? 'Processing...' : 'Authorize Withdrawal'}
                </button>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="success-state">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="success-title">Withdrawal Successful!</h3>
                <p className="success-desc">
                  KES {kesAmount.toLocaleString()} is being sent to +254 {phone}
                </p>

                <div className="success-receipt">
                  <div className="receipt-row">
                    <span className="receipt-label">Transaction ID</span>
                    <span className="receipt-value">TXN-2026071089432</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Amount Sent</span>
                    <span className="receipt-value">KES {kesAmount.toLocaleString()}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">M-Pesa Number</span>
                    <span className="receipt-value">+254 {phone.slice(0, 3)}***{phone.slice(-3)}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Date</span>
                    <span className="receipt-value">Jul 10, 2026 9:30 PM</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Status</span>
                    <span className="receipt-value" style={{ color: 'var(--mpesa-green)' }}>Processing</span>
                  </div>
                </div>

                <button
                  className="btn btn-mpesa"
                  onClick={() => { setStep(1); setSuccess(false); setAmount('200'); }}
                >
                  Done
                </button>
                <button className="btn btn-ghost">Download Receipt</button>
              </div>
            )}

            {message && <p className="message-text">{message}</p>}
          </div>

          {/* History Sidebar */}
          <div className="history-panel">
            <h2 className="history-title">Payout History</h2>
            <div className="history-list">
              {historyItems.map((item, i) => (
                <div key={i} className="history-item">
                  <div className="history-icon completed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="history-info">
                    <div className="history-amount">{item.amount}</div>
                    <div className="history-detail">{item.date} · {item.phone}</div>
                  </div>
                  <span className="history-status completed">{item.status}</span>
                </div>
              ))}
            </div>

            <div className="history-summary">
              <div className="summary-row">
                <span className="summary-label">Total Withdrawn</span>
                <span className="summary-value">KES 54,630</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">This Month</span>
                <span className="summary-value">KES 12,740</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Withdrawals Count</span>
                <span className="summary-value">5</span>
              </div>
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
