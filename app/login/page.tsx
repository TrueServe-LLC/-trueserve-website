"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function ProfileLoginPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8] font-barlow overflow-x-hidden">
            {/* AMBIENT ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="orb w-[260px] h-[260px] top-[-60px] right-[-80px] bg-[#E8A020]/10" />
                <div className="orb w-[200px] h-[200px] top-[480px] left-[-70px] bg-[#E8A020]/0.06" />
                <div className="orb w-[160px] h-[160px] bottom-[130px] right-[-50px] bg-[rgba(232,80,20,0.06)]" />
            </div>

            <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col z-10 bg-[#0A0A0A]/20">
                
                {/* ─── SHARED NAV ─── */}
                <nav className="sticky top-0 z-50 flex items-center justify-between px-[18px] py-[18px] bg-[#0A0A0A]/98 backdrop-blur-xl animate-dn">
                    <Logo size="sm" />
                </nav>

                <div className="profile-body px-[18px] py-[14px] flex-1 flex flex-col items-center justify-center animate-up relative z-10">
                    
                    <div className="signin-view flex flex-col items-center pt-10 pb-5 w-full">
                        <div className="signin-icon text-6xl mb-5">👤</div>
                        <h1 className="font-bebas text-[36px] text-white mb-2 text-center uppercase tracking-wider italic">Your Account</h1>
                        <p className="signin-sub text-[14px] font-light text-[#5A5550] text-center mb-9 max-w-[260px] leading-relaxed">
                            Sign in to track orders, save favorites, and manage your TrueServe experience.
                        </p>

                        <div className="w-full space-y-4">
                            <button className="btn-google w-full flex items-center justify-center gap-3 bg-[#F0EDE8] text-[#1A1A1A] font-medium text-[15px] px-6 py-3.5 rounded-xl transition-all active:scale-[0.97]">
                                <svg className="google-logo w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </button>

                            <div className="divider-or flex items-center gap-3.5 w-full">
                                <div className="dor-line flex-1 h-px bg-white/0.08" />
                                <span className="dor-text font-barlow-cond text-[11px] uppercase tracking-[0.2em] text-[#5A5550]">or</span>
                                <div className="dor-line flex-1 h-px bg-white/0.08" />
                            </div>

                            <Link href="/login-email" className="btn-email w-full flex items-center justify-center gap-3 bg-[#1C1C1C] text-[#F0EDE8] border border-white/0.08 font-medium text-[15px] px-6 py-3.5 rounded-xl transition-all active:scale-[0.97]">
                                ✉️ &nbsp;Continue with Email
                            </Link>

                            <p className="signin-terms text-[11px] text-[#5A5550] text-center mt-5 leading-relaxed">
                                By signing in you agree to our <Link href="/terms" className="text-[#E8A020] underline underline-offset-2">Terms of Service</Link> and <Link href="/privacy" className="text-[#E8A020] underline underline-offset-2">Privacy Policy</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── BOTTOM NAV ─── */}
                <nav className="sticky bottom-0 z-50 bg-[#0C0C0C]/97 backdrop-blur-2xl border-t border-white/5 flex justify-around px-2 pt-[11px] pb-[24px]">
                    <Link href="/" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">🏠</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Home</span>
                    </Link>
                    <Link href="/restaurants" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">🔍</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Explore</span>
                    </Link>
                    <Link href="/orders" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">📋</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Orders</span>
                    </Link>
                    <Link href="/user/settings" className="flex flex-col items-center gap-1 flex-1 text-[#E8A020]">
                        <span className="text-[21px]">👤</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Profile</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
