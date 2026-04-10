import Link from "next/link";
import Logo from "@/components/Logo";
import PortalTour from "@/components/PortalTour";
import PortalTourPreviewAutoOpen from "@/components/PortalTourPreviewAutoOpen";

export default function DriverTutorialPreviewPage() {
  return (
    <div className="food-app-shell min-h-screen">
      <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
              Driver Tutorial Preview
            </span>
          </div>
          <Link
            href="/driver/login"
            className="inline-flex items-center justify-center rounded-[14px] bg-[#e8a230] px-4 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-black shadow-[0_8px_22px_rgba(232,162,48,0.35)] transition-all hover:brightness-105"
          >
            Back to Login
          </Link>
        </div>

        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] gap-2 overflow-x-auto pb-3">
          <button data-tour="driver-nav-dashboard" className="rounded-full border border-[#e8a230]/35 bg-[#e8a230]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#e8a230]">
            Dashboard
          </button>
          <button data-tour="driver-nav-earnings" className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            Settlements
          </button>
          <button data-tour="driver-nav-ratings" className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            Reputation
          </button>
          <button data-tour="driver-nav-account" className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            Profile
          </button>
        </div>
      </header>

      <main className="mx-auto w-[min(1240px,calc(100%-24px))] py-10">
        <section className="food-panel">
          <p className="food-kicker mb-3">Driver onboarding</p>
          <h1 className="food-heading !text-[36px]">Portal Tutorial Preview</h1>
          <p className="lead mt-2">
            This demo lets drivers preview the walkthrough and navigation tips before logging in.
          </p>
        </section>
      </main>

      <button
        type="button"
        data-tour="support-fab"
        className="fixed bottom-6 right-6 z-[9998] h-14 w-14 rounded-full border border-[#3dd68c]/40 bg-[#3dd68c] text-[11px] font-black uppercase tracking-[0.08em] text-black shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
      >
        Help
      </button>

      <PortalTourPreviewAutoOpen portal="DRIVER" />
      <PortalTour portal="DRIVER" />
    </div>
  );
}
