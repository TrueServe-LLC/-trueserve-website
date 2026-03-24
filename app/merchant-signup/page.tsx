export const dynamic = "force-dynamic";

import Link from "next/link";
import MerchantSignupForm from "./MerchantSignupForm";

export default function MerchantSignupPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary font-sans">
            <main className="container py-12 md:py-24 px-4 md:px-8 pb-40 font-sans">
                {/* Replit-Style Breadcrumb Header */}
                <div className="mb-16 flex flex-col md:flex-row md:items-center gap-6 max-w-4xl mx-auto">
                    <Link href="/merchant" className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-primary transition-all text-primary shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl">🏬</div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                Merchant Onboarding
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest mt-1">
                                Partner with the TrueServe Network
                            </p>
                        </div>
                    </div>
                </div>

                <MerchantSignupForm />
            </main>

            <footer className="py-20 bg-black border-t border-white/5">
                <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 border border-white/10 rounded-full" />
                        <span className="font-black text-slate-500 tracking-tighter text-xl">TrueServe Network &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
                        <Link href="/restaurants" className="hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/driver" className="hover:text-white transition-colors">Fleet Link</Link>
                        <Link href="/merchant/dashboard" className="hover:text-primary transition-colors text-primary italic">Merchant Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
