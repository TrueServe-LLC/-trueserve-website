"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaymentMethods, detachPaymentMethod, createSetupIntent } from "@/app/user/settings/actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function SetupForm({
    clientSecret,
    onSuccess,
    onCancel
}: {
    clientSecret: string;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsSaving(true);
        setMessage(null);

        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/user/settings`,
            },
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message as string);
            setIsSaving(false);
        } else {
            setIsSaving(false);
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-[#0c0e13] rounded-2xl border border-white/10 mt-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl">
            <h4 className="font-bebas text-white mb-6 text-xl uppercase italic tracking-widest flex items-center gap-3">
                Setup Payment Uplink
            </h4>

            <div className="bg-black/40 p-4 border border-white/5 mb-6 rounded-xl">
                <PaymentElement options={{ layout: "tabs" }} />
            </div>

            {message && (
                <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    ⚠️ {message}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-4 border border-white/5 text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#e8a230] transition-all font-barlow-cond"
                >
                    Abort
                </button>
                <button
                    type="submit"
                    disabled={isSaving || !stripe || !elements}
                    className="flex-1 bg-[#e8a230] text-black py-4 font-bebas uppercase tracking-widest text-lg disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(232,162,48,0.2)] rounded-xl"
                >
                    {isSaving ? "Encrypting..." : "Activate"}
                </button>
            </div>
        </form>
    );
}

export default function WalletUI({ userId }: { userId: string }) {
    const [methods, setMethods] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadMethods = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const data = await getPaymentMethods(userId);
            setMethods(data);
        } catch (e) {
            console.error(e);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadMethods();
    }, [loadMethods]);

    const handleRemove = async (id: string) => {
        if (!confirm("Deactivate this operational payment method?")) return;
        try {
            await detachPaymentMethod(userId, id);
            await loadMethods(false);
        } catch (e) {
            alert("Protocol failure: Could not detach card.");
        }
    };

    const handleAddClick = async () => {
        setIsAddingCard(true);
        setError(null);
        if (!stripePromise) {
            setError("Stripe publishable key is missing. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and refresh.");
            setIsAddingCard(false);
            return;
        }
        try {
            const result = await createSetupIntent(userId);
            if (result && result.error) throw new Error(result.error);
            if (!result || !result.secret) throw new Error("Security tunnel failure. Please retry protocol.");
            setClientSecret(result.secret);
        } catch (e: any) {
            setError(e.message || "Failed to initialize securely.");
            setIsAddingCard(false);
        }
    };

    return (
        <div className="bg-[#131313] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden font-barlow-cond min-h-[300px]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="font-bebas text-white text-3xl uppercase italic leading-none tracking-wider">Digital <span className="text-[#e8a230]">Wallet</span></h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5550] mt-2 italic">Secured Assets</p>
                </div>
                <div className="w-12 h-12 bg-[#1C1C1C] border border-white/5 rounded-2xl flex items-center justify-center text-xl shadow-inner">💳</div>
            </div>

            {error && (
                <div className="mb-6 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-t-2 border-[#e8a230] rounded-full animate-spin mb-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5A5550] animate-pulse">Syncing...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {methods.length === 0 ? (
                        <div className="text-center py-10 bg-[#1C1C1C]/50 border border-white/5 border-dashed rounded-2xl">
                            <span className="text-4xl opacity-20 mb-4 block">🏦</span>
                            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Vault Empty</p>
                        </div>
                    ) : (
                        methods.map(pm => (
                            <div key={pm.id} className="flex justify-between items-center p-5 bg-[#1C1C1C] border border-white/5 rounded-2xl group transition-all hover:bg-[#1C1C1C]/80">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-9 bg-black/60 border border-white/5 rounded-lg flex items-center justify-center text-[9px] font-black text-[#e8a230] uppercase tracking-widest shadow-2xl">
                                        {pm.brand === "PayPal" ? "PAYPAL" : pm.brand || "CARD"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white tracking-widest leading-none mb-1.5">{pm.displayPrimary}</p>
                                        <p className="text-[10px] text-[#5A5550] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-[#e8a230] rounded-full shadow-[0_0_8px_#e8a230]"></span>
                                            {pm.displaySecondary}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(pm.id)}
                                    className="w-10 h-10 border border-transparent hover:border-red-500/20 text-[#5A5550] hover:text-red-500 transition-all flex items-center justify-center rounded-xl"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!isAddingCard ? (
                <button
                    onClick={handleAddClick}
                    className={`w-full mt-8 py-5 text-[12px] font-bebas uppercase tracking-widest transition-all bg-[#e8a230] text-black hover:opacity-90 shadow-[0_0_30px_rgba(232,162,48,0.1)] rounded-2xl ${isLoading ? 'opacity-30 pointer-events-none' : ''}`}
                >
                    + Establish Secure Link
                </button>
            ) : clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#e8a230', colorBackground: '#0c0e13', colorText: '#f8fafc', fontFamily: 'DM Sans, sans-serif' } } }}>
                    <SetupForm
                        clientSecret={clientSecret}
                        onSuccess={() => {
                            setIsAddingCard(false);
                            setClientSecret(null);
                            loadMethods(true);
                        }}
                        onCancel={() => {
                            setIsAddingCard(false);
                            setClientSecret(null);
                        }}
                    />
                </Elements>
            ) : (
                <div className="mt-8 flex flex-col items-center py-10 bg-[#1C1C1C] border border-white/5 rounded-2xl">
                    <div className="w-6 h-6 border-t-2 border-[#e8a230] rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5A5550]">Encrypting...</span>
                </div>
            )}
        </div>
    );
}
