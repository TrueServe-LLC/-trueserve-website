
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function UpdatePasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    useEffect(() => {
        // Handle PKCE Code Exchange if present
        const code = searchParams.get('code');
        if (code) {
            setLoading(true);
            const exchange = async () => {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                setLoading(false);
                if (error) {
                    setMessage({ text: "Invalid or expired reset link.", type: 'error' });
                }
            };
            exchange();
        }
    }, [searchParams]);

    const handleUpdate = async () => {
        if (!password) return;
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                setMessage({ text: error.message, type: 'error' });
            } else {
                setMessage({ text: "Password updated successfully! Redirecting...", type: 'success' });
                setTimeout(() => {
                    const params = new FormData();
                    // params.append('email', (supabase.auth.getUser() as any)?.email || ""); // Try to get email? 
                    // Actually, just redirect to login
                    router.push("/login");
                }, 2000);
            }
        } catch (e: any) {
            setMessage({ text: e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card w-full max-w-md p-8 animate-fade-in border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur">
            <h1 className="text-2xl font-bold text-center mb-6">Set New Password</h1>

            {message && (
                <div className={`p-3 rounded mb-4 text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-green-500/20 text-green-200 border border-green-500/30'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">New Password</label>
                    <input
                        type="password"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 focus:border-primary outline-none transition-colors"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleUpdate}
                    disabled={loading || !password}
                    className="w-full btn btn-primary py-3 font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </div>
        </div>
    );
}

export default function UpdatePasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <UpdatePasswordContent />
            </Suspense>
        </div>
    );
}
