"use client";

type PortalType = "MERCHANT" | "DRIVER";

export default function PortalTourButton({
  portal,
  className = "",
}: {
  portal: PortalType;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          window.dispatchEvent(new CustomEvent("ts:portal-tour:open", { detail: { portal } }));
        } catch { }
      }}
      className={
        className ||
        "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/70 hover:bg-white/10 hover:text-white"
      }
    >
      Tutorial
    </button>
  );
}

