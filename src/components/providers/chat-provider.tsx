'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './auth-provider';

interface TypingUser {
  conversationId: string;
  userId: string;
}

interface ReadReceipt {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
}

interface ChatContextType {
  connected: boolean;
  typingUsers: TypingUser[];
  incomingMessages: Map<string, unknown>;
  lastReadReceipt: ReadReceipt | null;
  setTyping: (conversationId: string, recipientId: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  connected: false,
  typingUsers: [],
  incomingMessages: new Map(),
  lastReadReceipt: null,
  setTyping: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [incomingMessages, setIncomingMessages] = useState<Map<string, unknown>>(new Map());
  const [lastReadReceipt, setLastReadReceipt] = useState<ReadReceipt | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const connect = useCallback(() => {
    if (!user) return;
    if (esRef.current?.readyState === EventSource.OPEN) return;

    const es = new EventSource('/api/messages/stream');
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'connected') return;

        if (data.type === 'message') {
          setIncomingMessages((prev) => {
            const next = new Map(prev);
            next.set(data.payload.id, data.payload);
            return next;
          });
        }

        if (data.type === 'typing') {
          const key = `${data.payload.conversationId}:${data.payload.userId}`;
          setTypingUsers((prev) => {
            if (prev.some((t) => t.conversationId === data.payload.conversationId && t.userId === data.payload.userId)) return prev;
            return [...prev, data.payload];
          });

          const existing = typingTimeoutsRef.current.get(key);
          if (existing) clearTimeout(existing);

          const timeout = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((t) => t.conversationId !== data.payload.conversationId || t.userId !== data.payload.userId));
            typingTimeoutsRef.current.delete(key);
          }, 3000);
          typingTimeoutsRef.current.set(key, timeout);
        }

        if (data.type === 'read_receipt') {
          setLastReadReceipt(data.payload);
        }
      } catch {}
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      reconnectRef.current = setTimeout(connect, 5000);
    };
  }, [user]);

  const setTyping = useCallback((conversationId: string, recipientId: string) => {
    if (!user) return;
    fetch('/api/messages/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, recipientId }),
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      esRef.current?.close();
    };
  }, [connect]);

  return (
    <ChatContext.Provider value={{ connected, typingUsers, incomingMessages, lastReadReceipt, setTyping }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
