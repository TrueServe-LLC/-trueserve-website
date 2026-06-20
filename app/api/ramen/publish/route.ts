// RAMEN publish endpoint  —  POST /api/ramen/publish
// Used by the driver's browser to push location pings.
// Server-side code should call ramenPublish() from lib/ramen/publisher.ts directly.

import { NextRequest, NextResponse } from 'next/server';
import { ramenPublish } from '@/lib/ramen/publisher';
import type { RamenEventType } from '@/lib/ramen/types';
import { getAuthSession } from '@/app/auth/actions';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { isAuth, userId } = await getAuthSession();
  if (!isAuth || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { channel?: string; type?: string; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { channel, type, payload } = body;
  if (!channel || !type) {
    return NextResponse.json({ error: 'channel and type are required' }, { status: 400 });
  }

  if (type === 'driver_location') {
    const payloadDriverId = (payload as any)?.driverId;
    if (!payloadDriverId || channel !== `driver-loc:${payloadDriverId}`) {
      return NextResponse.json({ error: 'Invalid driver location channel' }, { status: 400 });
    }

    const { data: driver, error } = await supabaseAdmin
      .from('Driver')
      .select('id')
      .eq('id', payloadDriverId)
      .eq('userId', userId)
      .single();

    if (error || !driver) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const ok = await ramenPublish(
    channel,
    type as RamenEventType,
    (payload ?? {}) as Record<string, unknown>,
  );

  return NextResponse.json({ ok });
}
