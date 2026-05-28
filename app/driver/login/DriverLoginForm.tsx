"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const IS_DEV = process.env.NODE_ENV === "development";
const DEV_BYPASS_EMAIL = "driver@demo.test";
const DEV_BYPASS_PASSWORD = "password123";

export default function DriverLoginForm() {
    const supabase = createClient();
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

    const handleDevBypass = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: DEV_BYPASS_EMAIL,
                password: DEV_BYPASS_PASSWORD,
            });
            if (error) throw error;
            router.push("/driver/dashboard");
            router.refresh();
        } catch (err: any) {
            setMessage({ text: `Dev bypass failed: ${err.message}`, error: true });
        } finally {
            setIsLoading(false);
        }
    };

    const formatPhone = (val: string) => {
        let digits = val.replace(/\D/g, "");
        if (digits.length > 0 && !digits.startsWith("1")) {
            digits = "1" + digits;
        }
        return `+${digits}`;
    };

    const requestOtpForPhone = async (formattedPhone: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
            options: { shouldCreateUser: false }
        });

        if (error) {
            if (error.message.includes("Signups not allowed")) {
                throw new Error("This phone number is not registered to a driver application yet.");
            }
            throw error;
        }
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
            await requestOtpForPhone(formattedPhone);

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
            const { data, error } = await supabase.auth.verifyOtp({
                phone: phone,
                token: token,
                type: 'sms'
            });

            if (error) throw error;

            if (data?.session) {
                const forceTour =
                    typeof window !== "undefined" &&
                    new URLSearchParams(window.location.search).get("tour") === "1";
                router.push(forceTour ? "/driver/dashboard?tour=1" : "/driver/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            setMessage({ text: "Invalid or expired code. Please request a new one.", error: true });
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            await requestOtpForPhone(phone);
            setMessage({ text: "We sent a fresh code to your phone.", error: false });
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to resend code.", error: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ts-fig-driver-login-phone">
            {message && (
                <div className={`ts-fig-auth-banner ${message.error ? "is-error" : "is-success"}`} role={message.error ? "alert" : "status"}>
                    {message.text}
                </div>
            )}

            {step === "phone" ? (
                <form onSubmit={handleSendOTP} className="ts-fig-auth-fields">
                    <label className="ts-fig-auth-field">
                        <span>Mobile number</span>
                        <div className="ts-fig-driver-phone-field">
                            <div>US +1</div>
                            <input 
                                type="tel"
                                required
                                placeholder="555 000 0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isLoading}
                                autoComplete="tel"
                            />
                        </div>
                    </label>

                    <button 
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="ts-fig-btn ts-fig-auth-submit"
                    >
                        {isLoading ? "Sending code..." : "Text me a sign-in code →"}
                    </button>
                    
                    <div className="ts-fig-driver-login-links">
                        <p>
                            New driver? <Link href="/driver/signup">Apply to drive</Link>
                        </p>
                        {IS_DEV && (
                            <div className="ts-fig-auth-dev">
                                <p>Dev / QA only</p>
                                <button
                                    type="button"
                                    onClick={handleDevBypass}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Sign in as demo driver →"}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="ts-fig-auth-fields">
                    <label className="ts-fig-auth-field ts-fig-driver-code-field">
                        <span>Code sent to {phone}</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                            disabled={isLoading}
                            autoComplete="one-time-code"
                        />
                    </label>

                    <button 
                        type="submit"
                        disabled={isLoading || token.length < 6}
                        className="ts-fig-btn ts-fig-auth-submit"
                    >
                        {isLoading ? "Checking code..." : "Open driver dashboard"}
                    </button>

                    <button 
                        type="button"
                        onClick={() => { setStep("phone"); setMessage(null); }}
                        className="ts-fig-auth-ghost"
                    >
                        Use a different phone number
                    </button>

                    <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="ts-fig-driver-resend"
                    >
                        Resend code
                    </button>

                    <p className="ts-fig-auth-foot">
                        Changed your phone number? <Link href="/driver/recover" className="font-bold text-[#3dd68c]">Request a login update</Link>.
                    </p>
                </form>
            )}
        </div>
    );
}
