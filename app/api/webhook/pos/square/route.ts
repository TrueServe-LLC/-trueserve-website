import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Square Webhook Handler
 * ----------------------
 * To obtain this Webhook URL:
 * 1. Log in to your Square Developer Dashboard.
 * 2. Select 'Webhook Settings' -> 'Add Subscription'.
 * 3. Add your production URL: https://www.trueserve.delivery/api/webhook/pos/square
 * 4. Select event: 'order.created', 'order.updated'
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('X-Square-Signature');

    // 1. (Security) Validate the signature
    // if (!validateSquareSignature(body, signature, process.env.SQUARE_SIGNATURE_KEY)) {
    //   return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    // }

    const supabase = await createClient();

    // 2. Map Square Order Event to TrueServe
    if (body.type === 'order.created') {
        const squareOrder = body.data.object.order_created;
        const { error } = await supabase.from('Order').insert({
            id: squareOrder.order_id,
            status: 'PENDING',
            total: squareOrder.amount_money.amount,
            posReference: `SQUARE-${squareOrder.order_id}`,
            restaurantId: body.merchant_id, // Needs lookup matching
            createdAt: body.created_at
        });
        if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'Square Webhook Processed' });
  } catch (error: any) {
    console.error('[Square Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Square Protocol Active', { status: 200 });
}
