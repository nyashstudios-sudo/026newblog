type SocketEvent = {
  type: 'notification' | 'message' | 'breaking_news' | 'comment' | 'typing' | 'read_receipt' | 'user_online';
  userId?: string;
  payload: unknown;
};

type Listener = (event: SocketEvent) => void;

const listeners: Listener[] = [];

export function onSocketEvent(listener: Listener) {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

function emit(event: SocketEvent) {
  listeners.forEach((l) => l(event));
}

export function emitNotification(userId: string, notification: unknown) {
  emit({ type: 'notification', userId, payload: notification });
}

export function emitMessage(userId: string, message: unknown) {
  emit({ type: 'message', userId, payload: message });
}

export function emitTyping(conversationId: string, userId: string, recipientId: string) {
  emit({ type: 'typing', userId: recipientId, payload: { conversationId, userId } });
}

export function emitReadReceipt(conversationId: string, userId: string, recipientId: string, lastReadMessageId: string) {
  emit({ type: 'read_receipt', userId: recipientId, payload: { conversationId, userId, lastReadMessageId } });
}

export function emitUserOnline(userId: string, online: boolean) {
  emit({ type: 'user_online', payload: { userId, online } });
}

export function emitBreakingNews(headline: string) {
  emit({ type: 'breaking_news', payload: { headline, timestamp: new Date().toISOString() } });
}

export function emitComment(articleId: string, comment: unknown) {
  emit({ type: 'comment', payload: { articleId, comment } });
}
