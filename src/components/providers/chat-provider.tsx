'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { createClient } from '@/lib/supabase/client';

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
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const channel = supabase.channel(`user:${user.id}`);

    channel.on('broadcast', { event: 'message' }, (e) => {
      setIncomingMessages((prev) => {
        const next = new Map(prev);
        next.set((e.payload as any).id, e.payload);
        return next;
      });
    });

    channel.on('broadcast', { event: 'typing' }, (e) => {
      const payload = e.payload as TypingUser;
      const key = `${payload.conversationId}:${payload.userId}`;
      setTypingUsers((prev) => {
        if (prev.some((t) => t.conversationId === payload.conversationId && t.userId === payload.userId)) return prev;
        return [...prev, payload];
      });

      const existing = typingTimeoutsRef.current.get(key);
      if (existing) clearTimeout(existing);

      const timeout = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((t) => t.conversationId !== payload.conversationId || t.userId !== payload.userId));
        typingTimeoutsRef.current.delete(key);
      }, 3000);
      typingTimeoutsRef.current.set(key, timeout);
    });

    channel.on('broadcast', { event: 'read_receipt' }, (e) => {
      setLastReadReceipt(e.payload as ReadReceipt);
    });

    channel.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED');
    });

    return () => {
      channel.unsubscribe();
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

  return (
    <ChatContext.Provider value={{ connected, typingUsers, incomingMessages, lastReadReceipt, setTyping }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
