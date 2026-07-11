export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8" style={{ display: 'flex', gap: 16, height: 'calc(100vh - 120px)' }}>
      <div style={{ flex: '0 0 300px', borderRadius: 12, background: 'var(--border-subtle)' }} />
      <div style={{ flex: 1, borderRadius: 12, background: 'var(--border-subtle)' }} />
    </div>
  );
}
