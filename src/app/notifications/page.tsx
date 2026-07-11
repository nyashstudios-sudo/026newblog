'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

interface Notification {
  id: string; type: string; content?: string | null; title?: string | null;
  isRead: boolean; createdAt: string;
  actor?: { firstName: string; lastName: string; username: string; avatarUrl?: string | null } | null;
  article?: { title: string; slug: string } | null;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  const days = Math.floor(diffMs / 86400000);
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGroup(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfToday.getDay());
  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  if (date >= startOfWeek) return 'This Week';
  return 'Earlier';
}

const iconMap: Record<string, { path: string; color: string; bg: string }> = {
  comment: {
    path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    color: 'var(--primary)', bg: 'var(--primary-light)',
  },
  like: {
    path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    color: 'var(--error)', bg: 'var(--error-light)',
  },
  follow: {
    path: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 8v6 M23 11h-6',
    color: 'var(--accent)', bg: 'var(--accent-light)',
  },
  publish: {
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
    color: 'var(--success)', bg: 'var(--success-light)',
  },
  system: {
    path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01',
    color: 'var(--text-tertiary)', bg: 'var(--bg-inset)',
  },
};

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'comment', label: 'Comments' },
  { id: 'like', label: 'Likes' },
  { id: 'follow', label: 'Follows' },
  { id: 'system', label: 'System' },
];

const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const load = () => {
    const typeParam = filter === 'unread' ? 'all' : filter;
    fetch(`/api/notifications?type=${typeParam}`)
      .then(r => r.json())
      .then(d => {
        let items: Notification[] = d.notifications || [];
        if (filter === 'unread') items = items.filter(n => !n.isRead);
        setNotifications(items);
        setUnreadCount(d.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => { if (user) load(); }, [user, filter]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
    load();
  };

  const grouped = useMemo(() => {
    const map: Record<string, Notification[]> = {};
    for (const n of notifications) {
      const key = getGroup(new Date(n.createdAt));
      if (!map[key]) map[key] = [];
      map[key].push(n);
    }
    return map;
  }, [notifications]);

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Notifications</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Sign in to view notifications.</p>
        <Link href="/auth/login" style={{ padding: '10px 22px', borderRadius: 9, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer',
            background: 'none', border: 'none', fontFamily: 'inherit', padding: 0,
          }}>
            Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
            border: filter === t.id ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: filter === t.id ? 'var(--primary)' : 'transparent',
            color: filter === t.id ? 'oklch(98% 0.005 175)' : 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {groupOrder.map(groupLabel => {
        const items = grouped[groupLabel];
        if (!items || items.length === 0) return null;
        return (
          <div key={groupLabel} style={{ marginBottom: 32 }}>
            <div style={{
              fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 12, paddingLeft: 4,
            }}>
              {groupLabel}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map(n => {
                const iconConf = iconMap[n.type] || iconMap.system;
                const initials = n.actor
                  ? `${n.actor.firstName[0]}${n.actor.lastName[0]}`
                  : '?';
                const avatarColors = [
                  'oklch(50% 0.14 200)', 'oklch(50% 0.14 320)',
                  'oklch(50% 0.14 90)', 'oklch(50% 0.14 30)',
                ];
                const avatarColor = n.actor
                  ? avatarColors[Math.abs(n.actor.username.length) % avatarColors.length]
                  : iconConf.bg;
                return (
                  <div key={n.id} style={{
                    display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 12,
                    cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
                    background: n.isRead ? 'transparent' : 'var(--primary-light)',
                  }}>
                    {!n.isRead && (
                      <div style={{
                        position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                        width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)',
                      }} />
                    )}
                    {n.actor ? (
                      <div style={{
                        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                        background: n.actor.avatarUrl ? 'transparent' : avatarColor,
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: n.actor.avatarUrl ? undefined : 'oklch(98% 0.005 175)',
                      }}>
                        {n.actor.avatarUrl
                          ? <img src={n.actor.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : initials
                        }
                      </div>
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                        background: iconConf.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconConf.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={iconConf.path} />
                        </svg>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>
                        {n.actor && (
                          <strong style={{ fontWeight: 600 }}>{n.actor.firstName} {n.actor.lastName} </strong>
                        )}
                        {n.content || n.title}
                      </div>
                      {n.article && (
                        <Link href={`/article/${n.article.slug}`} style={{
                          fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none',
                          display: 'block', marginTop: 4, fontWeight: 500,
                        }}>
                          {n.article.title}
                        </Link>
                      )}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 3 }}>
                        {timeAgo(new Date(n.createdAt))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12, lineHeight: 1 }}>🔔</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>No notifications yet</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            {filter === 'unread' ? 'You have no unread notifications.' : 'You\'re all caught up!'}
          </div>
        </div>
      )}
    </div>
  );
}
