"use client";

import Link from "next/link";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-8 p-4 bg-red-500/10 rounded-full">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-3xl font-black mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-slate-400 mb-8 max-w-md">
                We encountered an unexpected error. This usually happens when a component fails to load properly.
            </p>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-8 w-full max-w-lg text-left overflow-auto max-h-48">
                <p className="text-red-400 font-mono text-sm break-words">
                    {error.message || "Unknown error"}
                </p>
                {error.digest && (
                    <p className="text-slate-500 font-mono text-xs mt-2">
                        ID: {error.digest}
                    </p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="btn btn-primary px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs"
                >
                    Try Again
                </button>
                <Link
                    href="/restaurants"
                    className="btn bg-white/5 border border-white/10 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/10"
                >
                    Back to Feed
                </Link>
            </div>
        </div>
    );
}
