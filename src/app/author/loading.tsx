export default function Loading() {
  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo"><span>026</span>Newsblog</div>
        <div className="dash-sidebar-role">Author Dashboard</div>
        {[1, 2].map((s) => (
          <div key={s} className="dash-sidebar-section">
            <div style={{ height: 12, width: 60, background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 8 }} />
            {[1, 2].map((i) => (
              <div key={i} style={{ height: 32, background: 'var(--border-subtle)', borderRadius: 8, marginBottom: 4 }} />
            ))}
          </div>
        ))}
      </aside>
      <main className="dash-main">
        <div style={{ height: 24, width: 180, background: 'var(--border-subtle)', borderRadius: 6, marginBottom: 24 }} />
        <div style={{ height: 400, background: 'var(--border-subtle)', borderRadius: 12 }} />
      </main>
    </div>
  );
}
