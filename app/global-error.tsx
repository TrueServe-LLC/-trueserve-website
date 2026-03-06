"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white font-sans antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-8 p-6 bg-red-500/10 rounded-full animate-pulse">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-4xl font-black mb-4 tracking-tighter">System Interruption</h1>
          <p className="text-slate-400 mb-10 max-w-lg text-lg leading-relaxed">
            A critical part of the application failed to load. We've logged this for our engineers.
          </p>

          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 mb-10 w-full max-w-2xl text-left overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Technical Details</span>
            </div>
            <p className="text-red-400 font-mono text-sm break-words line-clamp-4 leading-relaxed bg-black/40 p-4 rounded-xl border border-red-500/10">
              {error.message || "A client-side exception occurred."}
            </p>
            {error.digest && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Error Trace ID</span>
                <span className="text-xs text-slate-400 font-mono bg-white/5 px-3 py-1 rounded-full">{error.digest}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <button
              onClick={() => reset()}
              className="flex-1 bg-primary text-black h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_20px_40px_rgba(255,153,42,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Retry App
            </button>
            <Link
              href="/"
              className="flex-1 bg-white/5 border border-white/10 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              Return Home
            </Link>
          </div>

          <p className="mt-12 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
            TrueServe Global Infrastructure
          </p>
        </div>
      </body>
    </html>
  );
}
