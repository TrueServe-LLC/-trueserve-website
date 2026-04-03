"use client";

import { useState } from "react";

export default function MerchantModeToggle() {
    const [mode, setMode] = useState<"delivery" | "pickup">("delivery");

    return (
        <div className="ml-mode-tabs">
            {(["delivery", "pickup"] as const).map((m) => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`ml-mode-tab${mode === m ? " active" : ""}`}
                >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
            ))}
        </div>
    );
}
