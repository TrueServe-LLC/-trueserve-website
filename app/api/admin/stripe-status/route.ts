import { NextResponse } from 'next/server';
import { getAuthSession } from '@/app/auth/actions';
import { hasAnyPermission } from '@/lib/rbac';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { isAuth, role } = await getAuthSession();
  if (!isAuth || !hasAnyPermission(role, ['manage_payouts', 'access_qa_toolbox'])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  const secretMode = secretKey.startsWith('sk_test_')
    ? 'test'
    : secretKey.startsWith('sk_live_')
    ? 'live'
    : 'missing';

  const pubMode = publishableKey.startsWith('pk_test_')
    ? 'test'
    : publishableKey.startsWith('pk_live_')
    ? 'live'
    : 'missing';

  const keysMatch =
    (secretMode === 'test' && pubMode === 'test') ||
    (secretMode === 'live' && pubMode === 'live');

  let recentEvents: Array<{ id: string; type: string; created: number; livemode: boolean }> = [];
  let eventsError: string | null = null;

  try {
    const events = await getStripe().events.list({ limit: 15 });
    recentEvents = events.data.map((e) => ({
      id: e.id,
      type: e.type,
      created: e.created,
      livemode: e.livemode,
    }));
  } catch (err: any) {
    eventsError = err?.message || 'Failed to fetch events';
  }

  return NextResponse.json({
    secretMode,
    pubMode,
    webhookSecretPresent: webhookSecret.length > 0,
    keysMatch,
    recentEvents,
    eventsError,
  });
}
