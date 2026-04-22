import { supabaseAdmin } from '@/lib/supabase-admin';
import type { RamenEventType, RamenPayload } from './types';

/**
 * Publish an event to a RAMEN channel via Supabase broadcast.
 * All connected SSE subscribers on that channel receive it immediately.
 *
 * channel: use driverLocChannel() / orderChannel() helpers from types.ts
 */
export async function ramenPublish(
  channel: string,
  type: RamenEventType,
  payload: RamenPayload,
): Promise<boolean> {
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    channel,
    payload,
    ts: Date.now(),
  };

  const { error } = await supabaseAdmin
    .channel(`ramen:${channel}`)
    .send({
      type: 'broadcast',
      event: type,
      payload: event,
    });

  if (error) console.error('[RAMEN] publish error:', error);
  return !error;
}
