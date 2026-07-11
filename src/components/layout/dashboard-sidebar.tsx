'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PenLine,
  BarChart3,
  DollarSign,
  Users,
  Settings,
  Rss,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  role: 'author' | 'admin';
}

const authorItems = [
  { href: '/author/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/author/editor', label: 'Editor', icon: PenLine },
  { href: '/author/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/author/withdraw', label: 'Withdrawals', icon: DollarSign },
];

const adminItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/authors', label: 'Authors', icon: Users },
  { href: '/admin/rss', label: 'RSS Feeds', icon: Rss },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/moderation', label: 'Moderation', icon: Shield },
];

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = role === 'admin' ? adminItems : authorItems;

  return (
    <aside className="w-56 shrink-0">
      <nav className="sticky top-24 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
