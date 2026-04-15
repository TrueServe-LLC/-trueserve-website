"use client";

import { useState } from "react";
import Link from "next/link";
import { login, loginWithGoogle, loginAndRedirect } from "./actions";
import Logo from "@/components/Logo";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            console.log("[Admin Login] Submitting form with email:", email);
            const formData = new FormData();
            formData.set("email", email);
            formData.set("password", password);

            const result = await login(formData);
            console.log("[Admin Login] Result:", result);

            if (!result) {
                setError("Server error. Please try again.");
                return;
            }

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.success) {
                console.log("[Admin Login] Login successful, redirecting...");
                // Try server-side redirect first, fallback to client
                try {
                    await loginAndRedirect(formData);
                } catch {
                    window.location.href = "/admin/dashboard";
                }
            }
        } catch (err: any) {
            console.error("[Admin Login] Error:", err);
            setError(err?.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setIsLoading(true);

        try {
            console.log("[Admin Google] Starting OAuth...");
            const result = await loginWithGoogle();

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            if (result.url) {
                console.log("[Admin Google] Redirecting to OAuth provider...");
                window.location.href = result.url;
            }
        } catch (err: any) {
            console.error("[Admin Google] Error:", err);
            setError(err?.message || "An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c09] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-orange-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-40" />
                <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-orange-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-40" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card Container */}
                <div className="bg-[#0f1210] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-b border-white/10 px-8 py-12 text-center">
                        <div className="flex justify-center mb-4">
                            <Logo size="lg" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">Admin Portal</h1>
                        <p className="text-white/60 text-sm">Staff Access Only</p>
                    </div>

                    {/* Form Container */}
                    <div className="px-8 py-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-white/80 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operator@trueserve.delivery"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/[0.08] transition"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-white/80 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/[0.08] transition"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-white/10 disabled:to-white/10 text-white font-bold py-3 rounded-lg transition duration-200 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        {/* Google OAuth Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full mt-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-bold py-3 rounded-lg transition duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {isLoading ? "Signing in..." : "Sign in with Google"}
                        </button>

                        {/* Divider */}
                        <div className="my-8 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#0f1210] text-white/50">Need help?</span>
                            </div>
                        </div>

                        {/* Help Text */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                            <p className="text-sm text-white/70">
                                <strong className="text-white">Contact Support:</strong> If you don't have login credentials, please contact your administrator.
                            </p>
                        </div>

                        {/* Footer Links */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="text-sm text-orange-500 hover:text-orange-400 font-medium transition"
                            >
                                ← Return to Homepage
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom accent */}
                <p className="text-center text-white/40 text-xs mt-6">
                    TrueServe Admin Portal • Version 2.0
                </p>
            </div>
        </div>
    );
}
