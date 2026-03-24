import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Revel Webhook Handler
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('X-Revel-Signature');

    // Security validation placeholder
    // if (!validateRevelSignature(JSON.stringify(body), signature, process.env.REVEL_API_SECRET)) {
    //   return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    // }

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
