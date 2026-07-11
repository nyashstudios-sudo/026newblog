export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div style={{ height: 28, width: 140, background: 'var(--border-subtle)', borderRadius: 6, marginBottom: 32 }} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ marginBottom: 24, padding: 20, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <div style={{ height: 16, width: 120, background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 16 }} />
          <div style={{ height: 40, background: 'var(--border-subtle)', borderRadius: 8 }} />
        </div>
      ))}
    </div>
  );
}
