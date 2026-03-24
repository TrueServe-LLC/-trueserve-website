export const dynamic = "force-dynamic";

import Link from "next/link";
import MerchantSignupForm from "./MerchantSignupForm";

export default function MerchantSignupPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary font-sans">
            {/* Split Layout Landing */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2400&auto=format&fit=crop" 
                    alt="Premium Restaurant Interior" 
                    className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <Link href="/merchant" className="mb-8 w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-primary transition-all text-primary shadow-2xl backdrop-blur-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </Link>
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 mb-6 backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Partner Marketplace Protocols</p>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">
                        Merchant <span className="text-primary italic">Onboarding.</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-lg font-medium max-w-2xl italic">
                        Join an elite logistics network designed to prioritize local margins and high-velocity synchronizations.
                    </p>
                </div>
            </div>

            <main className="container py-24 md:py-32 px-4 md:px-8 pb-40 relative z-10 -mt-20">
                <div className="max-w-5xl mx-auto">
                    <MerchantSignupForm />
                </div>
            </main>

            <footer className="py-24 bg-black border-t border-white/5">
                <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 border border-white/10 rounded-full shadow-xl" />
                        <span className="font-black text-slate-500 tracking-tighter text-2xl italic uppercase">TrueServe Network &copy; {new Date().getFullYear()}</span>
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
