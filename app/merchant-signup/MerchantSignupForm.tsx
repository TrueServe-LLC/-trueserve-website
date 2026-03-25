"use client";

import { useActionState, useState, startTransition, Suspense } from "react";
import Link from "next/link";
import { submitMerchantInquiry } from "@/app/merchant/actions";

const initialState = { message: "", success: false, error: false };

export default function MerchantSignupForm() {
    return (
        <Suspense fallback={<div className="p-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px] animate-pulse italic">Loading enrollment terminal...</div>}>
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

    const steps = ["Identity", "Geography", "Partnership"];

    if (state.success) {
        return (
            <div className="w-full max-w-2xl mx-auto p-16 text-center space-y-8 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
                <div className="relative z-10 w-20 h-20 bg-primary/10 border-2 border-primary/20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto">🏛️</div>
                <div className="relative z-10 space-y-3">
                    <h3 className="text-4xl font-serif italic text-white tracking-tight uppercase">Partnership Authorized!</h3>
                    <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed italic font-bold">
                        A partner specialist will reach out within 24 hours to finalize your integration.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    <Link href="/login?role=merchant" className="badge-solid-primary !py-4 !px-12 !text-[11px] h-glow">Access Dashboard</Link>
                    <Link href="/" className="px-10 py-4 text-[10px] font-black uppercase text-slate-600 hover:text-white transition-all border border-white/5 rounded-2xl italic tracking-widest">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Step Progress */}
            <div className="flex items-center justify-center gap-4 mb-12">
                {steps.map((label, i) => {
                    const s = i + 1;
                    const active = currentStep >= s;
                    const current = currentStep === s;
                    return (
                        <div key={s} className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-700 ${
                                    active ? 'bg-primary text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-white/5 text-slate-600 border border-white/5'
                                }`}>
                                    {currentStep > s ? "✓" : s}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${current ? 'text-white' : 'text-slate-700'}`}>{label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-24 h-px mb-6 transition-all duration-700 ${currentStep > s ? 'bg-primary/40' : 'bg-white/5'}`} />
                            )}
                        </div>
                    );
                })}
            </div>


            {/* Form - no outer box */}
            <div className="w-full">
                {state.error && (
                    <div className="mb-6">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                            ⚠️ {state.message}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} key={currentStep}>
                    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Step label */}
                        <div className="border-b border-white/5 pb-5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] italic">
                                {["Identity & Credentials", "Operational Domain", "Partnership Protocol"][currentStep - 1]}
                            </h4>
                        </div>

                        {/* Step 1 */}
                        {currentStep === 1 && (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="label-sm">Business Name <span className="text-primary">*</span></label>
                                    <input name="businessName" required value={formData.businessName} onChange={updateForm} placeholder="Ex: The Gourmet Bistro" className="input-field" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="label-sm">Contact Name <span className="text-primary">*</span></label>
                                        <input name="contactName" required value={formData.contactName} onChange={updateForm} placeholder="Legal representative" className="input-field" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">Phone Number <span className="text-primary">*</span></label>
                                        <input name="phone" required value={formData.phone} onChange={updateForm} placeholder="(336) 000-0000" className="input-field font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">Email Address <span className="text-primary">*</span></label>
                                        <input name="email" type="email" required value={formData.email} onChange={updateForm} placeholder="partner@establishment.com" className="input-field" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">Password <span className="text-primary">*</span></label>
                                        <input name="password" type="password" required value={formData.password} onChange={(e) => setFormData(d => ({ ...d, password: e.target.value }))} placeholder="••••••••" className="input-field" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2 */}
                        {currentStep === 2 && (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="label-sm">Street Address <span className="text-primary">*</span></label>
                                    <input name="address" required value={formData.address} onChange={updateForm} placeholder="Street address" className="input-field uppercase" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 col-span-1">
                                        <label className="label-sm">City <span className="text-primary">*</span></label>
                                        <input name="city" required value={formData.city} onChange={updateForm} placeholder="City" className="input-field uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">State <span className="text-primary">*</span></label>
                                        <input name="state" required value={formData.state} onChange={updateForm} placeholder="SC" className="input-field uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">ZIP <span className="text-primary">*</span></label>
                                        <input name="zip" required value={formData.zip} onChange={updateForm} placeholder="29401" className="input-field font-mono" />
                                    </div>
                                </div>
                                <div className="pt-2 space-y-3">
                                    <label className="label-sm">Establishment Type</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[{ id: 'RESTAURANT', icon: '🍳', name: 'Restaurant' }, { id: 'GROCERY', icon: '🛒', name: 'Market' }, { id: 'LIQUOR', icon: '🍷', name: 'Beverage' }].map(v => (
                                            <button key={v.id} type="button" onClick={() => setFormData({ ...formData, category: v.id })}
                                                className={`p-5 rounded-2xl border transition-all text-center space-y-2 ${formData.category === v.id ? 'bg-primary/10 border-primary' : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100'}`}>
                                                <div className="text-3xl">{v.icon}</div>
                                                <div className={`text-[10px] font-black uppercase tracking-widest ${formData.category === v.id ? 'text-primary' : 'text-slate-500'}`}>{v.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="label-sm">Choose a Plan</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[{ id: 'FLEX', name: 'Flex', desc: 'No Monthly Fee · 20% Commission' }, { id: 'PRO', name: 'Pro', desc: '$49/mo · 15% Commission' }].map(p => (
                                            <button key={p.id} type="button" onClick={() => setFormData(d => ({ ...d, plan: p.id }))}
                                                className={`flex items-center justify-between px-8 py-6 rounded-2xl border transition-all text-left ${formData.plan === p.id ? 'bg-primary/10 border-primary' : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100'}`}>
                                                <div>
                                                    <div className={`text-[13px] font-black uppercase tracking-wider italic ${formData.plan === p.id ? 'text-primary' : 'text-white'}`}>{p.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold italic mt-1">{p.desc}</div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData.plan === p.id ? 'border-primary bg-primary' : 'border-white/10'}`}>
                                                    {formData.plan === p.id && <span className="text-black font-black text-sm">✓</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="label-sm">POS System</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {['Toast', 'Clover', 'Square', 'None'].map(pos => (
                                            <button key={pos} type="button" onClick={() => setFormData({ ...formData, posSystem: pos })}
                                                className={`py-4 rounded-2xl border transition-all text-center text-[10px] font-black uppercase tracking-widest italic ${formData.posSystem === pos ? 'bg-primary/10 border-primary text-primary' : 'bg-white/[0.02] border-white/5 text-slate-600 opacity-50 hover:opacity-100'}`}>
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-8 mt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 opacity-40">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-slate-700 text-[9px] font-black uppercase tracking-widest italic">Secure · Encrypted</span>
                        </div>
                        <div className="flex gap-3">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="px-8 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/20 transition-all italic">
                                    Back
                                </button>
                            )}
                            {currentStep < 3 ? (
                                <button type="button" onClick={nextStep} className="badge-solid-primary !py-3 !px-10 !text-[11px] !rounded-xl">
                                    Continue →
                                </button>
                            ) : (
                                <button type="submit" disabled={isPending} className="badge-solid-primary !py-3 !px-10 !text-[11px] !rounded-xl disabled:opacity-30">
                                    {isPending ? "Submitting..." : "Submit Application ✓"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 0.875rem;
                    padding: 0.8rem 1.1rem;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .input-field:focus {
                    border-color: rgba(245,158,11,0.4);
                    background: rgba(245,158,11,0.03);
                    box-shadow: 0 0 0 3px rgba(245,158,11,0.04);
                }
                .input-field::placeholder {
                    color: rgba(255,255,255,0.12);
                    font-style: italic;
                    font-size: 0.75rem;
                }
                .label-sm {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: rgb(100,116,139);
                    text-transform: uppercase;
                    letter-spacing: 0.18em;
                    margin-left: 2px;
                    margin-bottom: 4px;
                }
            `}</style>
        </div>
    );
}
