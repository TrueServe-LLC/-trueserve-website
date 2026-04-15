"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "./actions";
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
                window.location.href = "/admin/dashboard";
            }
        } catch (err: any) {
            console.error("[Admin Login] Error:", err);
            setError(err?.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
            {/* Background gradient accent */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-40 -mb-40" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12 text-center">
                        <div className="flex justify-center mb-4">
                            <Logo size="lg" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">Admin Portal</h1>
                        <p className="text-orange-100 text-sm">Staff Access Only</p>
                    </div>

                    {/* Form Container */}
                    <div className="px-8 py-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operator@trueserve.delivery"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 text-sm font-medium">⚠️ {error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition duration-200 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-8 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Need help?</span>
                            </div>
                        </div>

                        {/* Help Text */}
                        <div className="bg-orange-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600">
                                <strong>Contact Support:</strong> If you don't have login credentials, please contact your administrator.
                            </p>
                        </div>

                        {/* Footer Links */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition"
                            >
                                ← Return to Homepage
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom accent */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    TrueServe Admin Portal • Version 2.0
                </p>
            </div>
        </div>
    );
}
