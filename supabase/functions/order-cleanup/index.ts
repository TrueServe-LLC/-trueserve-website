import { createClient } from 'npm:@supabase/supabase-js@2';

/**
 * Order Timeout Cleanup
 * ─────────────────────
 * Cancels stale orders that have been stuck in the same status for too long.
 * Intended to be scheduled via Supabase Cron (Dashboard > Edge Functions > Schedules).
 *
 * Rules:
 *   PENDING      → CANCELLED  if older than 15 minutes     (no merchant accepted it)
 *   PREPARING    → CANCELLED  if older than 90 minutes     (merchant went dark)
 *   READY_FOR_PICKUP → CANCELLED if older than 60 minutes  (no driver picked it up)
 */

const TIMEOUTS: Record<string, number> = {
    PENDING: 15,  // minutes
    PREPARING: 90,
    READY_FOR_PICKUP: 60,
};

Deno.serve(async (_req: Request) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            { auth: { persistSession: false } }
        );

        const cancelled: { id: string; status: string }[] = [];
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
                .lt('updatedAt', cutoff)         // stuck since before cutoff
                .select('id, status');

            if (error) {
                errors.push(`${status}: ${error.message}`);
            } else if (data?.length) {
                cancelled.push(...data);
            }
        }

        // Optionally insert a Notification for each cancelled order
        if (cancelled.length > 0) {
            // Get userId for each cancelled order so we can notify the customer
            const ids = cancelled.map((o: { id: string }) => o.id);
            const { data: orders } = await supabase
                .from('Order')
                .select('id, userId')
                .in('id', ids);

            if (orders?.length) {
                const notifications = orders.map((o: { id: string, userId: string }) => ({
                    userId: o.userId,
                    title: 'Order Cancelled',
                    message: 'Your order was automatically cancelled because it wasn\'t picked up in time. You have not been charged.',
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
            cancelledIds: cancelled.map((o: { id: string }) => o.id),
            errors: errors.length ? errors : undefined
        };

        console.log('[order-cleanup]', JSON.stringify(result));

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[order-cleanup] Fatal error:', msg);
        return new Response(JSON.stringify({ success: false, error: msg }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
});
