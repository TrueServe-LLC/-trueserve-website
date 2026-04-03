"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { loginAsDemoDriver } from "@/app/auth/actions";
import Link from "next/link";

export default function DriverLoginForm() {
    const supabase = createClient();
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

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
            if (formattedPhone === "+15550001234") {
                setPhone(formattedPhone);
                setStep("otp");
                setMessage({ text: "Demo Mode: Verification code is 123456", error: false });
                setIsLoading(false);
                return;
            }

            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
                options: { shouldCreateUser: false }
            });

            if (error) {
                if (error.message.includes("Signups not allowed")) {
                    throw new Error("This phone number is not registered to an approved driver.");
                }
                throw error;
            }

            setPhone(formattedPhone);
            setStep("otp");
            setMessage({ text: "Code sent successfully via text!", error: false });
        } catch (err: any) {
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
                router.push("/driver/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            setMessage({ text: "Invalid or expired code. Please request a new one.", error: true });
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative z-10 w-full overflow-hidden">
            {message && (
                <div className={`p-4 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 border ${
                    message.error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#E8A020]/10 border-[#E8A020]/20 text-[#E8A020]'
                }`}>
                    {message.text}
                </div>
            )}

            {step === "phone" ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <div className="space-y-3.5">
                        <label className="text-[11px] font-bold text-[#5A5550] uppercase tracking-[0.2em] ml-0.5">Mobile Identification</label>
                        <div className="flex gap-[1px] bg-[#121212] border border-white/5 rounded-md overflow-hidden p-0.5">
                            <div className="px-4 flex items-center text-[#5A5550] text-[13px] font-bold bg-[#0D0D0D] border-r border-white/5">🇺🇸 +1</div>
                            <input 
                                type="tel"
                                required
                                placeholder="555 000 0000"
                                className="flex-1 bg-[#0D0D0D] px-6 py-4 text-[15px] font-medium text-white outline-none placeholder:text-[#222]"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="w-full bg-[#E8A020] hover:brightness-110 disabled:opacity-40 text-black font-bold uppercase tracking-[0.14em] text-[13px] h-[58px] rounded-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isLoading ? "UPLINKING..." : "REQUEST ACCESS CODE →"}
                    </button>
                    
                    <div className="flex items-center gap-4 py-3">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#222] whitespace-nowrap">PILOT ROLLOUT ACCESS</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div className="space-y-3">
                        <button 
                            type="button"
                            onClick={() => loginAsDemoDriver()}
                            className="w-full bg-transparent border border-white/5 hover:border-[#E8A020]/40 text-[#E8A020] font-bold uppercase tracking-[0.12em] text-[12px] h-[52px] rounded-md transition-all flex items-center justify-center gap-2"
                        >
                            ⚡ QUICK PILOT ACCESS (DRIVER)
                        </button>

                        <Link 
                            href="/driver/apply"
                            className="w-full bg-transparent border border-white/5 hover:border-white/20 text-[#F0EDE8]/30 hover:text-[#F0EDE8]/60 font-bold uppercase tracking-[0.12em] text-[12px] h-[52px] rounded-md transition-all flex items-center justify-center"
                        >
                            NEW TO THE FLEET? APPLY TO DRIVE
                        </Link>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="space-y-3.5 text-center">
                        <p className="text-[11px] text-[#5A5550] font-bold uppercase tracking-widest mb-1.5">Verification code sent to <span className="text-[#E8A020]">{phone}</span></p>
                        <input 
                            type="text"
                            maxLength={6}
                            placeholder="••••••"
                            className="w-full bg-[#0D0D0D] border border-white/5 rounded-md px-6 py-5 text-2xl font-bold tracking-[1em] text-center text-[#E8A020] outline-none placeholder:text-[#111]"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                            disabled={isLoading}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || token.length < 6}
                        className="w-full bg-[#E8A020] hover:brightness-110 disabled:opacity-40 text-black font-bold uppercase tracking-[0.14em] text-[13px] h-[58px] rounded-md transition-all flex items-center justify-center"
                    >
                        {isLoading ? "AUTHORIZING..." : "AUTHORIZE TERMINAL ✓"}
                    </button>

                    <button 
                        type="button"
                        onClick={() => { setStep("phone"); setMessage(null); }}
                        className="w-full text-[10px] font-bold text-[#5A5550] uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Cancel and try again
                    </button>
                </form>
            )}
        </div>
    );
}
