import { createClient } from '@supabase/supabase-js';

// In-process event emitter (for SSE streams that need same-process coordination)
type SocketEvent = {
  type: 'notification' | 'message' | 'breaking_news' | 'comment' | 'typing' | 'read_receipt' | 'user_online';
  userId?: string;
  payload: unknown;
};
type Listener = (event: SocketEvent) => void;
const listeners: Listener[] = [];
export function onSocketEvent(listener: Listener) {
  listeners.push(listener);
  return () => { const idx = listeners.indexOf(listener); if (idx >= 0) listeners.splice(idx, 1); };
}
function emit(event: SocketEvent) { listeners.forEach((l) => l(event)); }

// In-process helper functions
export function emitNotification(userId: string, notification: unknown) {
  emit({ type: 'notification', userId, payload: notification });
}
export function emitComment(articleId: string, comment: unknown) {
  emit({ type: 'comment', payload: { articleId, comment } });
}

// Supabase Realtime broadcasting (works across serverless instances)
let adminClient: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );
  }
  return adminClient;
}

export async function emitMessage(userId: string, message: unknown) {
  emit({ type: 'message', userId, payload: message });
  try { await getAdmin().channel(`user:${userId}`).send({ type: 'broadcast', event: 'message', payload: message }); } catch {}
}

export async function emitTyping(conversationId: string, userId: string, recipientId: string) {
  emit({ type: 'typing', userId: recipientId, payload: { conversationId, userId } });
  try { await getAdmin().channel(`user:${recipientId}`).send({ type: 'broadcast', event: 'typing', payload: { conversationId, userId } }); } catch {}
}

export async function emitReadReceipt(conversationId: string, userId: string, recipientId: string, lastReadMessageId: string) {
  emit({ type: 'read_receipt', userId: recipientId, payload: { conversationId, userId, lastReadMessageId } });
  try { await getAdmin().channel(`user:${recipientId}`).send({ type: 'broadcast', event: 'read_receipt', payload: { conversationId, userId, lastReadMessageId } }); } catch {}
}
