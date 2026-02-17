"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPassword, signupWithPassword, resetPassword } from "../auth/actions";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        setMessage(null);

        const data = new FormData();
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("name", formData.name);

        let res;
        if (mode === 'login') {
            const res = await loginWithPassword(data);
            if (res.success) {
                // Role-based Redirect
                if (res.role === 'MERCHANT') router.push("/merchant/dashboard");
                else if (res.role === 'DRIVER') router.push("/driver/dashboard"); // They usually have a deferred flow but if they log in, send them there.
                else if (res.role === 'ADMIN') router.push("/admin/dashboard");
                else router.push("/restaurants");
            } else {
                setMessage({ text: res.message, type: 'error' });
            }
        } else if (mode === 'signup') {
            res = await signupWithPassword(data);
            if (res.success) {
                // Optional: Auto login or just show message
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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="card w-full max-w-md p-8 animate-fade-in border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur">
                <h1 className="text-3xl font-bold text-center mb-2">
                    True<span className="text-gradient">Serve</span>
                </h1>
                <h2 className="text-xl font-semibold text-center mb-6 text-slate-300">
                    {mode === 'login' && "Welcome Back"}
                    {mode === 'signup' && "Create Account"}
                    {mode === 'reset' && "Reset Password"}
                </h2>

                {message && (
                    <div className={`p-3 rounded mb-4 text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-green-500/20 text-green-200 border border-green-500/30'}`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-4">
                    {mode === 'signup' && (
                        <div>
                            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 focus:border-primary outline-none transition-colors"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 focus:border-primary outline-none transition-colors"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {mode !== 'reset' && (
                        <div>
                            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 focus:border-primary outline-none transition-colors"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.email || (mode !== 'reset' && !formData.password)}
                        className="w-full btn btn-primary py-3 font-bold shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
                    >
                        {isLoading ? "Processing..." : (mode === 'login' ? "Sign In" : mode === 'signup' ? "Create Account" : "Send Reset Link")}
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
