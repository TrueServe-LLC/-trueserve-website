"use client";

import { useState } from "react";
import AISpotCheckModal from "./AISpotCheckModal";

export default function SpotCheckTrigger({ needsSpotCheck = false }: { needsSpotCheck?: boolean }) {
    const [showModal, setShowModal] = useState(needsSpotCheck);

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className="btn bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-400 transition-all ml-4"
            >
                AI Spot Check (Demo)
            </button>

            {showModal && (
                <AISpotCheckModal 
                    onVerified={() => setShowModal(false)} 
                />
            )}
        </>
    );
}
