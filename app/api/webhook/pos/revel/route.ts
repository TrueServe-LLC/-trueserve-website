import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateRevelSignature } from '@/lib/posWebhooks';

/**
 * Revel Webhook Handler
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const signature = req.headers.get('X-Revel-Signature');
    const signingSecret = process.env.REVEL_API_SECRET;

    if (!signingSecret) {
      return NextResponse.json({ error: 'Revel webhook signing secret is not configured' }, { status: 503 });
    }

    if (!validateRevelSignature(rawBody, signature, signingSecret)) {
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    }

    const supabase = await createClient();

    // Mapping logic
    return NextResponse.json({ success: true, message: 'Revel Webhook Received' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Revel Protocol Active', { status: 200 });
}
