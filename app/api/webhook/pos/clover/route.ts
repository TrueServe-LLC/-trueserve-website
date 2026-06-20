import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateCloverSignature } from '@/lib/posWebhooks';

/**
 * Clover Webhook Handler
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Handle Clover webhook verification challenge before any other processing
    if (body.verificationCode) {
      return NextResponse.json({ verificationCode: body.verificationCode });
    }

    const signature = req.headers.get('X-Clover-Signature');
    const signingSecret = process.env.CLOVER_SIGNING_SECRET;

    if (!signingSecret) {
      return NextResponse.json({ error: 'Clover webhook signing secret is not configured' }, { status: 503 });
    }

    if (!validateCloverSignature(rawBody, signature, signingSecret)) {
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    }

    const supabase = await createClient();

    // Map Clover Order Event
    if (body.type === 'ORDER_CREATED') {
        await supabase.from('Order').insert({
            id: body.id,
            status: 'PENDING',
            posReference: `CLOVER-${body.id}`,
            createdAt: new Date().toISOString()
        });
    }

    return NextResponse.json({ success: true, message: 'Clover Webhook Processed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Clover Protocol Active', { status: 200 });
}
