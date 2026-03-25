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
            // BACKDOOR: Allow +15550001234 to skip real OTP send
            if (formattedPhone === "+15550001234") {
                setPhone(formattedPhone);
                setStep("otp");
                setMessage({ text: "Demo Mode: Verification code is 123456", error: false });
                setIsLoading(false);
                return;
            }

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
            // BACKDOOR: Verification for +15550001234
            if (phone === "+15550001234" && token === "123456") {
                window.location.href = "/auth/demo";
                return;
            }

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
                <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
                    message.error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
                }`}>
                    <span>{message.error ? '⚠️' : '✅'}</span>
                    {message.text}
                </div>
            )}

            {step === "phone" ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                        <div className="flex gap-2">
                            <div className="bg-[#1c1916] border border-white/5 rounded-2xl px-4 flex items-center text-slate-400 text-sm font-bold">🇺🇸 +1</div>
                            <input 
                                type="tel"
                                required
                                placeholder="555 000 0000"
                                className="flex-1 bg-[#1c1916] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-700"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-black font-black uppercase tracking-[0.3em] text-[11px] h-14 rounded-2xl italic shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                    >
                        {isLoading ? "Validating..." : "Request Access Code →"}
                    </button>
                    
                    <p className="text-[10px] text-center text-slate-600 leading-relaxed max-w-[280px] mx-auto opacity-70">
                        By continuing, you consent to receive automated authentication text messages from TrueServe.
                    </p>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6 animate-slide-up">
                    <div className="space-y-2 text-center">
                        <div className="mb-4">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sent to <span className="text-primary">{phone}</span></p>
                            <button 
                                type="button"
                                onClick={() => { setStep("phone"); setToken(""); setMessage(null); }}
                                className="text-[9px] font-black text-primary/60 hover:text-primary uppercase tracking-widest transition-colors mt-1"
                            >
                                Change Number
                            </button>
                        </div>
                        
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">6-Digit Activation Code</label>
                        <input 
                            type="text"
                            maxLength={6}
                            placeholder="••••••"
                            className="w-full bg-[#1c1916] border border-white/5 rounded-2xl px-6 py-5 text-2xl font-black tracking-[1em] text-center text-primary focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-800"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                            disabled={isLoading}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || token.length < 6}
                        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-black font-black uppercase tracking-[0.3em] text-[11px] h-14 rounded-2xl italic shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                    >
                        {isLoading ? "Activating..." : "Authorize Terminal ✓"}
                    </button>

                    <button 
                        type="button"
                        onClick={() => { setStep("phone"); setMessage(null); }}
                        className="w-full text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Wrong number? Try again
                    </button>
                </form>
            )}
        </div>
    );
}
