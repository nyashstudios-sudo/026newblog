'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar } from '@/components/ui/avatar';
import { Bell, Search, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const isAuthPage = pathname.startsWith('/auth/');

  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications?limit=1')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setUnread(d.unreadCount || 0))
      .catch(() => {});
  }, [user]);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
    { href: '/categories', label: 'Categories' },
    ...(user ? [{ href: '/chat', label: 'Messages' }] : []),
    ...(user?.role === 'author' ? [{ href: '/author/dashboard', label: 'Dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--nav-bg)] border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
          026<span className="text-[var(--primary)]">Newsblog</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user?.role === 'author' || user?.role === 'admin' ? (
            <Link href="/author/editor" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold" style={{
              background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Write
            </Link>
          ) : null}
          <Link
            href="/explore"
            className="w-10 h-10 rounded-[10px] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] transition-colors"
          >
            <Search className="w-[18px] h-[18px]" />
          </Link>
          {!isAuthPage && <ThemeToggle />}
          {user && (
            <Link
              href="/notifications"
              className="relative w-10 h-10 rounded-[10px] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )}
          {!loading && (
            user ? (
              <div className="flex items-center gap-1 ml-1">
                <Link href={`/profile/${user.username}`} className="flex items-center">
                  <Avatar
                    src={user.avatarUrl}
                    name={`${user.firstName} ${user.lastName}`}
                    size="sm"
                  />
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="w-8 h-8 rounded-[8px] border border-[var(--border)] flex items-center justify-center hover:border-[var(--error)] hover:text-[var(--error)] transition-colors"
                >
                  <LogOut className="w-[14px] h-[14px]" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 ml-1">
                <Link href="/auth/login">
                  <button style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Sign in</button>
                </Link>
                <Link href="/auth/register">
                  <button style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                    background: 'var(--primary)', border: 'none', color: 'oklch(98% 0.005 175)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Join</button>
                </Link>
              </div>
            )
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] px-4 py-4 space-y-3 bg-[var(--bg-surface)]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user && (
            <Link href="/notifications" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
              Notifications {unread > 0 && `(${unread})`}
            </Link>
          )}
          {(user?.role === 'author' || user?.role === 'admin') && (
            <Link href="/author/editor" className="block text-sm font-semibold py-2 text-[var(--primary)]" onClick={() => setMenuOpen(false)}>
              Write Article
            </Link>
          )}
          {user && (
            <Link href="/settings" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
              Settings
            </Link>
          )}
          {user && (
            <button onClick={() => { logout(); setMenuOpen(false); }} className="block text-sm font-medium py-2 text-[var(--error)] w-full text-left" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign out
            </button>
          )}
          <div className="flex items-center gap-2 pt-2">
            {!isAuthPage && <ThemeToggle />}
            {!loading && !user && (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <button style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Sign in</button>
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                  <button style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                    background: 'var(--primary)', border: 'none', color: 'oklch(98% 0.005 175)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Join</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
