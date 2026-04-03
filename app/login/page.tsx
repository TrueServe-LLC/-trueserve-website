"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPassword, signupWithPassword, resetPassword, getAuthSession, loginAsPilot } from "../auth/actions";
import { createClient } from "@/lib/supabase/client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#080c14] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <LoginWithParams />
        </Suspense>
    );
}

function LoginWithParams() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/restaurants";
    const isPlus = searchParams.get("plus") === "true";
    const isPremium = searchParams.get("premium") === "true";
    const requestedPlan = isPremium ? 'Premium' : isPlus ? 'Plus' : 'Basic';

    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(isPlus || isPremium ? 'signup' : 'login');
    const [formData, setFormData] = useState({ email: '', password: '', name: '', address: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const isPreview = document.cookie.includes("preview_mode=true");
            if (isPreview) {
                router.push("/driver/dashboard");
                return;
            }

            const session = await getAuthSession();

            if (session.isAuth) {
                let dest = redirectUrl;
                if (session.role === 'MERCHANT') dest = "/merchant/dashboard";
                else if (session.role === 'DRIVER') dest = "/driver/dashboard";
                else if (session.role === 'ADMIN') dest = "/admin/dashboard";
                router.push(dest);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { syncUserSession } = await import("../auth/actions");
                    const res = await syncUserSession();
                    if (res.success) {
                        router.refresh();
                    } else {
                        await supabase.auth.signOut();
                    }
                }
            }
        };
        checkUser();
    }, [router, supabase, redirectUrl]);

    const handleSubmit = async () => {
        setIsLoading(true);
        setMessage(null);

        const data = new FormData();
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("name", formData.name);
        data.append("address", formData.address);
        data.append("plan", requestedPlan);

        let res;
        if (mode === 'login') {
            const res = await loginWithPassword(data);
            if (res.success) {
                if (res.role === 'MERCHANT') router.push("/merchant/dashboard");
                else if (res.role === 'DRIVER') router.push("/driver/dashboard");
                else if (res.role === 'ADMIN') router.push("/admin/dashboard");
                else router.push(redirectUrl);
            } else {
                setMessage({ text: res.message, type: 'error' });
            }
        } else if (mode === 'signup') {
            res = await signupWithPassword(data);
            if (res.success) {
                router.push(redirectUrl);
            }
        } else if (mode === 'reset') {
            res = await resetPassword(data);
        }

        if (res && !res.success) {
            setMessage({ text: res.message, type: 'error' });
        } else if (res && res.success) {
            setMessage({ text: res.message, type: 'success' });
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#080c14] px-4 py-8 md:py-0">
             {/* Background Layer with heavy blur */}
             <div className="absolute inset-0 z-0">
                <img 
                    src="/admin_login_bg_cinematic_1774378543203.png" 
                    alt="Background" 
                    className="w-full h-full object-cover grayscale opacity-20 scale-105"
                />
                <div className="absolute inset-0 bg-[#080c14]/90 backdrop-blur-[120px]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5" />
            </div>

            <div className="relative z-10 w-full max-w-md p-1 px-1 bg-gradient-to-b from-white/10 to-transparent rounded-[2.5rem] shadow-2xl">
                <div className="bg-[#0a0a0b]/90 backdrop-blur-3xl rounded-[2.3rem] p-10 md:p-12 border border-white/5 space-y-8">
                    <div className="text-center space-y-4">
                        <Logo size="lg" orientation="vertical" />
                        <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                            {mode === 'login' && "Sign in to your account"}
                            {mode === 'signup' && (
                                <div className="flex flex-col items-center">
                                    <span>Create Account</span>
                                    {(isPlus || isPremium) && (
                                        <span className={`mt-2 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${isPremium ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                            {requestedPlan} Membership
                                        </span>
                                    )}
                                </div>
                            )}
                            {mode === 'reset' && "Reset Password"}
                        </h2>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center animate-shake ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-4">
                        {mode === 'signup' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 transition-all text-white font-medium text-sm"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Delivery Address</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 transition-all text-white font-medium text-sm"
                                        placeholder="123 Main St, Charlotte, NC"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 transition-all text-white font-medium text-sm"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        {mode !== 'reset' && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 transition-all text-white font-medium text-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !formData.email || (mode !== 'reset' && !formData.password)}
                            className="w-full badge-solid-primary !py-5 !text-[11px] uppercase tracking-widest shadow-xl disabled:opacity-50 mt-4 active:scale-95 transition-all font-black"
                        >
                            {isLoading ? "Processing..." : (mode === 'login' ? "Login" : mode === 'signup' ? "Create Account" : "Send Reset Link")}
                        </button>

                        {/* --- EXCLUSIVE PILOT TESTING BYPASS --- */}
                        <div className="pt-2">
                            <form action={loginAsPilot}>
                                <button
                                    type="submit"
                                    className="w-full bg-[#131720] border border-[#e8a230]/30 hover:border-[#e8a230]/60 text-[#e8a230] text-[9px] font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-xl active:scale-95"
                                >
                                    ⚡ Quick Pilot Access (East Coast)
                                </button>
                            </form>
                        </div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                                <span className="bg-[#0a0a0b] px-4 text-slate-600">Universal Login</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    setIsLoading(true);
                                    const supabase = createClient();
                                    await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: { redirectTo: `${window.location.origin}/auth/callback` }
                                    });
                                } catch (err: any) {
                                    setMessage({ text: "Failed to start Google login.", type: 'error' });
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl hover:bg-slate-200 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google Access
                        </button>

                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mt-8 pt-4 border-t border-white/5">
                            {mode === 'login' && (
                                <>
                                    <button onClick={() => setMode('signup')} className="hover:text-primary transition-colors">Join</button>
                                    <button onClick={() => setMode('reset')} className="hover:text-primary transition-colors">Lost Key</button>
                                </>
                            )}
                            {mode !== 'login' && (
                                <button onClick={() => setMode('login')} className="hover:text-primary transition-colors w-full text-center">Identity Terminal</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
