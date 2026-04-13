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
        <div className="flex items-center gap-2" role="tablist" aria-label="Merchant order mode">
            {(["delivery", "pickup"] as const).map((m) => (
                <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={`ts-pill-btn ts-pill-btn-sm ${
                        mode === m ? "ring-2 ring-[#e8a230]/35" : "opacity-85"
                    }`}
                >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
            ))}
        </div>
    );
}
