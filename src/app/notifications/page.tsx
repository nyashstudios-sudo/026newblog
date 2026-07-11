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

const iconMap: Record<string, { path: string }> = {
  comment: {
    path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  },
  like: {
    path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
  follow: {
    path: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 8v6 M23 11h-6',
  },
  publish: {
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  },
  system: {
    path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01',
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
      <div className="page" style={{ textAlign: 'center', paddingTop: 96, paddingBottom: 96 }}>
        <h1 className="page-title" style={{ marginBottom: 16 }}>Notifications</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Sign in to view notifications.</p>
        <Link href="/auth/login" style={{ padding: '10px 22px', borderRadius: 9, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="mark-all">Mark all as read</button>
        )}
      </div>

      <div className="notif-filters">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} className={`notif-filter${filter === t.id ? ' active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {groupOrder.map(groupLabel => {
        const items = grouped[groupLabel];
        if (!items || items.length === 0) return null;
        return (
          <div key={groupLabel} className="notif-group">
            <div className="notif-group-label">{groupLabel}</div>
            <div className="notif-list">
              {items.map(n => {
                const iconConf = iconMap[n.type] || iconMap.system;
                const avatarColors = [
                  'oklch(50% 0.14 200)', 'oklch(50% 0.14 320)',
                  'oklch(50% 0.14 90)', 'oklch(50% 0.14 30)',
                ];
                return (
                  <div key={n.id} className={`notif-item${!n.isRead ? ' unread' : ''}`}>
                    {n.actor ? (
                      <div
                        className="notif-icon"
                        style={{
                          background: n.actor.avatarUrl ? 'transparent' : avatarColors[Math.abs(n.actor.username.length) % avatarColors.length],
                          overflow: 'hidden',
                          fontSize: '0.7rem', fontWeight: 700,
                          color: n.actor.avatarUrl ? undefined : 'oklch(98% 0.005 175)',
                        }}
                      >
                        {n.actor.avatarUrl
                          ? <img src={n.actor.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : `${n.actor.firstName[0]}${n.actor.lastName[0]}`
                        }
                      </div>
                    ) : (
                      <div className={`notif-icon ${n.type}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={iconConf.path} />
                        </svg>
                      </div>
                    )}
                    <div className="notif-content">
                      <div className="notif-text">
                        {n.actor && <strong>{n.actor.firstName} {n.actor.lastName} </strong>}
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
                      <div className="notif-time">{timeAgo(new Date(n.createdAt))}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {notifications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <div className="empty-title">No notifications yet</div>
          <div className="empty-desc">
            {filter === 'unread' ? 'You have no unread notifications.' : 'You\'re all caught up!'}
          </div>
        </div>
      )}
    </div>
  );
}
