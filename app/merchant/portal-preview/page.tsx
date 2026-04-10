import Link from "next/link";
import Logo from "@/components/Logo";

export default function MerchantPortalMockPage() {
  return (
    <div className="food-app-shell min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes tsPosSweep {
              0% { transform: translateX(-140%); }
              100% { transform: translateX(260%); }
            }
            @keyframes tsGlowPulse {
              0%, 100% { opacity: .62; }
              50% { opacity: 1; }
            }
          `,
        }}
      />

      <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
              Merchant POS Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/merchant/tutorial-preview"
              className="inline-flex items-center justify-center rounded-[14px] bg-[#e8a230] px-4 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-black shadow-[0_8px_22px_rgba(232,162,48,0.35)] transition-all hover:brightness-105"
            >
              View Animated Tutorial
            </Link>
            <Link
              href="/merchant/login"
              className="inline-flex items-center justify-center rounded-[14px] bg-[#e8a230] px-4 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-black shadow-[0_8px_22px_rgba(232,162,48,0.35)] transition-all hover:brightness-105"
            >
              Back to Login
            </Link>
          </div>
        </div>
        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] gap-2 overflow-x-auto pb-3">
          <span className="rounded-full border border-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Dashboard</span>
          <span className="rounded-full border border-[#e8a230]/35 bg-[#e8a230]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#e8a230]">Integrations</span>
          <span className="rounded-full border border-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Storefront</span>
        </div>
      </header>

      <main className="mx-auto grid w-[min(1240px,calc(100%-24px))] grid-cols-1 gap-4 py-8 md:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <section className="food-panel">
          <p className="food-kicker mb-2">Merchant preview</p>
          <h1 className="food-heading !text-[34px]">How POS Connection Looks (Toast)</h1>
          <p className="lead mt-2">
            This mock shows the exact portal area where merchants connect Toast, validate credentials, and sync their menu.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/55">Connection Sequence</div>
              <ol className="mt-4 space-y-3">
                <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8a230]">Step 1</div>
                  <div className="mt-1 text-sm font-extrabold text-white">Choose POS Provider: Toast</div>
                  <div className="mt-1 text-xs text-white/65">Merchant selects Toast in Integrations and opens credentials panel.</div>
                </li>
                <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8a230]">Step 2</div>
                  <div className="mt-1 text-sm font-extrabold text-white">Enter API Credentials</div>
                  <div className="mt-1 text-xs text-white/65">Client ID, Client Secret, and location details are entered securely.</div>
                </li>
                <li className="rounded-xl border border-[#e8a230]/35 bg-[#e8a230]/10 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8a230]">Step 3</div>
                      <div className="mt-1 text-sm font-extrabold text-white">Run Connection Test</div>
                    </div>
                    <span
                      className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-200"
                      style={{ animation: "tsGlowPulse 1.6s ease-in-out infinite" }}
                    >
                      Checking
                    </span>
                  </div>
                  <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/12">
                    <span className="absolute inset-y-0 left-0 w-[45%] rounded-full bg-[#e8a230]/85" />
                    <span
                      className="absolute inset-y-0 left-0 w-[28%] rounded-full bg-white/90 opacity-75"
                      style={{ animation: "tsPosSweep 2s linear infinite" }}
                    />
                  </div>
                </li>
                <li className="rounded-xl border border-emerald-300/35 bg-emerald-300/10 px-3 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">Step 4</div>
                  <div className="mt-1 text-sm font-extrabold text-white">Connection Verified</div>
                  <div className="mt-1 text-xs text-white/70">Menu sync and order webhooks become available immediately.</div>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/55">Toast Credentials (Mock)</div>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Client ID</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">toast_client_live_******</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Client Secret</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">••••••••••••••••</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Toast Location</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">Downtown / POS-0042</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" className="inline-flex items-center justify-center rounded-[12px] border border-[#e8a230]/45 bg-[#e8a230]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#f0bd63]">
                  Test Connection
                </button>
                <button type="button" className="inline-flex items-center justify-center rounded-[12px] border border-white/15 bg-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/80">
                  Sync Menu
                </button>
              </div>
              <div className="mt-3 rounded-xl border border-emerald-300/35 bg-emerald-300/10 px-3 py-2 text-[11px] font-semibold text-emerald-100">
                Connected: Toast menu sync and order ingestion are active.
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/55">What This Preview Demonstrates</div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/75 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">Where Toast is selected inside Integrations.</div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">How credentials are entered and validated.</div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">How merchants confirm successful sync status.</div>
            </div>
          </div>
        </section>

        <aside className="food-panel">
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">Preview Controls</div>
          <div className="mt-3 grid gap-2">
            <Link
              href="/merchant/tutorial-preview"
              className="inline-flex items-center justify-center rounded-[14px] bg-[#e8a230] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black shadow-[0_8px_22px_rgba(232,162,48,0.35)] transition-all hover:brightness-105"
            >
              Watch Animated Tour
            </Link>
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">POS: Toast</span>
            <span className="rounded-xl border border-emerald-300/35 bg-emerald-300/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-200">Status: Connected</span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">Webhook Health: Good</span>
          </div>

          <div className="mt-4 rounded-2xl border border-white/12 bg-black/25 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">Note</div>
            <p className="mt-2 text-sm text-white/70">
              This is visual-only and does not save credentials. It mirrors the merchant integration workflow so teammates can review before launch.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
