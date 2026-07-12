'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type Tab = 'privacy' | 'terms' | 'cookies';

export default function LegalPage() {
  return <Suspense fallback={<div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>}>
    <LegalContent />
  </Suspense>;
}

function LegalContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'privacy');

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && ['privacy', 'terms', 'cookies'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingTop: 24, marginBottom: 0 }}>
        {([['privacy', 'Privacy Policy'], ['terms', 'Terms of Service'], ['cookies', 'Cookie Policy']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', fontSize: '0.78rem', fontWeight: 600, color: activeTab === key ? 'var(--primary)' : 'var(--text-tertiary)', background: activeTab === key ? 'var(--bg-surface)' : 'transparent', border: `1px solid ${activeTab === key ? 'var(--border)' : 'var(--border-subtle)'}`, borderBottom: activeTab === key ? '1px solid var(--bg-surface)' : '1px solid var(--border-subtle)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{label}</button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '0 16px 16px 16px', padding: 48 }}>
        <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {activeTab === 'privacy' ? 'Privacy Policy' : activeTab === 'terms' ? 'Terms of Service' : 'Cookie Policy'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Last updated: July 10, 2026 · Effective: July 10, 2026</p>
        </div>

        <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {activeTab === 'privacy' && <PrivacyContent />}
          {activeTab === 'terms' && <TermsContent />}
          {activeTab === 'cookies' && <CookiesContent />}
        </div>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <>
      <p>026Newsblog (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the 026newsblog.com website and related services (the &quot;Platform&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.</p>
      <H2>1. Information We Collect</H2>
      <H3>Information You Provide</H3>
      <ul>
        <li><Strong>Account information:</Strong> Name, email address, username, password, profile photo, and bio when you register.</li>
        <li><Strong>Author information:</Strong> Professional title, writing samples, portfolio URLs, LinkedIn profile, and M-Pesa phone number for authors.</li>
        <li><Strong>Content:</Strong> Articles, comments, messages, and any other content you create on the Platform.</li>
        <li><Strong>Payment information:</Strong> M-Pesa phone numbers for withdrawal processing. We do not store M-Pesa PINs or full transaction credentials.</li>
        <li><Strong>Communications:</Strong> Messages you send through in-app chat, and emails you send to us.</li>
      </ul>
      <H3>Information Collected Automatically</H3>
      <ul>
        <li><Strong>Usage data:</Strong> Pages visited, articles read, reading duration, scroll depth, search queries, clicks, and interactions.</li>
        <li><Strong>Device information:</Strong> Browser type, operating system, device type, screen resolution, and language preferences.</li>
        <li><Strong>Log data:</Strong> IP address, access times, referring URLs, and error logs.</li>
      </ul>
      <H3>Information from Third Parties</H3>
      <ul>
        <li><Strong>OAuth providers:</Strong> If you sign in with Google or GitHub, we receive your name, email, and profile picture from those services.</li>
        <li><Strong>RSS feeds:</Strong> We aggregate publicly available news content from external sources for display on the Platform.</li>
      </ul>
      <H2>2. How We Use Your Information</H2>
      <p>We use collected information to:</p>
      <ul>
        <li>Provide, maintain, and improve the Platform</li>
        <li>Personalize your content feed based on your interests and reading history</li>
        <li>Process author earnings and M-Pesa withdrawals</li>
        <li>Send notifications about activity on your content (likes, comments, follows)</li>
        <li>Moderate content and detect spam, abuse, or policy violations</li>
        <li>Generate AI-narrated audio versions of published articles</li>
        <li>Ensure platform security and detect fraudulent activity</li>
      </ul>
      <H2>3. Information Sharing</H2>
      <p>We do not sell your personal information. We may share information with:</p>
      <ul>
        <li><Strong>Other users:</Strong> Your public profile, published articles, and comments are visible to all users. Your reading activity and saved articles are private.</li>
        <li><Strong>Payment processors:</Strong> We share M-Pesa phone numbers with Safaricom for processing author withdrawals via the Daraja API.</li>
        <li><Strong>Service providers:</Strong> Cloud hosting, email delivery, file storage, and AI services that help operate the Platform.</li>
        <li><Strong>Legal requirements:</Strong> When required by law, court order, or to protect rights and safety.</li>
      </ul>
      <H2>4. Data Retention</H2>
      <p>We retain your account data for as long as your account is active. If you delete your account, personal information is deleted within 30 days. Published articles remain attributed to &quot;Deleted Author&quot; unless you request full removal. Payment records are retained for 7 years for tax and legal compliance.</p>
      <H2>5. Your Rights</H2>
      <p>Under the Kenya Data Protection Act 2019, you have the right to access, correct, delete your personal data, object to processing, request data portability, and withdraw consent for optional communications. To exercise these rights, email us at <A href="mailto:privacy@026newsblog.com">privacy@026newsblog.com</A>.</p>
      <H2>6. Security</H2>
      <p>We implement industry-standard security measures including encryption in transit (TLS 1.3) and at rest, bcrypt password hashing, JWT-based session management, role-based access control, rate limiting, and regular security audits.</p>
      <H2>7. Children&apos;s Privacy</H2>
      <p>The Platform is not intended for users under 16 years of age. We do not knowingly collect personal information from children.</p>
      <H2>8. Contact Us</H2>
      <p><Strong>026Newsblog</Strong><br />Email: <A href="mailto:privacy@026newsblog.com">privacy@026newsblog.com</A><br />Address: Nairobi, Kenya</p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p>Welcome to 026Newsblog. By accessing or using our Platform, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Platform.</p>
      <H2>1. Eligibility</H2>
      <p>You must be at least 16 years old to use the Platform. By creating an account, you represent that you meet this requirement and that the information you provide is accurate.</p>
      <H2>2. Account Responsibilities</H2>
      <ul>
        <li>You are responsible for maintaining the security of your account credentials</li>
        <li>You must not share your account or allow unauthorized access</li>
        <li>You must notify us immediately of any security breach</li>
        <li>One person, one account. Multiple accounts may be terminated</li>
      </ul>
      <H2>3. User Content</H2>
      <H3>Readers</H3>
      <p>You retain ownership of your comments and messages. By posting, you grant 026Newsblog a non-exclusive, worldwide license to display and distribute your comments on the Platform.</p>
      <H3>Authors</H3>
      <p>You retain full ownership of your articles. By publishing on 026Newsblog, you grant us a non-exclusive, worldwide license to display and distribute your articles, generate AI-narrated audio versions, include excerpts in newsletters and promotional materials, and syndicate via RSS and API.</p>
      <H2>4. Prohibited Content</H2>
      <p>You must not post content that is defamatory, harassing, threatening, promotes violence, infringes intellectual property rights, contains hate speech, is sexually explicit, is spam or phishing, violates any applicable law, or impersonates another person or entity.</p>
      <H2>5. Author Monetization</H2>
      <ul>
        <li>Revenue split: Authors receive 70% of revenue; 026Newsblog retains 30%</li>
        <li>Minimum withdrawal threshold: $50 USD equivalent</li>
        <li>Withdrawals are processed via M-Pesa within 24 hours</li>
        <li>Authors are responsible for reporting income and paying applicable taxes</li>
      </ul>
      <H2>6. Intellectual Property</H2>
      <p>The 026Newsblog name, logo, design, and Platform technology are owned by us. You may not copy, modify, or create derivative works of our Platform without written permission.</p>
      <H2>7. Termination</H2>
      <p>We may suspend or terminate your account if you violate these Terms. You may delete your account at any time through Settings. Outstanding earnings above the withdrawal threshold will be paid within 30 days.</p>
      <H2>8. Governing Law</H2>
      <p>These Terms are governed by the laws of the Republic of Kenya. Disputes shall be resolved through arbitration in Nairobi under the Nairobi Centre for International Arbitration rules.</p>
      <H2>9. Contact</H2>
      <p><Strong>026Newsblog</Strong><br />Email: <A href="mailto:legal@026newsblog.com">legal@026newsblog.com</A><br />Address: Nairobi, Kenya</p>
    </>
  );
}

function CookiesContent() {
  return (
    <>
      <p>This Cookie Policy explains how 026Newsblog uses cookies and similar technologies when you visit our Platform.</p>
      <H2>What Are Cookies?</H2>
      <p>Cookies are small text files stored on your device by your browser. They help websites remember your preferences and understand how you use the site.</p>
      <H2>Cookies We Use</H2>
      <H3>Essential Cookies (Required)</H3>
      <p>These cookies are necessary for the Platform to function. They cannot be disabled.</p>
      <ul>
        <li><Strong>026nb_session:</Strong> Authentication token. Expires after 15 minutes (auto-refreshed).</li>
        <li><Strong>026nb_refresh:</Strong> Refresh token for maintaining your session. Expires after 7 days.</li>
        <li><Strong>026-theme:</Strong> Your dark/light mode preference. Persistent.</li>
      </ul>
      <H3>Analytics Cookies (Optional)</H3>
      <p>These help us understand how readers use the Platform to improve the experience.</p>
      <ul>
        <li><Strong>Reading session tracking:</Strong> Time spent on articles, scroll depth, reading completion.</li>
        <li><Strong>Navigation patterns:</Strong> Which categories and features are most used.</li>
      </ul>
      <H3>Preference Cookies (Optional)</H3>
      <ul>
        <li><Strong>Feed preferences:</Strong> Your selected tab (For You / Recent / Popular).</li>
        <li><Strong>Audio playback position:</Strong> Resume where you left off.</li>
      </ul>
      <H2>Third-Party Cookies</H2>
      <p>We minimize third-party cookies. Google OAuth and GitHub OAuth are used during sign-in flow only. We do not use advertising cookies or tracking pixels from ad networks.</p>
      <H2>Managing Cookies</H2>
      <p>You can control cookies through your browser settings. Note that disabling essential cookies will prevent you from logging in.</p>
      <H2>Contact</H2>
      <p>Questions about our use of cookies? Email <A href="mailto:privacy@026newsblog.com">privacy@026newsblog.com</A>.</p>
    </>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 16, letterSpacing: '-0.01em' }}>{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 28, marginBottom: 12 }}>{children}</h3>;
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>;
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>{children}</a>;
}
