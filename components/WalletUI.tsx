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
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900 rounded-xl border border-white/10 mt-4 animate-fade-in">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-primary">Add Payment Method</h4>
            <PaymentElement options={{ layout: "tabs" }} />
            
            {message && (
                <div className="mt-4 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                    {message}
                </div>
            )}

            <div className="flex gap-4 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 btn btn-outline border-white/20 text-slate-300 hover:bg-white/5 py-2"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving || !stripe || !elements}
                    className="flex-1 btn btn-primary py-2 font-bold disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save Payment Method"}
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
        try {
            const secret = await createSetupIntent(userId);
            if (!secret) throw new Error("No client secret returned");
            setClientSecret(secret);
        } catch (e: any) {
            console.error("SetupIntent creation failed:", e);
            alert("Failed to initialize securely.");
            setIsAddingCard(false);
        }
    };

    return (
        <div className="card bg-white/5 border border-white/10 p-6">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <span className="text-xl">💳</span> Wallet
                </h3>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {methods.length === 0 ? (
                        <p className="text-sm text-slate-400 py-2">No payment methods saved.</p>
                    ) : (
                        methods.map(pm => (
                            <div key={pm.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-8 bg-slate-800 rounded-md flex items-center justify-center text-[10px] font-black uppercase text-white shadow-inner border border-white/5">
                                        {pm.brand || "Card"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white tracking-widest">{pm.displayPrimary}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{pm.displaySecondary}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemove(pm.id)}
                                    className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                    title="Remove Card"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!isAddingCard ? (
                <button 
                    onClick={handleAddClick}
                    className="btn btn-outline border-white/20 hover:border-primary hover:text-primary w-full mt-6 py-3 text-sm font-bold transition-all text-slate-300"
                >
                    + Add Payment Method
                </button>
            ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
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
                <div className="mt-6 flex justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
}
