import { onSocketEvent } from '@/lib/socket';

export const dynamic = 'force-dynamic';

export async function GET() {
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
        if (event.type === 'breaking_news') {
          send(event.payload);
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
