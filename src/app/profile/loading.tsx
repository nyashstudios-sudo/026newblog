export default function Loading() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--border-subtle)', margin: '0 auto 24px' }} />
      <div style={{ height: 24, width: 180, background: 'var(--border-subtle)', borderRadius: 6, margin: '0 auto 12px' }} />
      <div style={{ height: 14, width: 260, background: 'var(--border-subtle)', borderRadius: 4, margin: '0 auto' }} />
    </div>
  );
}
