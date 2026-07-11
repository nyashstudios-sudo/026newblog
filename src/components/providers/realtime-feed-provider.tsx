'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './auth-provider';

interface RealtimeEvent {
  type: 'breaking_news' | 'notification' | 'article_update' | 'comment';
  payload: unknown;
  timestamp: number;
}

interface RealtimeFeedContextType {
  connected: boolean;
  lastEvent: RealtimeEvent | null;
  breakingNews: unknown[];
}

const RealtimeFeedContext = createContext<RealtimeFeedContextType>({
  connected: false,
  lastEvent: null,
  breakingNews: [],
});

export function RealtimeFeedProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [breakingNews, setBreakingNews] = useState<unknown[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (esRef.current?.readyState === EventSource.OPEN) return;

    const es = new EventSource('/api/breaking-news/stream');
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'connected') return;
        const event: RealtimeEvent = {
          type: 'breaking_news',
          payload: data,
          timestamp: Date.now(),
        };
        setLastEvent(event);
        setBreakingNews((prev) => [data, ...prev].slice(0, 20));
      } catch {}
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      reconnectRef.current = setTimeout(connect, 5000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      esRef.current?.close();
    };
  }, [connect]);

  return (
    <RealtimeFeedContext.Provider value={{ connected, lastEvent, breakingNews }}>
      {children}
    </RealtimeFeedContext.Provider>
  );
}

export const useRealtimeFeed = () => useContext(RealtimeFeedContext);
