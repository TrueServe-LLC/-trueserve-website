import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateLightspeedSignature } from '@/lib/posWebhooks';

/**
 * Lightspeed Webhook Handler
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const signature = req.headers.get('X-Lightspeed-Signature');
    const signingSecret = process.env.LIGHTSPEED_API_KEY;

    if (!signingSecret) {
      return NextResponse.json({ error: 'Lightspeed webhook signing secret is not configured' }, { status: 503 });
    }

    if (!validateLightspeedSignature(rawBody, signature, signingSecret)) {
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    }

    const supabase = await createClient();

    // Mapping logic
    return NextResponse.json({ success: true, message: 'Lightspeed Webhook Received' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Lightspeed Protocol Active', { status: 200 });
}
