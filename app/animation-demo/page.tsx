"use client";
import { useState } from "react";
import OrderConfirmAnimation from "@/components/OrderConfirmAnimation";

export default function AnimationDemo() {
    const [show, setShow] = useState(false);
    const [key, setKey] = useState(0);

    const replay = () => {
        setShow(false);
        setTimeout(() => {
            setKey(k => k + 1);
            setShow(true);
        }, 50);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
            {show && (
                <OrderConfirmAnimation
                    key={key}
                    restaurantName="Snappy Lunch"
                    onComplete={() => setShow(false)}
                />
            )}
            <h1 className="text-white text-2xl font-black font-serif italic">Order Animation Demo</h1>
            <button
                onClick={replay}
                className="px-10 py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg shadow-amber-500/20"
            >
                ▶ Play Animation
            </button>
            <p className="text-slate-600 text-xs uppercase tracking-widest">Animation plays for ~4 seconds then returns here</p>
        </div>
    );
}
