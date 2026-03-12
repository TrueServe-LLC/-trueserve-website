"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { loginAsDemoDriver } from "@/app/auth/actions";

export default function DriverLoginForm() {
    const supabase = createClient();
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

    // Format phone cleanly (+13365551234)
    const formatPhone = (val: string) => {
        let digits = val.replace(/\D/g, "");
        if (digits.length > 0 && !digits.startsWith("1")) {
            digits = "1" + digits;
        }
        return `+${digits}`;
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        const formattedPhone = formatPhone(phone);

        if (formattedPhone.length < 11) {
            setMessage({ text: "Please enter a valid US phone number.", error: true });
            setIsLoading(false);
            return;
        }

        try {
            // Check if phone number is attached to an approved Driver
            // We use standard user RPC to ensure they exist safely without exposing Admin keys
            const { data: { user }, error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
                options: {
                    shouldCreateUser: false // Disallow random people from creating accounts this way
                }
            });

            if (error) {
                // Supabase returns error if shouldCreateUser is false and user doesn't exist
                if (error.message.includes("Signups not allowed")) {
                    throw new Error("This phone number is not registered to an approved driver.");
                }
                throw error;
            }

            setPhone(formattedPhone);
            setStep("otp");
            setMessage({ text: "Code sent successfully via text!", error: false });
        } catch (err: any) {
            console.error("OTP Send Error:", err);
            setMessage({ text: err.message || "Failed to send code.", error: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (token.length < 6) {
            setMessage({ text: "Code must be 6 digits.", error: true });
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: phone,
                token: token,
                type: 'sms'
            });

            if (error) throw error;

            if (data?.session) {
                // Success! The session is saved globally via Supabase client.
                router.push("/driver/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            console.error("OTP Verify Error:", err);
            setMessage({ text: "Invalid or expired code. Please request a new one.", error: true });
            setIsLoading(false); // only reset loading on failure
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative z-10 w-full">
            {message && (
                <div className={`p-3 text-xs md:text-sm font-bold rounded-xl text-center border ${message.error ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                    {message.text}
                </div>
            )}

            {step === "phone" ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block pl-2">
                            Mobile Number
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📱</span>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pr-4 focus:bg-slate-950 focus:border-primary outline-none transition-all placeholder:text-slate-600 font-mono tracking-wider"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="(336) 555-0100"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="w-full bg-primary/20 border border-primary/50 text-primary py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] disabled:opacity-50 mt-2 hover:bg-primary hover:text-white transition-all shadow-[0_0_15px_rgba(241,161,55,0.1)] active:scale-95"
                    >
                        {isLoading ? "Sending text..." : "Send Login Code"}
                    </button>
                    <p className="text-[10px] text-center text-slate-500 leading-relaxed max-w-[250px] mx-auto opacity-70">
                        By continuing, you consent to receive automated authentication text messages from TrueServe.
                    </p>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                            <span className="bg-[#080c14] px-4 text-slate-600">Development Only</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            setIsLoading(true);
                            await loginAsDemoDriver();
                            router.push("/driver/dashboard");
                            router.refresh();
                        }}
                        className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all active:scale-95"
                    >
                        Try Demo Dashboard
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4 animate-slide-up">
                    <div className="mb-2 text-center">
                        <p className="text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            Sent to <span className="text-slate-200 font-mono">{phone}</span>
                        </p>
                        <button
                            type="button"
                            onClick={() => { setStep("phone"); setToken(""); setMessage(null); }}
                            className="text-[10px] font-bold text-primary hover:underline mt-1 uppercase tracking-widest"
                        >
                            Change Number
                        </button>
                    </div>

                    <div>
                        <label className="text-[10px] text-center uppercase tracking-widest text-slate-500 font-bold mb-2 block">
                            6-Digit Code
                        </label>
                        <div className="flex justify-center">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={6}
                                required
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-[200px] text-center bg-slate-950/50 border border-white/10 rounded-2xl py-4 text-3xl font-black focus:bg-slate-950 focus:border-primary outline-none transition-all tracking-[0.5em] text-white shadow-inner"
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || token.length < 6}
                        className="w-full bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(241,161,55,0.2)] mt-6"
                    >
                        {isLoading ? "Verifying..." : "Verify & Login"}
                    </button>
                </form>
            )}
        </div>
    );
}
