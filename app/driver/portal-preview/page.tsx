import Link from "next/link";
import Logo from "@/components/Logo";

export default function DriverPortalMockPage() {
  return (
    <div className="food-app-shell min-h-screen">
      <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
              Driver Portal Mock
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/driver/tutorial-preview" className="rounded-full border border-[#e8a230]/35 bg-[#e8a230]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#e8a230] hover:bg-[#e8a230]/15">
              View Animated Tutorial
            </Link>
            <Link href="/driver/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/75 hover:bg-white/10 hover:text-white">
              Back to Login
            </Link>
          </div>
        </div>
        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] gap-2 overflow-x-auto pb-3">
          <span className="rounded-full border border-[#e8a230]/35 bg-[#e8a230]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#e8a230]">Dashboard</span>
          <span className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Settlements</span>
          <span className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Reputation</span>
          <span className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Profile</span>
        </div>
      </header>

      <main className="mx-auto grid w-[min(1240px,calc(100%-24px))] grid-cols-1 gap-4 py-8 md:grid-cols-3">
        <section className="food-panel md:col-span-2">
          <p className="food-kicker mb-2">Mockup</p>
          <h1 className="food-heading !text-[34px]">Driver Dashboard Preview</h1>
          <p className="lead mt-2">
            This is a static preview of the driver portal layout and navigation experience.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">Available Trips</div>
              <div className="mt-2 text-3xl font-black text-white">8</div>
              <div className="mt-1 text-xs text-white/60">Nearby order offers</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">Today</div>
              <div className="mt-2 text-3xl font-black text-[#e8a230]">$126</div>
              <div className="mt-1 text-xs text-white/60">Estimated earnings</div>
            </div>
          </div>
        </section>

        <aside className="food-panel">
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">Quick Actions</div>
          <div className="mt-3 grid gap-2">
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">Go Online</span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">Payout Setup</span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">Support</span>
          </div>
        </aside>
      </main>
    </div>
  );
}

