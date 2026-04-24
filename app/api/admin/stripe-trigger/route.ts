import { NextResponse } from 'next/server';
import { getAuthSession } from '@/app/auth/actions';
import { hasAnyPermission } from '@/lib/rbac';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { isAuth, role } = await getAuthSession();
  if (!isAuth || !hasAnyPermission(role, ['manage_payouts', 'access_qa_toolbox'])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey.startsWith('sk_test_')) {
    return NextResponse.json(
      { error: 'Test scenarios can only be triggered in Stripe test mode (sk_test_...).' },
      { status: 400 }
    );
  }

  const { scenario } = await req.json();

  try {
    switch (scenario) {
      case 'payment_success': {
        const pi = await getStripe().paymentIntents.create({
          amount: 100,
          currency: 'usd',
          payment_method: 'pm_card_visa',
          confirm: true,
          return_url: 'https://trueserve.delivery',
        });
        return NextResponse.json({
          success: true,
          scenario: 'payment_success',
          id: pi.id,
          status: pi.status,
          message: `PaymentIntent ${pi.id} created with status: ${pi.status}`,
        });
      }

      case 'payment_declined': {
        try {
          await getStripe().paymentIntents.create({
            amount: 100,
            currency: 'usd',
            payment_method: 'pm_card_visa_chargeDeclined',
            confirm: true,
            return_url: 'https://trueserve.delivery',
          });
          return NextResponse.json({ success: true, scenario: 'payment_declined', result: 'declined' });
        } catch (err: any) {
          // Stripe throws when card is declined — this is expected
          return NextResponse.json({
            success: true,
            scenario: 'payment_declined',
            result: 'declined_as_expected',
            stripeError: err?.raw?.code || err?.message,
            message: `Card declined as expected: ${err?.raw?.code || err?.message}`,
          });
        }
      }

      case 'refund': {
        // Create a succeeded PaymentIntent then refund it
        const pi = await getStripe().paymentIntents.create({
          amount: 500,
          currency: 'usd',
          payment_method: 'pm_card_visa',
          confirm: true,
          return_url: 'https://trueserve.delivery',
        });

        // Retrieve with latest_charge expanded
        const piExpanded = await getStripe().paymentIntents.retrieve(pi.id, {
          expand: ['latest_charge'],
        });

        const latestCharge = piExpanded.latest_charge as any;
        const chargeId = typeof latestCharge === 'string' ? latestCharge : latestCharge?.id;

        if (!chargeId) {
          return NextResponse.json({
            success: false,
            message: `PaymentIntent created (${pi.id}) but no charge found to refund. Status: ${pi.status}`,
          });
        }

        const refund = await getStripe().refunds.create({ charge: chargeId });
        return NextResponse.json({
          success: true,
          scenario: 'refund',
          paymentIntentId: pi.id,
          chargeId,
          refundId: refund.id,
          refundStatus: refund.status,
          message: `Refund ${refund.id} created for charge ${chargeId} — status: ${refund.status}`,
        });
      }

      case 'insufficient_funds': {
        try {
          await getStripe().paymentIntents.create({
            amount: 100,
            currency: 'usd',
            payment_method: 'pm_card_visa_chargeDeclinedInsufficientFunds',
            confirm: true,
            return_url: 'https://trueserve.delivery',
          });
        } catch (err: any) {
          return NextResponse.json({
            success: true,
            scenario: 'insufficient_funds',
            result: 'declined_as_expected',
            stripeError: err?.raw?.code || err?.message,
            message: `Insufficient funds decline: ${err?.raw?.code || err?.message}`,
          });
        }
        return NextResponse.json({ success: true, scenario: 'insufficient_funds', result: 'declined' });
      }

      default:
        return NextResponse.json({ error: `Unknown scenario: ${scenario}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Trigger failed' }, { status: 500 });
  }
}
