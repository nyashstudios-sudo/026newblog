export default function Loading() {
  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo"><span>026</span>Newsblog</div>
        <div className="dash-sidebar-role">Admin Panel</div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="dash-sidebar-section">
            <div style={{ height: 12, width: 60, background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 8 }} />
            {[1, 2].map((i) => (
              <div key={i} style={{ height: 32, background: 'var(--border-subtle)', borderRadius: 8, marginBottom: 4 }} />
            ))}
          </div>
        ))}
      </aside>
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <div style={{ height: 24, width: 200, background: 'var(--border-subtle)', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 14, width: 320, background: 'var(--border-subtle)', borderRadius: 4 }} />
          </div>
        </div>
        <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="dash-stat-card">
              <div style={{ height: 12, width: 80, background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 28, width: 60, background: 'var(--border-subtle)', borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
