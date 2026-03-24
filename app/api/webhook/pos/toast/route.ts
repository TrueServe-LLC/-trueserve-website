import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Toast Webhook Handler
 * ---------------------
 * This endpoint is called by Toast when order status or menu data changes.
 * 
 * To obtain this Webhook URL:
 * 1. Log in to your Toast Developer Portal.
 * 2. Navigate to 'Partner API Configuration' -> 'Webhooks'.
 * 3. Add your production URL: https://www.trueserve.delivery/api/webhook/pos/toast
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('X-Toast-Signature');

    // 1. (Security) Validate the signature using your Toast Client Secret
    // if (!validateToastSignature(body, signature, process.env.TOAST_CLIENT_SECRET)) {
    //   return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    // }

    const supabase = await createClient();

    // 2. Map Toast Order Event to TrueServe
    if (body.eventType === 'ORDER_CREATED') {
        const toastOrder = body.order;
        const { error } = await supabase.from('Order').insert({
            id: toastOrder.id,
            status: 'PENDING',
            total: toastOrder.checkTotal,
            posReference: `TOAST-${toastOrder.id}`,
            restaurantId: toastOrder.restaurantId, // Needs lookup matching
            createdAt: new Date().toISOString()
        });
        if (error) throw error;
    }

    // 3. (Optional) Log the sync for Audit
    console.log(`[Toast Sync] Processed ${body.eventType} for Restaurant ${body.restaurantId}`);

    return NextResponse.json({ success: true, message: 'Webhook Processed' });
  } catch (error: any) {
    console.error('[Toast Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. (Technical) Always return 200 within 3 seconds to Toast
export async function GET() {
  return new NextResponse('Toast Protocol Active', { status: 200 });
}
