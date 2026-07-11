'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

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
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) return null;

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { href: '/admin/authors', label: 'Authors', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
    { href: '/admin/moderation', label: 'Moderation', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { href: '/admin/rss', label: 'RSS Feeds', icon: 'M4 11a9 9 0 0 1 9 9 M4 4a16 16 0 0 1 16 16 M5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
    { href: '/admin/settings', label: 'Settings', icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
  ];

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'A';

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-logo"><span>026</span>Newsblog</Link>
        <div className="dash-sidebar-role">Admin Panel</div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Platform</div>
          <nav className="dash-sidebar-nav">
            {navItems.slice(0, 2).map(item => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={`dash-sidebar-link${active ? ' active' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Content</div>
          <nav className="dash-sidebar-nav">
            {navItems.slice(2, 4).map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`dash-sidebar-link${active ? ' active' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">System</div>
          <nav className="dash-sidebar-nav">
            {navItems.slice(4).map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`dash-sidebar-link${active ? ' active' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {user && <div className="dash-sidebar-footer">
          <div className="dash-sidebar-profile">
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className="dash-sidebar-profile-info">
              <div className="dash-sidebar-profile-name">{user.firstName} {user.lastName}</div>
              <div className="dash-sidebar-profile-role">{user.role}</div>
            </div>
          </div>
        </div>}
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Platform Overview</h1>
            <p className="dash-subtitle">Real-time monitoring and management for 026Newsblog</p>
          </div>
        </div>
        <AdminDashboardContent />
      </main>
    </div>
  );
}
