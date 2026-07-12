'use client';

export default function OpinionContent() {
  return (
    <section style={{ 
      background: 'var(--bg-surface)', 
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 48,
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ 
          fontFamily: "'Newsreader', Georgia, serif", 
          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', 
          fontWeight: 700, 
          marginBottom: 24,
          color: 'var(--text-primary)',
        }}>
          Why Opinion Matters at 026Newsblog
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 24,
          marginTop: 48,
          textAlign: 'left',
        }}>
          {[
            {
              title: 'Diverse Perspectives',
              desc: 'We publish voices from across the political, cultural, and professional spectrum. No single worldview dominates our pages.',
              icon: '🌍',
            },
            {
              title: 'Evidence-Based Argument',
              desc: 'Every op-ed is grounded in facts, data, and lived experience. Rhetoric without substance doesn\'t make the cut.',
              icon: '📊',
            },
            {
              title: 'African Voices First',
              desc: 'Global issues are reframed through African lenses. We prioritize writers who live the realities they analyze.',
              icon: '🎤',
            },
            {
              title: 'Constructive Debate',
              desc: 'Comments are moderated for substance, not agreement. We believe the best ideas emerge from rigorous disagreement.',
              icon: '⚖️',
            },
          ].map((item) => (
            <div key={item.title} style={{ 
              background: 'var(--bg-elevated)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 16, 
              padding: 24,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.7 }}>
            026Newsblog\'s Opinion section exists to elevate the conversations that shape our continent. 
            From AI ethics in Nairobi\'s tech hubs to climate justice in Turkana, from the future of M-Pesa 
            to the politics of cultural restitution — we publish the arguments that move the needle.
          </p>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Interested in contributing? We welcome pitches from experts, activists, researchers, and 
            thought leaders across East Africa. <a href="/author/apply" style={{ color: 'var(--primary)', fontWeight: 500 }}>Apply to write for us →</a>
          </p>
        </div>
      </div>
    </section>
  );
}