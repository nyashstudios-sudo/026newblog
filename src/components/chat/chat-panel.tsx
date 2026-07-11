'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

interface Conversation {
  id: string;
  otherUser: { id: string; firstName: string; lastName: string; username: string; avatarUrl?: string | null } | null;
  lastMessage?: { content: string; createdAt: string } | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

export function ChatPanel() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/messages/conversations')
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.conversations || []);
        if (d.conversations?.[0]) setActiveId(d.conversations[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/messages/${activeId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeId) return;
    const content = input.trim();
    setInput('');

    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: activeId, content }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    }
  };

  const active = conversations.find((c) => c.id === activeId);

  if (loading) {
    return <div className="text-center py-12 text-[var(--text-secondary)]">Loading conversations...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-elevated)]">
      <div className="w-72 border-r border-[var(--border-subtle)] overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-[var(--text-secondary)]">No conversations yet</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--bg-surface)] transition-colors ${
                activeId === c.id ? 'bg-[var(--primary-light)]' : ''
              }`}
            >
              {c.otherUser && (
                <>
                  <Avatar
                    src={c.otherUser.avatarUrl}
                    name={`${c.otherUser.firstName} ${c.otherUser.lastName}`}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {c.otherUser.firstName} {c.otherUser.lastName}
                    </p>
                    {c.lastMessage && (
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{c.lastMessage.content}</p>
                    )}
                  </div>
                </>
              )}
            </button>
          ))
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {active?.otherUser ? (
          <>
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
              <Avatar
                src={active.otherUser.avatarUrl}
                name={`${active.otherUser.firstName} ${active.otherUser.lastName}`}
              />
              <p className="font-medium">
                {active.otherUser.firstName} {active.otherUser.lastName}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => {
                const isMine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <Avatar
                      src={m.sender.avatarUrl}
                      name={`${m.sender.firstName} ${m.sender.lastName}`}
                      size="sm"
                    />
                    <div className={`max-w-[70%] ${isMine ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        {m.content}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        {formatRelativeDate(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-[var(--border-subtle)] flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
