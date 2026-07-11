import { onSocketEvent } from '@/lib/socket';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const encoder = new TextEncoder();
  let removeListener: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: 'connected' });

      removeListener = onSocketEvent((event) => {
        if (
          event.type === 'message' ||
          event.type === 'typing' ||
          event.type === 'read_receipt'
        ) {
          if (event.userId === user.id) {
            send(event);
          }
        }
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      removeListener?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
