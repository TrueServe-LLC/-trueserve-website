import { Suspense } from "react";
import DriverLoginForm from "./DriverLoginForm";

export default function DriverLoginPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 inset-x-0 h-1bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-[2px]"></div>

                <div className="text-center mb-8 relative z-10">
                    <h1 className="text-3xl font-black mb-1">
                        Driver <span className="text-primary">Login</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        Enter your phone number to receive a secure login code.
                    </p>
                </div>

                <Suspense fallback={<div className="text-center text-slate-500 text-sm">Loading secure connection...</div>}>
                    <DriverLoginForm />
                </Suspense>

            </div>
            <div className="mt-8 text-center text-xs text-slate-500 font-medium">
                Not a driver yet? <a href="/driver" className="text-primary hover:text-white transition-colors underline underline-offset-2">Apply to drive</a>
            </div>
        </div>
    );
}
