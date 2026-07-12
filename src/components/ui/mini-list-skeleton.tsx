export function MiniListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="trending-list" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="trending-item" style={{ pointerEvents: 'none' }}>
          <div className="skeleton" style={{ width: 28, height: 24, borderRadius: 6, flexShrink: 0 }} />
          <div className="trending-content">
            <div className="skeleton" style={{ width: '95%', height: 13, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '55%', height: 11 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
