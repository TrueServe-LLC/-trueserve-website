"use client";

import { useState } from "react";
import { cancelMembership, subscribeToPlus } from "@/app/user/settings/actions";

export default function MembershipUI({ 
    userId, 
    plan, 
    hasPaymentMethod 
}: { 
    userId: string, 
    plan: string,
    hasPaymentMethod: boolean 
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isPlus = plan === "Plus";

    const handleSubscribe = async () => {
        if (!hasPaymentMethod) {
            setError("Please add a payment method to your wallet first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await subscribeToPlus(userId);
            if (result.error) throw new Error(result.error);
        } catch(e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel your TrueServe Plus membership? You will lose free delivery on all orders.")) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const result = await cancelMembership(userId);
            if (result.error) throw new Error(result.error);
        } catch(e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card bg-white/5 border border-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="font-bold text-white text-xl flex items-center gap-3">
                    <span className="text-2xl bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-xl p-2 text-transparent bg-clip-text">🛡️</span> 
                    TrueServe Plus
                </h3>
                {isPlus && (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-black uppercase tracking-widest">
                        Active Member
                    </span>
                )}
            </div>

            {error && (
                <div className="mb-6 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-4 text-sm text-slate-300">
                <p>
                    {isPlus 
                        ? "You are currently enjoying $0 delivery fees on all orders and priority customer support!" 
                        : "Upgrade to TrueServe Plus to get $0 delivery fees on all orders, exclusive local discounts, and priority courier matching."}
                </p>
                <div className="flex items-baseline gap-2 pb-4">
                    <span className="text-3xl font-black text-white">$9.99</span>
                    <span className="text-slate-500 uppercase tracking-widest text-xs font-bold">/ month</span>
                </div>

                {isPlus ? (
                    <button 
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="w-full btn bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Canceling..." : "Cancel Membership"}
                    </button>
                ) : (
                    <button 
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full btn bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Upgrading..." : "Upgrade to Plus"}
                    </button>
                )}
            </div>
            {!isPlus && !hasPaymentMethod && (
                <p className="text-[10px] text-yellow-500 text-center mt-4">Required: Add a payment method to your wallet first.</p>
            )}
        </div>
    );
}
