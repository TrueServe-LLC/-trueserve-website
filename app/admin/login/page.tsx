"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function AdminLogin() {
    const [error, setError] = useState("");

    const handleLogin = async (formData: FormData) => {
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
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
                            defaultValue="admin@trueserve.com"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            name="password"
                            type="password"
                            defaultValue="admin"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-white"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center font-bold bg-red-500/10 py-2 rounded">
                            {error}
                        </p>
                    )}

                    <button type="submit" className="w-full btn btn-primary py-3">
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors">
                        Return to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
