"use client";

import { useState } from "react";
import { updateOrderStatus } from "../actions";

interface MerchantRejectButtonProps {
    orderId: string;
}

export default function MerchantRejectButton({ orderId }: MerchantRejectButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reasons = [
        "Store is too busy",
        "Item out of stock",
        "Store closing soon",
        "Issue with delivery address",
        "Other"
    ];

    const handleReject = async () => {
        if (!reason) return;
        setIsSubmitting(true);
        try {
            await updateOrderStatus(orderId, 'CANCELLED', reason);
            setIsOpen(false);
        } catch (e) {
            alert("Failed to reject order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="btn btn-outline text-sm py-2 text-red-400 border-red-500/20 hover:bg-red-500/10"
            >
                Reject Order
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Reject Order?</h3>
                        <p className="text-slate-400 text-sm mb-6">Please select a reason for rejecting this order. This will be shared with the customer.</p>
                        
                        <div className="space-y-2 mb-6">
                            {reasons.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setReason(r)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                        reason === r 
                                        ? 'bg-red-500/10 border-red-500 text-red-400' 
                                        : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="flex-1 btn btn-outline border-white/10 py-3 text-xs uppercase font-bold tracking-widest"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleReject}
                                disabled={!reason || isSubmitting}
                                className="flex-1 btn bg-red-600 hover:bg-red-700 text-white border-none py-3 text-xs uppercase font-bold tracking-widest disabled:opacity-50"
                            >
                                {isSubmitting ? "Rejecting..." : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
