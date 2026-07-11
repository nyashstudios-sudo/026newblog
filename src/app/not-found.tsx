import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{
          fontSize: 'clamp(6rem, 15vw, 10rem)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 16,
          animation: 'float 3s ease-in-out infinite',
        }}>
          404
        </div>
        <h1 style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: '1.6rem',
          fontWeight: 700,
          marginBottom: 12,
        }}>
          This story doesn&apos;t exist (yet)
        </h1>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          The page you&apos;re looking for may have been moved, deleted, or perhaps it was never written in the first place. Let&apos;s get you back to the good stuff.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: 'none',
              textDecoration: 'none',
              background: 'var(--primary)',
              color: 'oklch(98% 0.005 175)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/explore"
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--border)',
              textDecoration: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Explore
          </Link>
        </div>

        <div style={{
          marginTop: 32,
          display: 'flex',
          gap: 8,
          maxWidth: 360,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <input
            type="text"
            placeholder="Search for articles..."
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: 9,
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button style={{
            padding: '11px 16px',
            borderRadius: 9,
            background: 'var(--primary)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'oklch(98% 0.005 175)' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
          }}>
            Popular right now
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {['AI Journalism', 'Fintech Kenya', 'Startup Funding', 'Marathon Training', 'Afrofuturism'].map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${tag.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  padding: '6px 14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 24,
        fontSize: '0.9rem',
        fontWeight: 700,
        color: 'var(--text-tertiary)',
      }}>
        <span style={{ color: 'var(--primary)' }}>026</span>Newsblog
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
