import { useState } from "react";
import { PaymentElement, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setMessage(submitError.message || "An error occurred");
            setIsLoading(false);
            return;
        }

        console.log("[Stripe] Confirming payment with elements...");
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, 
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        }
    };

    const handleExpressConfirm = async () => {
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setMessage(submitError.message || "An error occurred");
            setIsLoading(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-10 animate-fade-in">
             <style jsx global>{`
                .StripeElement { background: rgba(255,255,255,0.02) !important; border-radius: 12px !important; }
                #payment-element { --colorBackground: transparent; --colorPrimary: #e8a230; --colorText: #ffffff; --colorTextPlaceholder: #5A5550; --colorDanger: #e24b4a; --borderRadius: 12px; }
            `}</style>
            
            <div className="space-y-8">
                <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#e8a230] mb-4 block italic">// Express Authorization</label>
                    <div className={`transition-all duration-500 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 ${disabled ? 'opacity-30 pointer-events-none grayscale' : 'hover:border-[#e8a230]/30 shadow-xl shadow-black/50'}`}>
                        <ExpressCheckoutElement 
                            onConfirm={handleExpressConfirm}
                            options={{
                                buttonHeight: 52,
                                buttonTheme: {
                                    applePay: 'black',
                                }
                            }}
                        />
                    </div>
                </div>
                
                <div className="relative py-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10"></span>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest px-4 bg-[#0c0e13] text-[#5A5550] italic">
                        Or Manual Node Handshake
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl">
                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#e8a230] mb-6 block italic">// Secure Card Gateway</label>
                    <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
                </div>
            </div>

            <div className="pt-4">
                <button
                    disabled={isLoading || !stripe || !elements || disabled}
                    id="submit"
                    className="group relative w-full overflow-hidden bg-[#e8a230] text-black py-5 rounded-2xl font-bebas text-xl uppercase tracking-widest shadow-2xl shadow-[#e8a230]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-30 disabled:grayscale"
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        {isLoading ? "AUTHORIZING..." : `AUTHORIZE $${totalAmount.toFixed(2)} TRANSACTION →`}
                    </div>
                    
                    {/* Industrial Glow Effect */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
                
                <p className="text-center mt-6 text-[9px] font-black uppercase tracking-[0.4em] text-[#5A5550] italic opacity-60">
                    Secure 256-bit encryption protocol active
                </p>
            </div>

            {message && (
                <div id="payment-message" className="animate-shake text-[#e24b4a] text-[10px] font-black uppercase tracking-widest text-center bg-[#e24b4a]/5 py-4 rounded-xl border border-[#e24b4a]/20">
                    ⚠️ {message}
                </div>
            )}
        </form>
    );
}

