// RAMEN publish endpoint  —  POST /api/ramen/publish
// Used by the driver's browser to push location pings.
// Server-side code should call ramenPublish() from lib/ramen/publisher.ts directly.

import { NextRequest, NextResponse } from 'next/server';
import { ramenPublish } from '@/lib/ramen/publisher';
import type { RamenEventType } from '@/lib/ramen/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
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

  const ok = await ramenPublish(
    channel,
    type as RamenEventType,
    (payload ?? {}) as Record<string, unknown>,
  );

  return NextResponse.json({ ok });
}
