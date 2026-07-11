'use client';

import dynamic from 'next/dynamic';

const AdminDashboardContent = dynamic(() => import('./dashboard-content'), {
  loading: () => (
    <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="dash-stat-card">
          <div style={{ height: 12, width: 80, background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 28, width: 60, background: 'var(--border-subtle)', borderRadius: 6 }} />
        </div>
      ))}
    </div>
  ),
  ssr: false,
});

export default function AdminDashboardPage() {
  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Platform Overview</h1>
          <p className="dash-subtitle">Real-time monitoring and management for 026Newsblog</p>
        </div>
      </div>
      <AdminDashboardContent />
    </>
  );
}
