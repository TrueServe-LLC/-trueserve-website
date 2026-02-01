"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPassword, signupWithPassword, resetPassword } from "../auth/actions";

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
            res = await loginWithPassword(data);
            if (res.success) router.push("/restaurants");
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
