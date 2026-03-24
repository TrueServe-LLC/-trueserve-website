import { Suspense } from "react";
import Link from "next/link";
import DriverLoginForm from "./DriverLoginForm";

export default function DriverLoginPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#080c14]">
            {/* Background Layer with heavy blur */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="/admin_login_bg_cinematic_1774378543203.png" 
                    alt="Background" 
                    className="w-full h-full object-cover grayscale opacity-20 scale-105"
                />
                <div className="absolute inset-0 bg-[#080c14]/90 backdrop-blur-[120px]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5" />
            </div>

            <div className="relative z-10 w-full max-w-md p-1 px-1 bg-gradient-to-b from-white/10 to-transparent rounded-[2.5rem] shadow-2xl">
                <div className="bg-[#0a0a0b]/90 backdrop-blur-3xl rounded-[2.4rem] p-10 md:p-12 border border-white/5 space-y-10">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center mb-6">
                            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl border border-primary/20 shadow-lg" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold italic text-white tracking-tight">
                            True<span className="text-primary not-italic font-sans uppercase tracking-widest text-xl ml-1">Serve</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Fleet Authorization Terminal</p>
                    </div>

                    <Suspense fallback={<div className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Establishing Secure Uplink...</div>}>
                        <DriverLoginForm />
                    </Suspense>

                    <div className="text-center pt-8 border-t border-white/5">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">New to the Fleet?</p>
                        <Link href="/driver" className="badge-outline-white !py-3 !px-8 !text-[10px] uppercase tracking-widest">
                            Apply to Drive
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
