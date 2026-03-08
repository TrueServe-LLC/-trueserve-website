import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Order Timeout Cleanup — Vercel Cron Route
 * ──────────────────────────────────────────
 * Runs every 5 minutes (configured in vercel.json).
 * Auto-cancels orders stuck in a status for too long.
 *
 * PENDING      → CANCELLED  after 15 min  (no merchant accepted)
 * PREPARING    → CANCELLED  after 90 min  (merchant went dark)
 * READY_FOR_PICKUP → CANCELLED after 60 min (no driver showed up)
 *
 * Protected by CRON_SECRET env var — must match Authorization header from Vercel.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIMEOUTS: Record<string, number> = {
    PENDING: 15,
    PREPARING: 90,
    READY_FOR_PICKUP: 60,
};

export async function GET(request: Request) {
    // Security check — Vercel sends Authorization: Bearer <CRON_SECRET>
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    const cancelled: { id: string }[] = [];
    const errors: string[] = [];

    for (const [status, minutes] of Object.entries(TIMEOUTS)) {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('Order')
            .update({
                status: 'CANCELLED',
                updatedAt: new Date().toISOString()
            })
            .eq('status', status)
            .lt('updatedAt', cutoff)
            .select('id, userId');

        if (error) {
            errors.push(`${status}: ${error.message}`);
            continue;
        }

        if (data?.length) {
            cancelled.push(...data);

            // Notify each affected customer
            const notifications = data.map((o: any) => ({
                userId: o.userId,
                title: 'Order Cancelled',
                message: "Your order was automatically cancelled because it wasn't picked up in time. You have not been charged.",
                type: 'ORDER_CANCELLED',
                orderId: o.id
            }));
            await supabase.from('Notification').insert(notifications);
        }
    }

    const result = {
        success: true,
        timestamp: new Date().toISOString(),
        cancelled: cancelled.length,
        cancelledIds: cancelled.map(o => o.id),
        errors: errors.length ? errors : undefined
    };

    console.log('[order-cleanup cron]', result);

    return NextResponse.json(result);
}
