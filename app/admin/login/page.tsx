"use client";

import { useState } from "react";
import Link from "next/link";
import { login, resetAdminPassword } from "./actions";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");
    const [isResetMode, setIsResetMode] = useState(false);

    const handleLogin = async (formData: FormData) => {
        setError(""); setMsg("");
        if (isResetMode) {
            const res = await resetAdminPassword(formData);
            if (res.error) setError(res.error);
            else setMsg("Password reset email sent! Please check your inbox.");
            return;
        }

        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/admin/dashboard`,
                    queryParams: {
                        access_type: 'offline',
                    },
                },
            });

            if (error) {
                setError(error.message);
            }
        } catch (err: any) {
            setError("Failed to start Google login.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="card w-full max-w-md p-8 animate-fade-in shadow-2xl border-slate-700/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
                    <p className="text-slate-400">Secure Access Only</p>
                </div>

                <form action={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email address"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-white"
                            required
                        />
                    </div>
                    {!isResetMode && (
                        <>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-white"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={() => setIsResetMode(true)} className="text-xs text-primary hover:underline">
                                Forgot password?
                            </button>
                        </div>
                        </>
                    )}

                    {error && (
                        <p className="text-red-400 text-sm text-center font-bold bg-red-500/10 py-2 rounded">
                            {error}
                        </p>
                    )}
                    {msg && (
                        <p className="text-emerald-400 text-sm text-center font-bold bg-emerald-500/10 py-2 rounded">
                            {msg}
                        </p>
                    )}

                    <button type="submit" className="w-full btn btn-primary py-3">
                        {isResetMode ? "Send Reset Link" : "Sign In"}
                    </button>

                    {isResetMode && (
                        <div className="text-center mt-4">
                            <button type="button" onClick={() => setIsResetMode(false)} className="text-xs text-slate-500 hover:text-white">
                                Back to login
                            </button>
                        </div>
                    )}
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-slate-500">Or</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors">
                        Return to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
