"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaymentMethods, detachPaymentMethod, createSetupIntent } from "@/app/user/settings/actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
        <form onSubmit={handleSubmit} className="p-6 bg-[#0c0e13] rounded-2xl border border-[#2a2f3a] mt-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl">
            <h4 className="font-barlow font-black text-white mb-6 text-sm uppercase tracking-[0.2em] italic flex items-center gap-3">
                <span className="text-xl">💳</span> Setup Payment Uplink
            </h4>

            <div className="bg-black/40 p-4 border border-white/5 mb-6">
                <PaymentElement options={{ layout: "tabs" }} />
            </div>

            {message && (
                <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/20 p-4 flex items-center gap-2">
                    <span>⚠️</span> {message}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-4 border border-[#1c1f28] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#e8a230] hover:border-[#e8a230] transition-all"
                >
                    Abort
                </button>
                <button
                    type="submit"
                    disabled={isSaving || !stripe || !elements}
                    className="flex-1 bg-[#3dd68c] text-black py-4 font-black uppercase tracking-[0.2em] text-[10px] disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(61,214,140,0.2)]"
                >
                    {isSaving ? "Encrypting..." : "Activate Link"}
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

    const loadMethods = useCallback(async () => {
        // Prevent repeated loading flickers if data is already present
        if (methods.length === 0) setIsLoading(true);
        try {
            const data = await getPaymentMethods(userId);
            setMethods(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [userId, methods.length]);

    useEffect(() => {
        loadMethods();
    }, [loadMethods]);

    const handleRemove = async (id: string) => {
        if (!confirm("Deactivate this operational payment method?")) return;
        try {
            await detachPaymentMethod(userId, id);
            await loadMethods();
        } catch (e) {
            alert("Protocol failure: Could not detach card.");
        }
    };

    const handleAddClick = async () => {
        setIsAddingCard(true);
        setError(null);
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
        <div className="bg-[#0f1219] border border-[#1c1f28] p-8 relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&display=swap');
            ` }} />

            <div className="flex justify-between items-center mb-8 border-b border-[#1c1f28] pb-6">
                <div>
                    <h3 className="font-barlow font-black text-white text-2xl uppercase italic leading-none">Digital <span>Wallet</span></h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#444] mt-2 italic">Secured Multi-Chain Assets</p>
                </div>
                <div className="w-12 h-12 bg-[#0c0e13] border border-[#1c1f28] flex items-center justify-center text-xl">💳</div>
            </div>

            {error && (
                <div className="mb-6 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/20 p-4">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-t-2 border-[#e8a230] rounded-full animate-spin mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2a2f3a] animate-pulse">Syncing Cryptographic Keys...</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {methods.length === 0 ? (
                        <div className="text-center py-10 bg-[#0c0e13] border border-[#1c1f28] border-dashed">
                            <span className="text-4xl opacity-20 filter grayscale mb-4 block">🏦</span>
                            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">Vault Environment Empty</p>
                            <p className="text-[10px] text-slate-700 mt-2">Initialize a secure link below to enable 1-click execution.</p>
                        </div>
                    ) : (
                        methods.map(pm => (
                            <div key={pm.id} className="flex justify-between items-center p-5 bg-[#0c0e13] border border-[#1c1f28] hover:border-[#e8a230]/40 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-10 bg-black border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-100 uppercase tracking-widest shadow-2xl relative overflow-hidden">
                                        {pm.brand === "PayPal" ? <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4 relative z-10" /> :
                                            pm.brand === "CashApp" ? <span className="text-emerald-400 relative z-10">CashApp</span> :
                                                <span className="opacity-80 relative z-10">{pm.brand || "Vault"}</span>}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white tracking-[0.1em] font-mono leading-none mb-2">{pm.displayPrimary}</p>
                                        <p className="text-[10px] text-[#444] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-[#3dd68c] rounded-full shadow-[0_0_8px_rgba(61,214,140,0.5)]"></span>
                                            {pm.displaySecondary}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(pm.id)}
                                    className="w-10 h-10 border border-transparent hover:border-red-500/20 text-[#2a2f3a] hover:text-red-500 transition-all flex items-center justify-center"
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
                    className={`w-full mt-8 py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all bg-[#e8a230] text-black hover:opacity-90 shadow-[0_0_30px_rgba(232,162,48,0.1)] ${isLoading ? 'opacity-30 pointer-events-none' : ''}`}
                >
                    + Establish Secure Link
                </button>
            ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#e8a230', colorBackground: '#0c0e13', colorText: '#f8fafc', fontFamily: 'DM Sans, sans-serif' } } }}>
                    <SetupForm
                        clientSecret={clientSecret}
                        onSuccess={() => {
                            setIsAddingCard(false);
                            setClientSecret(null);
                            loadMethods();
                        }}
                        onCancel={() => {
                            setIsAddingCard(false);
                            setClientSecret(null);
                        }}
                    />
                </Elements>
            ) : (
                <div className="mt-8 flex flex-col items-center py-10 bg-[#0c0e13] border border-[#1c1f28]">
                    <div className="w-6 h-6 border-t-2 border-[#e8a230] rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2a2f3a]">Encrypting Channel...</span>
                </div>
            )}
        </div>
    );
}
