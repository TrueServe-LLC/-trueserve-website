"use client";

import { useEffect, useMemo, useState } from "react";

type PortalType = "MERCHANT" | "DRIVER";

type PortalTourStep = {
  title: string;
  body: string;
  selector?: string;
};

const TOUR_OPEN_EVENT = "ts:portal-tour:open";

function safeQuerySelector(selector?: string): HTMLElement | null {
  if (!selector) return null;
  try {
    return document.querySelector(selector) as HTMLElement | null;
  } catch {
    return null;
  }
}

function computeSpotlightRect(target: HTMLElement): DOMRect {
  const rect = target.getBoundingClientRect();
  const padding = 10;
  const width = Math.max(0, rect.width + padding * 2);
  const height = Math.max(0, rect.height + padding * 2);
  const left = rect.left - padding;
  const top = rect.top - padding;
  return new DOMRect(left, top, width, height);
}

export default function PortalTour({ portal }: { portal: PortalType }) {
  const storageKey = useMemo(() => `ts.portalTour.${portal}.v1`, [portal]);

  const steps: PortalTourStep[] = useMemo(() => {
    if (portal === "MERCHANT") {
      return [
        {
          title: "Dashboard",
          body: "Your command center: view performance, orders, and keep your storefront up to date.",
          selector: "[data-tour='merchant-nav-dashboard']",
        },
        {
          title: "Integrations",
          body: "Connect POS and payment tools here. This is where your operational setup lives.",
          selector: "[data-tour='merchant-nav-integrations']",
        },
        {
          title: "Storefront",
          body: "Preview the customer-facing ordering experience for your restaurant.",
          selector: "[data-tour='merchant-nav-storefront']",
        },
        {
          title: "Support",
          body: "Tap support anytime for help. Ask the AI, or request a human agent if needed.",
          selector: "[data-tour='support-fab']",
        },
      ];
    }

    return [
      {
        title: "Dashboard",
        body: "Your home base for active deliveries, availability, and today’s activity.",
        selector: "[data-tour='driver-nav-dashboard']",
      },
      {
        title: "Settlements",
        body: "See your payouts and earnings details in one place.",
        selector: "[data-tour='driver-nav-earnings']",
      },
      {
        title: "Reputation",
        body: "Track ratings and feedback to keep your standing strong.",
        selector: "[data-tour='driver-nav-ratings']",
      },
      {
        title: "Profile",
        body: "Update account details and preferences here.",
        selector: "[data-tour='driver-nav-account']",
      },
      {
        title: "Support",
        body: "Need help mid-route? Support is always one tap away.",
        selector: "[data-tour='support-fab']",
      },
    ];
  }, [portal]);

  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  const markDoneAndClose = () => {
    try {
      localStorage.setItem(storageKey, "done");
    } catch { }
    setIsOpen(false);
  };

  const openFromEvent = () => {
    setStepIndex(0);
    setIsOpen(true);
  };

  useEffect(() => {
    try {
      const alreadyDone = localStorage.getItem(storageKey) === "done";
      if (!alreadyDone) {
        const t = window.setTimeout(() => setIsOpen(true), 550);
        return () => window.clearTimeout(t);
      }
    } catch { }
    return;
  }, [storageKey]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ portal?: PortalType }>).detail;
      if (!detail?.portal || detail.portal === portal) {
        openFromEvent();
      }
    };

    window.addEventListener(TOUR_OPEN_EVENT, handler as EventListener);
    return () => window.removeEventListener(TOUR_OPEN_EVENT, handler as EventListener);
  }, [portal]);

  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      const target = safeQuerySelector(currentStep?.selector);
      if (!target) {
        setSpotlightRect(null);
        return;
      }

      try {
        target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      } catch { }

      setSpotlightRect(computeSpotlightRect(target));
    };

    update();

    const onResize = () => update();
    const onScroll = () => update();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [currentStep?.selector, isOpen]);

  if (!isOpen) return null;

  const isLast = stepIndex >= steps.length - 1;
  const stepNumber = Math.min(stepIndex + 1, steps.length);
  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 768 : window.innerHeight;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10001]"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes tsTourFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes tsTourPulse { 0%,100% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.02); opacity: 1; } }
          `,
        }}
      />

      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" onClick={markDoneAndClose} />

      {spotlightRect && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: Math.max(8, spotlightRect.left),
            top: Math.max(8, spotlightRect.top),
            width: Math.min(viewportWidth - 16, spotlightRect.width),
            height: Math.min(viewportHeight - 16, spotlightRect.height),
            borderRadius: 14,
            boxShadow: "0 0 0 9999px rgba(0,0,0,.72)",
            border: "1px solid rgba(232,162,48,.65)",
            background: "rgba(232,162,48,.06)",
            animation: "tsTourPulse 1.9s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        className="fixed bottom-5 left-1/2 w-[min(560px,calc(100%-24px))] -translate-x-1/2 rounded-[22px] border border-white/10 bg-[#0a0a0b]/95 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        style={{ animation: "tsTourFadeIn .22s ease-out" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
              Tutorial {stepNumber} / {steps.length}
            </div>
            <div className="mt-2 text-[20px] font-black tracking-tight text-white">
              {currentStep?.title}
            </div>
            <div className="mt-1 text-[13px] font-semibold leading-relaxed text-white/70">
              {currentStep?.body}
            </div>
          </div>
          <button
            type="button"
            onClick={markDoneAndClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/70 hover:bg-white/10 hover:text-white"
          >
            Skip
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70 disabled:opacity-30"
          >
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markDoneAndClose}
              className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/65 hover:bg-white/5 hover:text-white"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => (isLast ? markDoneAndClose() : setStepIndex((i) => Math.min(steps.length - 1, i + 1)))}
              className="rounded-full border border-[#e8a230]/35 bg-[#e8a230]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#e8a230] hover:bg-[#e8a230]/15"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
