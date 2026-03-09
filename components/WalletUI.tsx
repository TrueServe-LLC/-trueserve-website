"use client";

import { useState, useEffect } from "react";
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

        // Confirm the setup intent
        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/user/settings`, // Should technically not redirect if handled via elements redirect: 'if_required', but we'll try that
            },
            redirect: 'if_required' 
        });

        if (error) {
            setMessage(error.message as string);
            setIsSaving(false);
        } else {
            // Success
            setIsSaving(false);
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900 rounded-xl border border-white/10 mt-4 animate-fade-in shadow-xl backdrop-blur-xl">
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <span className="text-xl">💳</span> Add Payment Method
            </h4>
            
            {/* PaymentElement container with enhanced styling hook */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <PaymentElement options={{ layout: "tabs" }} />
            </div>
            
            {message && (
                <div className="mt-4 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                    <span>⚠️</span> {message}
                </div>
            )}

            <div className="flex gap-4 mt-8">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 btn btn-outline border-white/20 text-slate-300 hover:bg-white/5 py-3 rounded-xl font-bold transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving || !stripe || !elements}
                    className="flex-1 btn btn-primary py-3 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {isSaving ? "Saving securely..." : "Save Method"}
                </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-4">Protected by Stripe Encrypted Tunnels 🔒</p>
        </form>
    );
}

export default function WalletUI({ userId }: { userId: string }) {
    const [methods, setMethods] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadMethods = async () => {
        setIsLoading(true);
        try {
            const data = await getPaymentMethods(userId);
            setMethods(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMethods();
    }, [userId]);

    const handleRemove = async (id: string) => {
        if (!confirm("Remove this payment method?")) return;
        try {
            await detachPaymentMethod(userId, id);
            await loadMethods();
        } catch(e) {
            alert("Failed to remove card.");
        }
    };

    const handleAddClick = async () => {
        setIsAddingCard(true);
        setError(null);
        try {
            const secret = await createSetupIntent(userId);
            if (!secret) throw new Error("Our secure payment tunnel is reconnecting. Please refresh and try again.");
            setClientSecret(secret);
        } catch (e: any) {
            console.error("SetupIntent creation failed:", e);
            setError(e.message || "Failed to initialize securely.");
            setIsAddingCard(false);
        }
    };

    return (
        <div className="card bg-white/5 border border-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="font-bold text-white text-xl flex items-center gap-3">
                    <span className="text-2xl bg-white/10 p-2 rounded-xl">💳</span> 
                    Digital Wallet
                </h3>
            </div>

            {error && (
                <div className="mb-4 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 text-primary">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Wallet...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {methods.length === 0 ? (
                        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            <span className="text-3xl opacity-50 mb-2 block">🏦</span>
                            <p className="text-sm font-bold text-white mb-1">Your wallet is empty</p>
                            <p className="text-xs text-slate-400">Add a card or account below for 1-click checkout.</p>
                        </div>
                    ) : (
                        methods.map(pm => (
                            <div key={pm.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all group shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-inner border border-white/10 group-hover:scale-105 transition-transform overflow-hidden">
                                        {pm.brand === "PayPal" ? <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" /> : 
                                         pm.brand === "CashApp" ? <span className="text-emerald-400">CashApp</span> : 
                                         <span className="opacity-80 uppercase tracking-wider">{pm.brand || "Card"}</span>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white tracking-widest leading-none mb-1.5">{pm.displayPrimary}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> 
                                            {pm.displaySecondary}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemove(pm.id)}
                                    className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all hover:scale-110 shadow-sm"
                                    title="Remove Payment Method"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!isAddingCard ? (
                <button 
                    onClick={handleAddClick}
                    className={`btn btn-outline border-white/20 hover:border-primary hover:bg-primary/5 hover:text-primary w-full mt-8 py-4 text-sm font-black uppercase tracking-widest transition-all text-slate-300 rounded-2xl ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    + Add Secure Payment
                </button>
            ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#00f2fe', colorBackground: '#1e293b', colorText: '#f8fafc' } } }}>
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
                <div className="mt-8 flex flex-col items-center py-6 bg-slate-900/50 rounded-2xl border border-white/5">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-3"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Securing Connection...</span>
                </div>
            )}
        </div>
    );
}
