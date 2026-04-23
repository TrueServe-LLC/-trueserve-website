"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type { RamenEvent, RamenEventType, RamenPayload } from '@/lib/ramen/types';

type ConnectionState = 'connecting' | 'ready' | 'error' | 'closed';

export interface UseRamenStreamOptions {
  /** Only fire onEvent for these event types. Omit to receive all. */
  filter?: RamenEventType[];
}

export interface UseRamenStreamResult<T extends RamenPayload = RamenPayload> {
  lastEvent: RamenEvent<T> | null;
  connectionState: ConnectionState;
  /** Imperatively disconnect and reconnect the stream. */
  reconnect: () => void;
}

/**
 * useRamenStream — subscribe to a RAMEN channel via SSE.
 *
 * @param channel  Pass null to disable the connection (e.g. when driverId unknown yet).
 *                 Use driverLocChannel() / orderChannel() from lib/ramen/types.ts.
 */
export function useRamenStream<T extends RamenPayload = RamenPayload>(
  channel: string | null,
  options: UseRamenStreamOptions = {},
): UseRamenStreamResult<T> {
  const [lastEvent, setLastEvent] = useState<RamenEvent<T> | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('closed');
  const esRef = useRef<EventSource | null>(null);
  const filterRef = useRef(options.filter);
  filterRef.current = options.filter;

  const connect = useCallback((ch: string) => {
    esRef.current?.close();
    setConnectionState('connecting');

    const es = new EventSource(`/api/ramen/${encodeURIComponent(ch)}`);
    esRef.current = es;

    es.addEventListener('connected', () => setConnectionState('connecting'));
    es.addEventListener('ready', () => setConnectionState('ready'));

    const handleMsg = (type: string, e: Event) => {
      const allowed = filterRef.current;
      if (allowed && !allowed.includes(type as RamenEventType)) return;
      try {
        const event: RamenEvent<T> = JSON.parse((e as MessageEvent).data);
        setLastEvent(event);
      } catch { /* malformed event — skip */ }
    };

    // Listen for each typed RAMEN event
    const types: RamenEventType[] = ['driver_location', 'order_status', 'order_eta', 'heartbeat'];
    types.forEach((t) => es.addEventListener(t, (e) => handleMsg(t, e)));

    // Fallback for any untyped broadcast
    es.onmessage = (e) => handleMsg('order_status', e);

    es.onerror = () => {
      setConnectionState('error');
      // EventSource auto-reconnects after error; state updates when 'ready' fires again
    };
  }, []);

  const reconnect = useCallback(() => {
    if (channel) connect(channel);
  }, [channel, connect]);

  useEffect(() => {
    if (!channel) {
      esRef.current?.close();
      esRef.current = null;
      setConnectionState('closed');
      return;
    }

    connect(channel);

    return () => {
      esRef.current?.close();
      esRef.current = null;
      setConnectionState('closed');
    };
  }, [channel, connect]);

  return { lastEvent, connectionState, reconnect };
}
