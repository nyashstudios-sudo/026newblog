'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
}

interface ContactMessageCount {
  new: number;
  read: number;
  replied: number;
  archived: number;
  total: number;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [counts, setCounts] = useState<ContactMessageCount>({ new: 0, read: 0, replied: 0, archived: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      let query = createClient()
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (filter !== 'all') {
        query = query.eq('status', filter === 'new' ? 'unread' : filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
      setHasMore((data?.length ?? 0) === PAGE_SIZE);
    } catch (e: any) {
      const msg = e?.message || e?.hint || 'Failed to fetch messages';
      setFetchError(msg.includes('permission') || msg.includes('RLS') ? 'Sign in as admin to view messages' : msg);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  const fetchCounts = useCallback(async () => {
    try {
      const statuses = ['unread', 'read', 'replied', 'archived'] as const;
      const results = await Promise.all(
        statuses.map(async (s) => {
          const { count, error } = await createClient()
            .from('contact_messages')
            .select('*', { count: 'exact', head: true })
            .eq('status', s);
          return { status: s, count: error ? 0 : (count || 0) };
        })
      );

      const c: ContactMessageCount = { new: 0, read: 0, replied: 0, archived: 0, total: 0 };
      results.forEach(({ status, count }) => {
        if (status === 'unread') { c.new = count; c.total += count; }
        else if (status === 'read') { c.read = count; c.total += count; }
        else if (status === 'replied') { c.replied = count; c.total += count; }
        else if (status === 'archived') { c.archived = count; c.total += count; }
      });
      setCounts(c);
    } catch (e) {
      console.error('Failed to fetch counts:', e);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchCounts();
  }, [page, filter, fetchMessages, fetchCounts]);

  // Realtime subscription
  useEffect(() => {
    const channel: RealtimeChannel = createClient()
      .channel('admin:contact-messages')
      .on('broadcast', { event: 'new_message' }, (payload) => {
        const msg = payload.payload as ContactMessage;

        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [msg, ...prev];
        });

        setCounts(prev => ({
          ...prev,
          new: prev.new + 1,
          total: prev.total + 1,
        }));

        showToast(`New message from ${msg.first_name} ${msg.last_name}`);
      })
      .on('broadcast', { event: 'message_updated' }, (payload) => {
        const update = payload.payload as {
          id: string;
          status: string;
          admin_notes: string | null;
          replied_at: string | null;
          replied_by: string | null;
        };

        setMessages(prev => prev.map(m =>
          m.id === update.id
            ? { ...m, status: update.status, admin_notes: update.admin_notes, replied_at: update.replied_at, replied_by: update.replied_by }
            : m
        ));

        fetchCounts();
      })
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchCounts, showToast]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await createClient()
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
      fetchCounts();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;

    setReplying(true);
    try {
      const { error } = await createClient()
        .from('contact_messages')
        .update({
          status: 'replied',
          admin_notes: replyContent,
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      setMessages(messages.map(m =>
        m.id === selectedMessage.id
          ? { ...m, status: 'replied', admin_notes: replyContent, replied_at: new Date().toISOString() }
          : m
      ));
      setSelectedMessage(null);
      setReplyContent('');
      fetchCounts();
    } catch (e) {
      console.error('Failed to reply:', e);
    } finally {
      setReplying(false);
    }
  };

  const getFilterLabel = (f: string) => {
    const labels: Record<string, string> = {
      all: `All (${counts.total})`,
      new: `New (${counts.new})`,
      read: `Read (${counts.read})`,
      replied: `Replied (${counts.replied})`,
      archived: `Archived (${counts.archived})`,
    };
    return labels[f] || f;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="dash-content" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (fetchError && messages.length === 0) {
    return (
      <div className="dash-content" style={{ padding: 32, animation: 'fade-in-up 0.4s var(--ease-out-expo) both' }}>
        <header style={{ marginBottom: 24 }}>
          <h1 className="dash-title">Contact Messages</h1>
        </header>
        <div style={{
          padding: 40, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 14, textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{fetchError}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            You need to be signed in as an admin to view contact messages.
          </p>
          <button
            onClick={() => { setFetchError(null); fetchMessages(); fetchCounts(); }}
            style={{
              padding: '10px 20px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
              background: 'var(--primary)', border: 'none', color: 'oklch(98% 0.005 175)', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-content" style={{ padding: 32, animation: 'fade-in-up 0.4s var(--ease-out-expo) both' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 200,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'success' ? 'oklch(55% 0.15 140)' : 'oklch(55% 0.2 25)',
          color: 'white', fontWeight: 600, fontSize: '0.85rem',
          boxShadow: '0 8px 24px oklch(0% 0 0 / 0.3)',
          animation: 'fade-in-up 0.3s var(--ease-out-expo) both',
        }}>
          {toast.message}
        </div>
      )}

      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="dash-title">Contact Messages</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Messages submitted via the contact form</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: realtimeConnected ? 'oklch(55% 0.15 140)' : 'var(--text-tertiary)' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: realtimeConnected ? 'oklch(65% 0.15 140)' : 'var(--text-tertiary)',
              animation: realtimeConnected ? 'pulse 2s ease-in-out infinite' : 'none',
            }} />
            {realtimeConnected ? 'Live' : 'Connecting...'}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'new', 'read', 'replied', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
              border: '1px solid var(--border-subtle)', background: filter === f ? 'var(--primary)' : 'var(--bg-surface)',
              color: filter === f ? 'oklch(98% 0.005 175)' : 'var(--text-secondary)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {getFilterLabel(f)}
          </button>
        ))}
      </div>

      {selectedMessage && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'oklch(0% 0 0 / 0.4)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16,
              padding: 24, width: '100%', maxWidth: 600, maxHeight: '85vh', overflow: 'auto',
              boxShadow: '0 20px 60px oklch(0% 0 0 / 0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reply to {selectedMessage.first_name} {selectedMessage.last_name}</h2>
              <button onClick={() => { setSelectedMessage(null); setReplyContent(''); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-inset)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                {selectedMessage.email} • {new Date(selectedMessage.created_at).toLocaleString()}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{selectedMessage.subject}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Your Reply
              </label>
              <textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                rows={6}
                placeholder="Type your response here... (In a real app, this would send an email to the user)"
                style={{
                  width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-inset)', color: 'var(--text-primary)', fontSize: '0.88rem',
                  fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => { setSelectedMessage(null); setReplyContent(''); }} style={{
                padding: '10px 20px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleReply} disabled={replying || !replyContent.trim()} style={{
                padding: '10px 20px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                background: 'var(--primary)', border: 'none', color: 'oklch(98% 0.005 175)', cursor: replying ? 'not-allowed' : 'pointer',
                opacity: replying ? 0.7 : 1,
              }}>
                {replying ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message Preview</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Received</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  No messages found
                </td>
              </tr>
            ) : (
              messages.map(msg => (
                <tr key={msg.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{msg.first_name} {msg.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{msg.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{msg.subject}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: 300 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.message.slice(0, 100)}{msg.message.length > 100 ? '...' : ''}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                      background: msg.status === 'unread' ? 'var(--primary-light)' :
                        msg.status === 'read' ? 'oklch(85% 0.02 220 / 0.15)' :
                          msg.status === 'replied' ? 'oklch(55% 0.15 140 / 0.15)' :
                            'oklch(70% 0.02 280 / 0.1)',
                      color: msg.status === 'unread' ? 'var(--primary)' :
                        msg.status === 'read' ? 'oklch(50% 0.02 220)' :
                          msg.status === 'replied' ? 'oklch(45% 0.15 140)' :
                            'oklch(50% 0.02 280)',
                    }}>
                      {msg.status === 'unread' ? 'new' : msg.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                          background: 'var(--primary)', border: 'none', color: 'oklch(98% 0.005 175)', cursor: 'pointer',
                        }}
                      >
                        Reply
                      </button>
                      <select
                        value={msg.status === 'unread' ? 'new' : msg.status}
                        onChange={e => handleStatusChange(msg.id, e.target.value === 'new' ? 'unread' : e.target.value)}
                        style={{
                          padding: '6px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 500,
                          background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer',
                        }}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {hasMore && (
          <div style={{ padding: 20, textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
              style={{
                padding: '10px 24px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                background: 'var(--primary)', border: 'none', color: 'oklch(98% 0.005 175)', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
