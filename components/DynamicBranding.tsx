"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function DynamicBranding() {
    const searchParams = useSearchParams();
    const primary = searchParams.get('primary');
    const accent = searchParams.get('accent');

    useEffect(() => {
        if (primary) {
            document.documentElement.style.setProperty('--primary', `#${primary.replace('#', '')}`);
        }
        if (accent) {
            document.documentElement.style.setProperty('--accent', `#${accent.replace('#', '')}`);
        }
    }, [primary, accent]);

    return null;
}
