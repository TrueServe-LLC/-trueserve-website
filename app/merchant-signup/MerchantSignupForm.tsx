"use client";

import { useActionState, useState, startTransition, Suspense } from "react";
import Link from "next/link";
import { submitMerchantInquiry } from "@/app/merchant/actions";

const initialState = { message: "", success: false, error: false };

export default function MerchantSignupForm() {
    return (
        <Suspense fallback={<div className="p-16 text-center text-slate-600 font-bebas uppercase tracking-widest text-sm animate-pulse italic">Initializing enrollment terminal...</div>}>
            <MerchantSignupFormInner />
        </Suspense>
    );
}

function MerchantSignupFormInner() {
    const [state, formAction, isPending] = useActionState(submitMerchantInquiry, initialState);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        businessName: "", contactName: "", email: "", password: "",
        address: "", city: "", state: "", zip: "", phone: "",
        category: "RESTAURANT", plan: "PRO", posSystem: "None",
    });

    const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        startTransition(() => formAction(fd));
    };

    const steps = ["Partnership", "Geography", "Protocol"];

    if (state.success) {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 md:p-16 text-center space-y-6 md:space-y-8 bg-[#131313] border border-white/5 rounded-[2rem] md:rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-fade-in font-barlow">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#e8a230]/10 via-transparent to-transparent" />
                <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-[#e8a230]/10 border-2 border-[#e8a230]/20 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl mx-auto">🏛️</div>
                <div className="relative z-10 space-y-3">
                    <h3 className="text-3xl md:text-5xl font-bebas text-white tracking-tight uppercase italic">Partnership Authorized!</h3>
                    <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed italic font-bold">
                        A partner specialist will reach out within 24 hours to finalize your integration and hardware dispatch.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    <Link href="/merchant/login" className="bg-[#e8a230] text-black px-12 py-4 rounded-full font-bebas text-lg shadow-[0_0_30px_rgba(232,162,48,0.3)]">Access Dashboard</Link>
                    <Link href="/" className="px-10 py-4 text-[10px] font-black uppercase text-slate-600 hover:text-white transition-all border border-white/5 rounded-2xl italic tracking-[0.3em] font-barlow-cond">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full font-barlow-cond">
            {/* Step Progress */}
            <div className="flex items-center justify-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
                {steps.map((label, i) => {
                    const s = i + 1;
                    const active = currentStep >= s;
                    const current = currentStep === s;
                    return (
                        <div key={s} className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bebas transition-all duration-700 ${
                                    active ? "bg-[#e8a230] text-black shadow-[0_0_20px_rgba(232,162,48,0.5)]" : "bg-white/5 text-slate-600 border border-white/5"
                                }`}>
                                    {currentStep > s ? "✓" : s}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap ${current ? "text-white" : "text-slate-700"}`}>{label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-16 h-px mb-6 transition-all duration-700 ${currentStep > s ? "bg-[#e8a230]/40" : "bg-white/5"}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Form */}
            <div className="w-full">
                {state.error && (
                    <div className="mb-6">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">⚠️ {state.message}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} key={currentStep}>
                    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-white/5 pb-5">
                            <h4 className="text-3xl font-bebas text-white uppercase italic tracking-wider">
                                {["Identity & Credentials", "Operational Domain", "Partnership Protocol"][currentStep - 1]}
                            </h4>
                        </div>

                        {currentStep === 1 && (
                            <div className="space-y-5">
                                <FormItem label="Business Name" required><input name="businessName" required value={formData.businessName} onChange={updateForm} placeholder="EX: THE GOURMET BISTRO" className="input-field" /></FormItem>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormItem label="Legal Representative" required><input name="contactName" required value={formData.contactName} onChange={updateForm} placeholder="FULL LEGAL NAME" className="input-field" /></FormItem>
                                    <FormItem label="Contact Phone" required><input name="phone" required value={formData.phone} onChange={updateForm} placeholder="(336) 000-0000" className="input-field font-mono" /></FormItem>
                                    <FormItem label="Partnership Email" required><input name="email" type="email" required value={formData.email} onChange={updateForm} placeholder="PARTNER@ESTABLISHMENT.COM" className="input-field" /></FormItem>
                                    <FormItem label="Secure Password" required><input name="password" type="password" required value={formData.password} onChange={(e) => setFormData(d => ({ ...d, password: e.target.value }))} placeholder="••••••••" className="input-field" /></FormItem>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-5">
                                <FormItem label="Establishment Address" required><input name="address" required value={formData.address} onChange={updateForm} placeholder="123 MAIN ST" className="input-field uppercase" /></FormItem>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="col-span-2 sm:col-span-1"><FormItem label="City" required><input name="city" required value={formData.city} onChange={updateForm} placeholder="CHARLOTTE" className="input-field uppercase" /></FormItem></div>
                                    <FormItem label="State" required><input name="state" required value={formData.state} onChange={updateForm} placeholder="NC" className="input-field uppercase" /></FormItem>
                                    <FormItem label="ZIP" required><input name="zip" required value={formData.zip} onChange={updateForm} placeholder="28202" className="input-field font-mono" /></FormItem>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5550]">Establishment Type</label>
                                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                                        {[{ id: 'RESTAURANT', icon: '🍳', name: 'Kitchen' }, { id: 'GROCERY', icon: '🛒', name: 'Market' }, { id: 'LIQUOR', icon: '🍷', name: 'Beverage' }].map(v => (
                                            <button key={v.id} type="button" onClick={() => setFormData({ ...formData, category: v.id })}
                                                className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${formData.category === v.id ? 'bg-[#e8a230]/10 border-[#e8a230]' : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100'}`}>
                                                <div className="text-2xl">{v.icon}</div>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${formData.category === v.id ? 'text-[#e8a230]' : 'text-slate-600'}`}>{v.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <FormItem label="Marketplace Tier">
                                    <div className="grid grid-cols-1 gap-4">
                                        {[{ id: 'FLEX', name: 'Flex Protocol', desc: 'No Monthly Fee · 20% Commish' }, { id: 'PRO', name: 'Empire Tier', desc: '$49/mo · 15% Commish' }].map(p => (
                                            <button key={p.id} type="button" onClick={() => setFormData(d => ({ ...d, plan: p.id }))}
                                                className={`flex items-center justify-between px-8 py-5 rounded-2xl border transition-all text-left ${formData.plan === p.id ? 'bg-[#e8a230]/10 border-[#e8a230]' : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100'}`}>
                                                <div>
                                                    <div className={`text-xl font-bebas uppercase italic ${formData.plan === p.id ? 'text-[#e8a230]' : 'text-white'}`}>{p.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold italic mt-1">{p.desc}</div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${formData.plan === p.id ? 'bg-[#e8a230] border-[#e8a230]' : 'border-white/10'}`}>
                                                    {formData.plan === p.id && <span className="text-black font-bold">✓</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </FormItem>
                                <FormItem label="POS Integration Terminal">
                                    <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                                        {['Toast', 'Clover', 'Square', 'Other'].map(pos => (
                                            <button key={pos} type="button" onClick={() => setFormData({ ...formData, posSystem: pos.toUpperCase() })}
                                                className={`py-3 rounded-xl border transition-all text-center text-[10px] font-bold uppercase tracking-widest ${formData.posSystem === pos.toUpperCase() ? 'bg-[#e8a230]/10 border-[#e8a230] text-[#e8a230]' : 'bg-white/[0.02] border-white/5 text-slate-600 opacity-50 hover:opacity-100'}`}>
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                </FormItem>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-10 flex flex-col gap-6">
                        <div className="flex gap-4">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="flex-1 px-8 py-4 rounded-xl border border-white/5 text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-white transition-all">
                                    Back
                                </button>
                            )}
                            {currentStep < 3 ? (
                                <button type="button" onClick={nextStep} className="flex-1 bg-[#e8a230] text-black px-12 py-4 rounded-xl font-bebas text-lg shadow-[0_0_20px_rgba(232,162,48,0.2)]">
                                    Next Protocol →
                                </button>
                            ) : (
                                <button type="submit" disabled={isPending} className="flex-1 bg-[#e8a230] text-black px-12 py-4 rounded-xl font-bebas text-lg shadow-[0_0_20px_rgba(232,162,48,0.3)] disabled:opacity-20">
                                    {isPending ? "PROCESSING..." : "SUBMIT APPLICATION ✓"}
                                </button>
                            )}
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 italic">
                                Active Merchant? <Link href="/merchant/login" className="text-[#e8a230] font-black underline underline-offset-4 ml-2">Login Terminal</Link>
                            </span>
                        </div>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 1rem;
                    padding: 1rem 1.25rem;
                    color: white;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .input-field:focus {
                    border-color: rgba(232,162,48,0.4);
                    background: rgba(232,162,48,0.02);
                }
                .input-field::placeholder {
                    color: rgba(255,255,255,0.1);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.75rem;
                }
            `}</style>
        </div>
    );
}

function FormItem({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5550] block ml-1">
                {label} {required && <span className="text-[#e8a230]">*</span>}
            </label>
            {children}
        </div>
    );
}
