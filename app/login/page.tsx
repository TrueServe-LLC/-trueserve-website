"use client";

import { useState } from "react";
import { login } from "../auth/actions";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        await login(email);
        // Action handles redirect
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="card w-full max-w-md p-8 animate-fade-in">
                <h1 className="text-3xl font-bold text-center mb-6">
                    True<span className="text-gradient">Serve</span> Login
                </h1>
                <p className="text-slate-400 text-center mb-8">Enter your email to access your account or create a new one.</p>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 focus:border-primary outline-none transition-colors"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!email || isLoading}
                        className="w-full btn btn-primary py-3 font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isLoading ? "Signing In..." : "Continue with Email"}
                    </button>

                    <div className="border-t border-white/10 pt-4 mt-6 text-center text-xs text-slate-600">
                        By continuing, you agree to our Terms of Service.
                    </div>
                </div>
            </div>
        </div>
    );
}
