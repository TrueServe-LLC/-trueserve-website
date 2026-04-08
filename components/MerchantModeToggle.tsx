"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function MerchantModeToggle() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = (searchParams.get("mode") === "pickup" ? "pickup" : "delivery") as "delivery" | "pickup";

    const setMode = (nextMode: "delivery" | "pickup") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", nextMode);
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="ml-mode-tabs" role="tablist" aria-label="Merchant order mode">
            {(["delivery", "pickup"] as const).map((m) => (
                <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={`ml-mode-tab${mode === m ? " active" : ""}`}
                >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
            ))}
        </div>
    );
}
