'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { ChatProvider, useChat } from '@/components/providers/chat-provider';
import { formatRelativeDate } from '@/lib/utils';

interface OtherUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string | null;
}

interface Conversation {
  id: string;
  otherUser: OtherUser | null;
  lastMessage?: { id: string; content: string; createdAt: string; isRead: boolean; senderId: string } | null;
  unread: boolean;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
  sender: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  sharedArticle?: { id: string; title: string; slug: string } | null;
}

function nameToGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = ((hash % 360) + 360) % 360;
  const h2 = (((hash * 7) % 360) + 360) % 360;
  return `linear-gradient(135deg, oklch(50% 0.14 ${h1}), oklch(45% 0.12 ${h2}))`;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const m = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d ago`;
  return formatRelativeDate(ts);
}

export default function ChatPageWrapper() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}

function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { typingUsers, incomingMessages, lastReadReceipt, setTyping, connected } = useChat();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showList, setShowList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeQuery, setComposeQuery] = useState('');
  const [composeResults, setComposeResults] = useState<OtherUser[]>([]);
  const [composeSearching, setComposeSearching] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const composeInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    setShowList(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      setShowList(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    fetch('/api/messages/conversations')
      .then((r) => r.json())
      .then((d) => {
        const list = d.conversations || [];
        setConversations(list);
        setFilteredConversations(list);
        if (list.length > 0 && !activeId) setActiveId(list[0].id);
      })
      .catch(() => setError('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredConversations(
        conversations.filter((c) => {
          if (!c.otherUser) return false;
          const name = `${c.otherUser.firstName} ${c.otherUser.lastName}`.toLowerCase();
          return name.includes(q) || c.otherUser.username.toLowerCase().includes(q);
        })
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchMessages = useCallback(async (conversationId: string, p = 1) => {
    try {
      const res = await fetch(`/api/messages/${conversationId}?page=${p}`);
      const d = await res.json();
      const msgs = d.messages || [];
      if (p === 1) {
        setMessages(msgs);
        processedIds.current = new Set(msgs.map((m: Message) => m.id));
      } else {
        setMessages((prev) => [...msgs, ...prev]);
        msgs.forEach((m: Message) => processedIds.current.add(m.id));
      }
      setHasMore(d.hasMore || false);
      setPage(p);
    } catch {
      if (p === 1) setError('Failed to load messages');
    }
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setMessages([]);
    processedIds.current = new Set();
    setHasMore(false);
    setPage(1);
    setError('');
    fetchMessages(activeId, 1);
  }, [activeId, fetchMessages]);

  // Listen for incoming real-time messages
  const processedIds = useRef(new Set<string>());
  useEffect(() => {
    if (!activeId) return;
    const entries = Array.from(incomingMessages.entries());
    if (entries.length === 0) return;

    setMessages((prev) => {
      let changed = false;
      const next = prev.filter(() => true);
      entries.forEach(([id, msg]) => {
        const m = msg as { id: string; conversationId: string } & Message;
        if (m.conversationId === activeId && !processedIds.current.has(id)) {
          processedIds.current.add(id);
          next.push(m as Message);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [incomingMessages, activeId]);

  // Listen for read receipts
  useEffect(() => {
    if (!lastReadReceipt || !activeId) return;
    if (lastReadReceipt.conversationId !== activeId) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.senderId !== user?.id
          ? { ...m, isRead: true }
          : m
      )
    );
  }, [lastReadReceipt, activeId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeId || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeId, content }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        processedIds.current.add(data.message.id);
        // Move conversation to top
        setConversations((prev) => {
          const next = [...prev];
          const idx = next.findIndex((c) => c.id === activeId);
          if (idx > 0) {
            const [item] = next.splice(idx, 1);
            item.lastMessage = { id: data.message.id, content, createdAt: data.message.createdAt, isRead: false, senderId: user!.id };
            next.unshift(item);
          } else if (idx === 0) {
            next[0].lastMessage = { id: data.message.id, content, createdAt: data.message.createdAt, isRead: false, senderId: user!.id };
          }
          return next;
        });
      } else {
        setInput(content);
      }
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleTyping = () => {
    if (!activeId || !conversations.find((c) => c.id === activeId)?.otherUser) return;
    const recipientId = conversations.find((c) => c.id === activeId)?.otherUser?.id;
    if (!recipientId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(activeId, recipientId);
    }, 300);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (isMobile) setShowList(false);
  };

  const loadMore = () => {
    if (!activeId || !hasMore) return;
    fetchMessages(activeId, page + 1);
  };

  const handleComposeSearch = async (q: string) => {
    setComposeQuery(q);
    if (q.length < 2) {
      setComposeResults([]);
      return;
    }
    setComposeSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const d = await res.json();
      setComposeResults(d.users || []);
    } catch {
      setComposeResults([]);
    } finally {
      setComposeSearching(false);
    }
  };

  const startConversation = async (otherUserId: string) => {
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: otherUserId }),
      });
      if (res.ok) {
        const d = await res.json();
        const exists = conversations.find((c) => c.id === d.conversation.id);
        if (!exists) {
          setConversations((prev) => [{ ...d.conversation, unread: false, updatedAt: new Date().toISOString(), lastMessage: null }, ...prev]);
        }
        setActiveId(d.conversation.id);
        setShowCompose(false);
        setComposeQuery('');
        setComposeResults([]);
        if (isMobile) setShowList(false);
      }
    } catch {}
  };

  const active = conversations.find((c) => c.id === activeId);
  const isTyping = activeId ? typingUsers.some((t) => t.conversationId === activeId) : false;
  const typingName = isTyping && active?.otherUser
    ? `${active.otherUser.firstName} ${active.otherUser.lastName}`
    : '';

  if (authLoading) return null;

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Messages</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Sign in to chat with other readers and authors.</p>
        <Link href="/auth/login" style={{ padding: '10px 22px', borderRadius: 9, background: 'var(--primary)', color: 'oklch(98% 0.005 175)', textDecoration: 'none', fontWeight: 600, display: 'inline-block' }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif' }}
    >
      <nav style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, padding: '4px 10px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-inset)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </Link>
          <Link href="/" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            <span style={{ color: 'var(--primary)' }}>026</span>Newsblog
          </Link>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Messages</span>
          <span style={{ fontSize: '0.65rem', color: connected ? 'var(--success)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? 'var(--success)' : 'var(--text-tertiary)', display: 'inline-block' }} />
            {connected ? 'Live' : 'Reconnecting...'}
          </span>
          <div style={{ flex: 1 }} />
        </div>
      </nav>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', overflow: 'hidden' }} className="chat-grid">
        {/* Conversation list */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: isMobile ? (showList ? 'flex' : 'none') : 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', display: 'flex' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <button
              onClick={() => { setShowCompose(true); setTimeout(() => composeInputRef.current?.focus(), 100); }}
              title="New conversation"
              style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: 'oklch(98% 0.005 175)' }}>
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {loading ? (
              <p style={{ padding: '16px 8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Loading conversations...</p>
            ) : filteredConversations.length === 0 ? (
              <p style={{ padding: '16px 8px', fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {searchQuery ? 'No conversations match' : 'No conversations yet'}
              </p>
            ) : (
              filteredConversations.map((c) => {
                const name = c.otherUser ? `${c.otherUser.firstName} ${c.otherUser.lastName}` : 'Unknown';
                const gradient = nameToGradient(name);
                const isActive = activeId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    style={{
                      display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 11, cursor: 'pointer',
                      marginBottom: 2, background: isActive ? 'var(--primary-light)' : 'transparent',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-inset)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0, position: 'relative' }}>
                      {getInitials(name)}
                      {c.unread && (
                        <span style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-surface)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: c.unread ? 700 : 600 }}>{name}</span>
                        {c.lastMessage && <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{formatTime(c.lastMessage.createdAt)}</span>}
                      </div>
                      {c.lastMessage && (
                        <div style={{
                          fontSize: '0.78rem', color: c.unread ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2,
                          fontWeight: c.unread ? 500 : 400
                        }}>
                          {c.lastMessage.content}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message area */}
        <div style={{
          display: isMobile ? (showList ? 'none' : 'flex') : 'flex',
          flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)'
        }}>
          {active?.otherUser ? (
            <>
              <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)' }}>
                {isMobile && (
                  <button onClick={() => setShowList(true)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                )}
                <div style={{ width: 38, height: 38, borderRadius: 10, background: nameToGradient(`${active.otherUser.firstName} ${active.otherUser.lastName}`), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0 }}>
                  {getInitials(`${active.otherUser.firstName} ${active.otherUser.lastName}`)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{active.otherUser.firstName} {active.otherUser.lastName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isTyping ? (
                      <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>typing...</span>
                    ) : connected ? (
                      <>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                        Online
                      </>
                    ) : (
                      'Offline'
                    )}
                  </div>
                </div>
                <button style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>

              <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {hasMore && (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <button
                      onClick={loadMore}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Load older messages
                    </button>
                  </div>
                )}
                {error && (
                  <div style={{ textAlign: 'center', padding: 12, fontSize: '0.78rem', color: 'var(--error)' }}>
                    {error}
                  </div>
                )}
                {messages.map((m, idx) => {
                  const isMine = m.senderId === user.id;
                  const senderName = `${m.sender.firstName} ${m.sender.lastName}`;
                  const showRead = isMine && idx === messages.length - 1;
                  const isLastInGroup = idx === messages.length - 1 || messages[idx + 1]?.senderId !== m.senderId;
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex', gap: 8, maxWidth: '72%',
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        flexDirection: isMine ? 'row-reverse' : 'row',
                        marginBottom: isLastInGroup ? 4 : 1
                      }}
                    >
                      {!isMine && isLastInGroup && (
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: nameToGradient(senderName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0, alignSelf: 'flex-end' }}>
                          {getInitials(senderName)}
                        </div>
                      )}
                      {!isMine && !isLastInGroup && <div style={{ width: 28, flexShrink: 0 }} />}
                      <div>
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isMine ? 'var(--primary)' : 'var(--bg-surface)',
                          border: isMine ? 'none' : '1px solid var(--border-subtle)',
                          fontSize: '0.85rem', lineHeight: 1.5,
                          color: isMine ? 'oklch(98% 0.005 175)' : 'var(--text-primary)'
                        }}>
                          {m.content}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 4, padding: '0 4px', textAlign: isMine ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: 4, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                          <span>{formatRelativeDate(m.createdAt)}</span>
                          {showRead && m.isRead && (
                            <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L7 17l-5-5"/><path d="M22 6l-11 11"/>
                              </svg>
                            </span>
                          )}
                          {showRead && !m.isRead && (
                            <span style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L7 17l-5-5"/>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div style={{ display: 'flex', gap: 8, maxWidth: '72%', alignSelf: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: nameToGradient(typingName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0, alignSelf: 'flex-end' }}>
                      {getInitials(typingName)}
                    </div>
                    <div>
                      <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-tertiary)', display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ animation: 'bounce 1.4s infinite', display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                        <span style={{ animation: 'bounce 1.4s infinite 0.2s', display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                        <span style={{ animation: 'bounce 1.4s infinite 0.4s', display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <button style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    value={input}
                    onChange={(e) => { handleInput(e); handleTyping(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', resize: 'none', maxHeight: 120, lineHeight: 1.5 }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() && !sending ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: input.trim() && !sending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: input.trim() && !sending ? 1 : 0.5 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" style={{ color: 'oklch(98% 0.005 175)' }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', flexDirection: 'column', gap: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ color: 'var(--text-tertiary)' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {conversations.length === 0 && !loading
                ? 'No conversations yet'
                : 'Select a conversation to start chatting'}
            </div>
          )}
        </div>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div
          onClick={() => { setShowCompose(false); setComposeQuery(''); setComposeResults([]); }}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>New conversation</h2>
            <input
              ref={composeInputRef}
              type="text"
              placeholder="Search users by name..."
              value={composeQuery}
              onChange={(e) => handleComposeSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', marginBottom: 12 }}
            />
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {composeSearching && <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', padding: 8 }}>Searching...</p>}
              {!composeSearching && composeQuery.length >= 2 && composeResults.length === 0 && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', padding: 8 }}>No users found</p>
              )}
              {composeResults.map((u) => {
                const name = `${u.firstName} ${u.lastName}`;
                return (
                  <div
                    key={u.id}
                    onClick={() => startConversation(u.id)}
                    style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', alignItems: 'center' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-inset)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: nameToGradient(name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'oklch(98% 0.005 175)', flexShrink: 0 }}>
                      {getInitials(name)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>@{u.username}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => { setShowCompose(false); setComposeQuery(''); setComposeResults([]); }}
              style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .chat-grid textarea:focus { border-color: var(--primary) !important; }
        .chat-grid input:focus { border-color: var(--primary) !important; }
        @media (max-width: 768px) { .chat-grid { grid-template-columns: 1fr !important; } }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
