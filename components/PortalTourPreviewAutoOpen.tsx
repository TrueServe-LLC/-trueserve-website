"use client";

import { useEffect } from "react";

type PortalType = "MERCHANT" | "DRIVER";

export default function PortalTourPreviewAutoOpen({ portal }: { portal: PortalType }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent("ts:portal-tour:open", { detail: { portal } }));
      } catch { }
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [portal]);

  return null;
}

