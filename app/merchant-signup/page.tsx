export const dynamic = "force-dynamic";

import Link from "next/link";
import MerchantSignupForm from "./MerchantSignupForm";

export default function MerchantSignupPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary font-sans relative flex flex-col items-center justify-center p-4 md:p-8">
            {/* Minimal Header */}
            <div className="w-full max-w-7xl flex justify-between items-center mb-12 px-6">
                <Link href="/merchant" className="flex items-center gap-3 group transition-all">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl border border-white/10 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-black text-slate-300 tracking-tighter italic uppercase group-hover:text-white transition-colors">TrueServe <span className="text-primary not-italic">Hub</span></span>
                </Link>
                <div className="hidden md:flex items-center gap-6">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Terminal Access Authorized</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
            </div>

            <main className="w-full max-w-7xl mx-auto pb-40 relative z-10">
                <MerchantSignupForm />
            </main>

            {/* Subtle Footer */}
            <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-black uppercase text-slate-600 tracking-widest italic opacity-50">
                <div>TrueServe Merchant Network &copy; {new Date().getFullYear()}</div>
                <div className="flex gap-12">
                     <Link href="/" className="hover:text-white transition-colors">Back Home</Link>
                     <Link href="/merchant/login" className="hover:text-primary transition-colors text-primary">Login to Node</Link>
                </div>
            </footer>
        </div>
    );
}
