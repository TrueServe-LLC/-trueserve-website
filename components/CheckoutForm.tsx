
"use client";

import { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
    onSuccess: (paymentIntentId: string) => void;
    totalAmount: number;
    disabled?: boolean;
}

export default function CheckoutForm({ onSuccess, totalAmount, disabled }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentRequest, setPaymentRequest] = useState<any>(null);

    useEffect(() => {
        if (!stripe || !elements) return;

        const pr = stripe.paymentRequest({
            country: 'US',
            currency: 'usd',
            total: {
                label: 'TrueServe Order',
                amount: Math.round(totalAmount * 100),
            },
            requestPayerName: true,
            requestPayerEmail: true,
        });

        // Check the availability of the Payment Request API first.
        pr.canMakePayment().then(result => {
            if (result) {
                setPaymentRequest(pr);
            }
        });

        pr.on('paymentmethod', async (ev) => {
            // Get the client secret from the elements
            const clientSecret = (elements as any)._commonOptions.clientSecret;

            const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: ev.paymentMethod.id },
                { handleActions: false }
            );

            if (confirmError) {
                ev.complete('fail');
            } else {
                ev.complete('success');
                if (paymentIntent.status === "succeeded") {
                    onSuccess(paymentIntent.id);
                }
            }
        });
    }, [stripe, elements, totalAmount, onSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        console.log("[Stripe] Confirming payment with elements...");
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });
        console.log("[Stripe] Payment confirmation result", { status: paymentIntent?.status, error: error?.message });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An error occurred");
            } else {
                setMessage("An unexpected error occurred.");
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            {paymentRequest && (
                <div className="mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Express Checkout</p>
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                        <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-900 px-3 text-slate-500 font-bold tracking-widest">Or pay with card</span></div>
                    </div>
                </div>
            )}

            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            <button
                disabled={isLoading || !stripe || !elements || disabled}
                id="submit"
                className="w-full btn btn-primary py-4 text-lg shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
                {isLoading ? "Processing..." : `Pay $${totalAmount.toFixed(2)} & Place Order`}
            </button>

            {message && <div id="payment-message" className="text-red-400 text-sm text-center">{message}</div>}
        </form>
    );
}
