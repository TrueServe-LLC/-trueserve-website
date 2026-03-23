"use client";

import React, { useTransition, useState } from 'react';

export default function SystemToggle({ 
    initialEnabled, 
    toggleAction 
}: { 
    initialEnabled: boolean, 
    toggleAction: (targetStatus: boolean) => Promise<void> 
}) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        if (isPending) return;
        const targetState = !enabled;
        // Optimistic UI update
        setEnabled(targetState);
        startTransition(async () => {
            try {
                await toggleAction(targetState);
            } catch (e) {
                // Revert on failure
                setEnabled(!targetState);
            }
        });
    };

    return (
        <button 
            onClick={handleToggle}
            disabled={isPending}
            className={`w-8 h-4 md:w-10 md:h-5 rounded-full p-0.5 md:p-1 transition-colors relative flex items-center ${enabled ? 'bg-emerald-500' : 'bg-red-500'} ${isPending ? 'opacity-70' : ''}`}
        >
            <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-4 md:translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
}
