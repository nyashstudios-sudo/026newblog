export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div style={{ height: 28, width: 180, background: 'var(--border-subtle)', borderRadius: 6, marginBottom: 24 }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--border-subtle)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: '60%', background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 12, width: '40%', background: 'var(--border-subtle)', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
