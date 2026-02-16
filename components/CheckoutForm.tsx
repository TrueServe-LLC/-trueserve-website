
"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
    onSuccess: (paymentIntentId: string) => void;
    totalAmount: number;
}

export default function CheckoutForm({ onSuccess, totalAmount }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full btn btn-primary py-4 text-lg shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
                {isLoading ? "Processing..." : `Pay $${totalAmount.toFixed(2)} & Place Order`}
            </button>

            {message && <div id="payment-message" className="text-red-400 text-sm text-center">{message}</div>}
        </form>
    );
}
