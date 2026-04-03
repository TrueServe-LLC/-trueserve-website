"use client";

import { useEffect } from "react";
import Link from "next/link";
import MerchantSignupForm from "./MerchantSignupForm";

export default function MerchantSignupPage() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-[#02040a] text-white selection:bg-primary font-sans relative flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: all 1s ease-out; }
                .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
            ` }} />
            {/* Animated Mesh Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-blob filter" />
                <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[120px] animate-blob-reverse filter delay-700" />
                <div className="absolute bottom-[-10%] left-[20%] w-[55%] h-[55%] bg-emerald-500/10 rounded-full blur-[120px] animate-blob-slow filter" />
                <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-blob filter delay-1000" />
                <div className="absolute inset-0 bg-[#02040a]/40 backdrop-blur-[20px]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Minimal Header */}
            <div className="w-full max-w-7xl flex justify-between items-center mb-12 px-6 relative z-10">
                <Link href="/merchant" className="flex items-center gap-3 group transition-all">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl border border-white/10 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-black text-slate-300 tracking-tighter italic uppercase group-hover:text-white transition-colors">TrueServe <span className="text-primary not-italic">Hub</span></span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/merchant/login" className="text-[10px] font-black text-primary uppercase tracking-widest italic hover:text-white transition-colors">
                        Already have an account? Login
                    </Link>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
            </div>

            <main className="w-full max-w-7xl mx-auto pb-40 relative z-10 animate-on-scroll">
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
