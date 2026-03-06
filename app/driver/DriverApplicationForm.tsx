"use client";

import { useActionState, useState, useRef, startTransition } from "react";
import Link from "next/link";
import { submitDriverApplication } from "./actions";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function DriverApplicationForm() {
    const [state, formAction, isPending] = useActionState(submitDriverApplication, initialState);

    // Multi-step Wizard State
    const [step, setStep] = useState(1);

    // Form Data State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        vehicleType: "",
        // Consents
        consentIdentity: false,
        consentBackground: false,
    });
    const [file, setFile] = useState<File | null>(null);

    const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const fillTestData = () => {
        setFormData({
            name: "Test Driver",
            email: "test.driver@example.com",
            phone: "555-0100-1234",
            dob: "1990-01-01",
            address: "123 Test Street, New York, NY 10001",
            vehicleType: "Car",
            consentIdentity: true,
            consentBackground: true,
        });
        const dummyFile = new File(["dummy id content"], "dummy_license.jpg", { type: "image/jpeg" });
        setFile(dummyFile);
        setStep(4);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Build FormData properly to pass to Server Action
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("email", formData.email);
        fd.append("phone", formData.phone);
        fd.append("vehicleType", formData.vehicleType);
        if (file) {
            fd.append("idDocument", file);
        }

        startTransition(() => {
            formAction(fd);
        });
    };

    if (state.success) {
        return (
            <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center animate-in fade-in zoom-in duration-500 pb-12">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 border border-emerald-500/30">✅</div>
                <h3 className="text-2xl font-black text-emerald-400 mb-2 leading-tight py-1">Thanks for applying!</h3>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">We will get back with you soon.</p>
                <Link href="/login" className="btn btn-primary w-full mt-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Log In to Portal</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {state.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs font-bold animate-shake">
                    ⚠️ {state.message}
                </div>
            )}

            {/* QUICK TEST UTILITY */}
            <div className="flex justify-end">
                <button type="button" onClick={fillTestData} className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-slate-400 py-2 px-4 rounded-xl transition-all border border-white/5">
                    ⚡ Form Test Data
                </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 px-2 relative">
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 -z-10 translate-y-[-50%]"></div>
                <div className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 translate-y-[-50%] transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

                {[1, 2, 3, 4].map((num) => (
                    <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black tracking-widest transition-all ${step >= num ? 'bg-primary text-black scale-110 shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'bg-slate-800 text-slate-500 border border-white/10'}`}>
                        {num}
                    </div>
                ))}
            </div>

            <div className="min-h-[300px]">
                {/* STEP 1: Contact Info */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Get Started</h3>
                            <p className="text-xs text-slate-400">Step 1: Contact info.</p>
                        </div>

                        <input name="email" type="email" required value={formData.email} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Email Address" />
                        <input name="phone" type="tel" required value={formData.phone} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Mobile Phone" />
                    </div>
                )}

                {/* STEP 2: Application Intake (Gate 1) */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Personal Info</h3>
                            <p className="text-xs text-slate-400">Step 2: Your identity & eligibility.</p>
                        </div>

                        <input name="name" type="text" required value={formData.name} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Legal Full Name" />

                        <div className="grid grid-cols-2 gap-4">
                            <input name="dob" type="date" required value={formData.dob} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Date of Birth" />
                            <input name="address" type="text" required value={formData.address} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Home Address" />
                        </div>
                    </div>
                )}

                {/* STEP 3: Gov ID & Vehicle (Gate 2 & 5) */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Vehicle & ID</h3>
                            <p className="text-xs text-slate-400">Step 3: Security & driving eligibility.</p>
                        </div>

                        <div className="relative group">
                            <select name="vehicleType" required value={formData.vehicleType} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white appearance-none cursor-pointer font-bold text-sm">
                                <option value="" disabled>Select Vehicle Type</option>
                                <option value="Car">Car</option>
                                <option value="SUV">SUV</option>
                                <option value="Truck">Truck</option>
                                <option value="Scooter">Scooter / Bike</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">▼</div>
                        </div>

                        <div className="p-6 bg-black/30 border border-dashed border-white/10 hover:border-primary/50 transition-colors rounded-2xl mt-4">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Upload Driver's License</label>
                            <input name="idDocument" type="file" required accept="image/*,.pdf" onChange={handleFile} className="w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:transition-all cursor-pointer" />
                            <p className="text-[10px] text-slate-500 mt-3 font-medium">Clear photo required for verification.</p>
                        </div>
                    </div>
                )}

                {/* STEP 4: Background Check & Final Consent (Gate 4 & 7) */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Final Consents</h3>
                            <p className="text-xs text-slate-400">Step 4: Agreements and background checks.</p>
                        </div>

                        <label className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                            <input type="checkbox" name="consentIdentity" required checked={formData.consentIdentity} onChange={updateForm} className="mt-1 w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-black bg-black" />
                            <div>
                                <p className="text-sm font-bold text-white mb-1">Identity Verification Agreement</p>
                                <p className="text-xs text-slate-500 leading-relaxed">I consent to TrueServe verifying my identity using the provided ID and personal information.</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                            <input type="checkbox" name="consentBackground" required checked={formData.consentBackground} onChange={updateForm} className="mt-1 w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-black bg-black" />
                            <div>
                                <p className="text-sm font-bold text-white mb-1">Motor Vehicle & Background Check</p>
                                <p className="text-xs text-slate-500 leading-relaxed">I authorize TrueServe to obtain consumer reports, including criminal background and MVR checks.</p>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                {step > 1 && (
                    <button type="button" onClick={handleBack} disabled={isPending} className="px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-white font-bold text-sm transition-colors opacity-70 hover:opacity-100">
                        Back
                    </button>
                )}

                {step < 4 ? (
                    <button type="button" onClick={handleNext} className="flex-1 btn btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 rounded-2xl hover:scale-[1.02] transition-all">
                        Next Step →
                    </button>
                ) : (
                    <button type="submit" disabled={isPending || !formData.consentIdentity || !formData.consentBackground} className="flex-1 btn btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100 rounded-2xl hover:scale-[1.02] transition-all">
                        {isPending ? "Submitting..." : "Submit Application"}
                    </button>
                )}
            </div>
            {step === 4 && (
                <p className="text-[10px] text-slate-500 text-center px-4 font-medium leading-relaxed mt-4">
                    By clicking submit, you acknowledge all TrueServe onboarding requirements.
                </p>
            )}
        </form>
    );
}
