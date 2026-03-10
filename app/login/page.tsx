"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPassword, signupWithPassword, resetPassword, getAuthSession } from "../auth/actions";
import { createClient } from "@/lib/supabase/client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
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
            const session = await getAuthSession();

            if (session.isAuth) {
                if (session.role === 'MERCHANT') router.push("/merchant/dashboard");
                else if (session.role === 'DRIVER') router.push("/driver/dashboard");
                else if (session.role === 'ADMIN') router.push("/admin/dashboard");
                else router.push(redirectUrl);
            } else {
                // If the user's cookie was lost/cleared but Supabase local storage remembers something,
                // we should firmly sign them out of the local cache so they don't get stuck finding food.
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.auth.signOut();
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
        data.append("plan", requestedPlan); // Passthrough the plan

        let res;
        if (mode === 'login') {
            const res = await loginWithPassword(data);
            if (res.success) {
                // Role-based Redirect (Override if it's a customer with a specific redirect URL)
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
                // After signup success, user is automatically logged in via cookie in server action
                // Redirect them to the requested page or default
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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8 md:py-0">
            <div className="w-full max-w-md md:p-8 animate-fade-in md:border md:border-white/10 md:shadow-2xl md:bg-slate-900/90 md:backdrop-blur md:rounded-[2rem]">
                <h1 className="text-4xl md:text-3xl font-black md:text-center mb-2">
                    True<span className="text-gradient">Serve</span>
                </h1>
                <h2 className="text-xl text-slate-400 font-bold md:text-center mb-10 text-slate-300 md:font-semibold">
                    {mode === 'login' && "Sign in to your account"}
                    {mode === 'signup' && (
                        <div className="flex flex-col items-center">
                            <span>Create Account</span>
                            {(isPlus || isPremium) && (
                                <span className={`mt-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isPremium ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-primary/10 text-primary border-primary/20'
                                    }`}>
                                    TrueServe {requestedPlan} Membership
                                </span>
                            )}
                        </div>
                    )}
                    {mode === 'reset' && "Reset Password"}
                </h2>

                {message && (
                    <div className={`p-3 rounded-2xl mb-6 text-sm text-center font-bold ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {message.text}
                        {message.text.includes("Email logins are disabled") && (
                            <div className="mt-2 text-xs opacity-80 font-medium">
                                Hint: Use an email ending in <span className="text-primary">.test</span> or <span className="text-primary">.live</span> for the demo bypass.
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    {mode === 'signup' && (
                        <>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Full Name</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pr-4 focus:bg-slate-800 focus:border-primary outline-none transition-all"
                                        style={{ paddingLeft: '3.5rem' }}
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Delivery Address</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pr-4 focus:bg-slate-800 focus:border-primary outline-none transition-all"
                                        style={{ paddingLeft: '3.5rem' }}
                                        placeholder="123 Main St, Charlotte, NC"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">✉️</span>
                            <input
                                type="email"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pr-4 focus:bg-slate-800 focus:border-primary outline-none transition-all"
                                style={{ paddingLeft: '3.5rem' }}
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {mode !== 'reset' && (
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Password</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                                <input
                                    type="password"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pr-4 focus:bg-slate-800 focus:border-primary outline-none transition-all"
                                    style={{ paddingLeft: '3.5rem' }}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.email || (mode !== 'reset' && !formData.password)}
                        className="w-full bg-secondary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_10px_20px_rgba(241,161,55,0.2)] disabled:opacity-50 mt-6 md:mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {isLoading ? "Processing..." : (mode === 'login' ? "Login" : mode === 'signup' ? "Create Account" : "Send Reset Link")}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                setIsLoading(true);
                                const supabase = createClient();
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                        queryParams: {
                                            access_type: 'offline',
                                            // Removing 'prompt: consent' as it often causes Google's GeneralOAuthFlow error
                                            // and forces users to re-authorize unnecessarily.
                                        },
                                    },
                                });

                                if (error) {
                                    setMessage({ text: error.message, type: 'error' });
                                    setIsLoading(false);
                                }
                            } catch (err: any) {
                                setMessage({ text: "Failed to start Google login.", type: 'error' });
                                setIsLoading(false);
                            }
                        }}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <div className="flex justify-between items-center text-xs text-slate-400 mt-6 pt-4 border-t border-white/5">
                        {mode === 'login' && (
                            <>
                                <button onClick={() => setMode('signup')} className="hover:text-white transition-colors">Create Account</button>
                                <button onClick={() => setMode('reset')} className="hover:text-white transition-colors">Forgot Password?</button>
                            </>
                        )}
                        {mode !== 'login' && (
                            <button onClick={() => setMode('login')} className="hover:text-white transition-colors w-full text-center">Back to Login</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
