import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Lightspeed Webhook Handler
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('X-Lightspeed-Signature');

    // Security validation placeholder
    // if (!validateLightspeedSignature(JSON.stringify(body), signature, process.env.LIGHTSPEED_API_KEY)) {
    //   return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    // }

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
