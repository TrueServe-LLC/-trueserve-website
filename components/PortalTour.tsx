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
  const forceTour = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("tour") === "1";
    } catch {
      return false;
    }
  }, []);

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
          body: "Connect Toast POS and payment tools here. This is where your operational setup lives.",
          selector: "[data-tour='merchant-nav-integrations']",
        },
        {
          title: "Storefront",
          body: "Manage your banner, embed, and customer-facing storefront preview here.",
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
    if (forceTour) {
      const t = window.setTimeout(() => setIsOpen(true), 300);
      return () => window.clearTimeout(t);
    }

    try {
      const alreadyDone = localStorage.getItem(storageKey) === "done";
      if (!alreadyDone) {
        const t = window.setTimeout(() => setIsOpen(true), 550);
        return () => window.clearTimeout(t);
      }
    } catch { }
    return;
  }, [forceTour, storageKey]);

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
        const isMobile = window.innerWidth < 640;
        target.scrollIntoView({
          behavior: isMobile ? "auto" : "smooth",
          block: isMobile ? "nearest" : "center",
          inline: "center",
        });
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
  const isMobileViewport = viewportWidth < 640;

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

      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" onClick={markDoneAndClose} />

      {spotlightRect && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: Math.max(isMobileViewport ? 6 : 8, spotlightRect.left),
            top: Math.max(isMobileViewport ? 6 : 8, spotlightRect.top),
            width: Math.min(viewportWidth - (isMobileViewport ? 12 : 16), spotlightRect.width),
            height: Math.min(viewportHeight - (isMobileViewport ? 12 : 16), spotlightRect.height),
            borderRadius: isMobileViewport ? 12 : 14,
            boxShadow: `0 0 0 9999px rgba(0,0,0,${isMobileViewport ? 0.28 : 0.34})`,
            border: "1px solid rgba(232,162,48,.65)",
            background: "rgba(232,162,48,.06)",
            animation: "tsTourPulse 1.9s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        className="fixed left-1/2 w-[calc(100%-12px)] -translate-x-1/2 rounded-[18px] border border-white/10 bg-[#0a0a0b]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:bottom-5 sm:w-[min(560px,calc(100%-24px))] sm:rounded-[22px] sm:p-5 sm:shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        style={{
          animation: "tsTourFadeIn .22s ease-out",
          bottom: isMobileViewport ? "max(12px, env(safe-area-inset-bottom))" : "20px",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55 sm:text-[11px] sm:tracking-[0.16em]">
              Tutorial {stepNumber} / {steps.length}
            </div>
            <div className="mt-2 text-[20px] font-black tracking-tight text-white sm:text-[22px]">
              {currentStep?.title}
            </div>
            <div className="mt-1 text-[13px] font-semibold leading-relaxed text-white/80 sm:text-[14px]">
              {currentStep?.body}
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold leading-relaxed text-white/70">
              Direction: follow the gold highlight, then tap <span className="text-[#e8a230] font-black">Next</span>.
            </div>
          </div>
          <button
            type="button"
            onClick={markDoneAndClose}
            className="ts-pill-btn ts-pill-btn-sm shrink-0"
          >
            Skip
          </button>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          {steps.map((_, index) => (
            <span
              key={`${portal}-dot-${index}`}
              className={`h-1.5 rounded-full transition-all ${index === stepIndex ? "w-6 bg-[#e8a230]" : "w-3 bg-white/20"}`}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="ts-pill-btn ts-pill-btn-sm w-full disabled:opacity-30 sm:w-auto"
          >
            Back
          </button>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <button
              type="button"
              onClick={markDoneAndClose}
              className="ts-pill-btn ts-pill-btn-sm"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => (isLast ? markDoneAndClose() : setStepIndex((i) => Math.min(steps.length - 1, i + 1)))}
              className="ts-pill-btn ts-pill-btn-sm"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
