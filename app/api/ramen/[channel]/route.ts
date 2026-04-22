// RAMEN SSE endpoint  —  GET /api/ramen/:channel
// Clients open a persistent EventSource connection here.
// Events are forwarded from Supabase broadcast in real time.

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channel: string }> },
) {
  const { channel } = await params;
  const enc = new TextEncoder();

  let supabaseChannel: ReturnType<Awaited<ReturnType<typeof createClient>>['channel']> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(enc.encode(`event: ${event}\ndata: ${data}\n\n`));
        } catch {
          isClosed = true;
        }
      };

      // Announce connection
      send('connected', JSON.stringify({ channel, ts: Date.now() }));

      // Subscribe to Supabase broadcast on this RAMEN channel
      const supabase = await createClient();
      supabaseChannel = supabase.channel(`ramen:${channel}`, {
        config: { broadcast: { ack: false } },
      });

      supabaseChannel
        .on('broadcast', { event: '*' }, (msg) => {
          if (isClosed) return;
          const eventType: string = (msg as any).event ?? 'message';
          const payload = (msg as any).payload ?? msg;
          send(eventType, JSON.stringify(payload));
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            send('ready', JSON.stringify({ channel }));
          }
        });

      // Heartbeat every 20 s — keeps connections alive through proxies/Vercel
      heartbeatTimer = setInterval(() => {
        if (isClosed) {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          return;
        }
        try {
          controller.enqueue(enc.encode(': heartbeat\n\n'));
        } catch {
          isClosed = true;
        }
      }, 20_000);

      // Tear down on client disconnect
      req.signal.addEventListener('abort', () => {
        isClosed = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        supabaseChannel?.unsubscribe();
        try { controller.close(); } catch { /* already closed */ }
      });
    },

    cancel() {
      isClosed = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      supabaseChannel?.unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',   // disables nginx buffering on Vercel edge
    },
  });
}
