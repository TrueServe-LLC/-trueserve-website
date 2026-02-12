"use client";
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ReviewModalProps {
    orderId: string;
    driverId: string;
    customerId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReviewModal({ orderId, driverId, customerId, isOpen, onClose }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const supabase = createClient();

        const { error } = await supabase
            .from('Review')
            .insert({
                orderId,
                driverId,
                customerId,
                rating,
                comment
            });

        setIsSubmitting(false);

        if (error) {
            alert("Failed to submit review: " + error.message);
        } else {
            setSubmitted(true);
            setTimeout(onClose, 2000); // Close after 2s
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="card bg-slate-900 border border-emerald-500/50 p-8 text-center animate-bounce-in">
                    <div className="text-4xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-emerald-400">Review Submitted!</h2>
                    <p className="text-slate-400 mt-2">Thank you for your feedback.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="card bg-slate-900 border border-white/10 w-full max-w-md shadow-2xl animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-2">Rate your Driver</h2>
                <p className="text-sm text-slate-400 mb-6">How was your delivery experience?</p>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-700'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <textarea
                    className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-colors mb-6 h-32 resize-none"
                    placeholder="Write a comment (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 btn btn-outline border-white/10 hover:bg-white/5"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 btn btn-primary font-bold shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </div>
        </div>
    );
}
