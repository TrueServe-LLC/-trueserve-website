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
        "ts-pill-btn ts-pill-btn-sm"
      }
    >
      Tutorial
    </button>
  );
}
