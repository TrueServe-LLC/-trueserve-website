"use client";

import { useActionState, useState, startTransition, Suspense } from "react";
import Link from "next/link";
import { submitMerchantInquiry } from "@/app/merchant/actions";
import AddressInput from "@/components/AddressInput";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function MerchantSignupForm() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-white/[0.02] rounded-[32px] border border-white/5 animate-pulse italic">Connecting to Logistics Grid...</div>}>
            <MerchantSignupFormInner />
        </Suspense>
    );
}

function MerchantSignupFormInner() {
    const [state, formAction, isPending] = useActionState(submitMerchantInquiry, initialState);
    
    // Form Data State
    const [formData, setFormData] = useState({
        businessName: "",
        contactName: "",
        email: "",
        password: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        category: "RESTAURANT",
        plan: "PRO",
        posSystem: "None",
        posClientId: "",
        posClientSecret: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("businessName", formData.businessName);
        fd.append("contactName", formData.contactName);
        fd.append("email", formData.email);
        fd.append("password", formData.password);
        fd.append("phone", formData.phone);
        fd.append("address", formData.address);
        fd.append("city", formData.city);
        fd.append("state", formData.state);
        fd.append("zip", formData.zip);
        fd.append("category", formData.category);
        fd.append("plan", formData.plan);
        fd.append("posSystem", formData.posSystem);

        startTransition(() => {
            formAction(fd);
        });
    };

    if (state.success) {
        return (
            <div className="max-w-2xl mx-auto p-12 md:p-24 bg-white/[0.02] border border-white/10 rounded-[3rem] text-center shadow-3xl font-sans relative overflow-hidden group transition-all duration-1000">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-50"></div>
                <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10 text-primary animate-bounce shadow-2xl">✓</div>
                <h3 className="text-3xl md:text-5xl font-black text-white italic mb-6 tracking-tighter uppercase leading-none">Application Received!</h3>
                <p className="text-slate-500 font-bold mb-12 italic text-lg leading-relaxed max-w-md mx-auto">Thank you for joining the TrueServe family. A partner specialist will reach out to you within 24 hours.</p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link href="/login?role=merchant" className="badge-solid-primary py-6 px-12 text-[10px] tracking-widest !rounded-[2rem]">Enter Dashboard →</Link>
                    <Link href="/" className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all border-b border-transparent hover:border-white/20 italic font-sans">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-16 max-w-5xl mx-auto font-sans px-4">
            {state.error && (
                <div className="p-8 bg-black/60 border border-red-500/20 rounded-2xl text-red-200 text-[10px] font-black uppercase tracking-[0.4em] animate-shake italic text-center shadow-2xl backdrop-blur-3xl">
                    ⚠️ {state.message}
                </div>
            )}
            <div className="flex flex-col items-center mb-32 text-center">
                 <h3 className="text-[10px] font-black uppercase text-primary italic tracking-[1.5em] mb-8 opacity-80">The Future</h3>
                 <h2 className="text-6xl md:text-[100px] font-serif font-black text-white italic uppercase leading-none tracking-tighter">Is Yours.</h2>
                 <div className="w-24 h-px bg-primary/20 mt-12 mb-12" />
            </div>

            <div className="space-y-24">
                {/* SECTION 1: IDENTITY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 group">
                    <div className="col-span-1 md:col-span-2 flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-primary px-3 py-1 border border-primary/20 rounded-full italic tracking-widest bg-primary/5">01</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-0">Identity & Credentials</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    
                    <div className="space-y-3 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Business Name</label>
                        <input
                            required
                            placeholder="OPERATIONAL IDENTITY"
                            value={formData.businessName}
                            onChange={(e) => setFormData(d => ({ ...d, businessName: e.target.value.toUpperCase() }))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Contact Name</label>
                        <input
                            required
                            placeholder="LEGAL REPRESENTATIVE"
                            value={formData.contactName}
                            onChange={(e) => setFormData(d => ({ ...d, contactName: e.target.value.toUpperCase() }))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Password</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData(d => ({ ...d, password: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Email Address</label>
                        <input
                            required
                            type="email"
                            placeholder="PARTNER@ESTABLISHMENT.COM"
                            value={formData.email}
                            onChange={(e) => setFormData(d => ({ ...d, email: e.target.value.toUpperCase() }))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Phone Number</label>
                        <input
                            required
                            type="tel"
                            placeholder="(555) 000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData(d => ({ ...d, phone: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>
                </div>

                {/* SECTION 2: GEOGRAPHY */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-primary px-3 py-1 border border-primary/20 rounded-full italic tracking-widest bg-primary/5">02</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-0">Operational Domain</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Physical Address</label>
                        <AddressInput initialAddress={formData.address} onAddressSelect={(address, lat, lng) => {
                            const parts = address.split(', ');
                            if (parts.length >= 3) {
                                setFormData(prev => ({
                                    ...prev,
                                    address: parts[0],
                                    city: parts[1],
                                    state: parts[2].split(' ')[0] || "",
                                    zip: parts[2].split(' ')[1] || ""
                                }));
                            } else {
                                setFormData(prev => ({ ...prev, address }));
                            }
                        }} />
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-4 md:col-span-2 space-y-3">
                             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">City</label>
                             <input
                                placeholder="CITY"
                                value={formData.city}
                                onChange={(e) => setFormData(d => ({ ...d, city: e.target.value.toUpperCase() }))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                             />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-3">
                             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">State</label>
                             <input
                                maxLength={2}
                                placeholder="ST"
                                value={formData.state}
                                onChange={(e) => setFormData(d => ({ ...d, state: e.target.value.toUpperCase() }))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white text-center placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                             />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-3">
                             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Zip</label>
                             <input
                                placeholder="ZIP"
                                value={formData.zip}
                                onChange={(e) => setFormData(d => ({ ...d, zip: e.target.value.toUpperCase() }))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white text-center placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                             />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: PARTNERSHIP PLAN */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-primary px-3 py-1 border border-primary/20 rounded-full italic tracking-widest bg-primary/5">03</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-0">Partnership Plan</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { id: 'FLEX', name: 'Flex Plan', desc: 'No Monthly Fee • 20% Commission' },
                            { id: 'PRO', name: 'Pro Plan', desc: '$49/Mo • 15% Commission' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setFormData(d => ({ ...d, plan: p.id }))}
                                className={`flex items-center justify-between px-12 py-8 rounded-full border transition-all duration-500 text-left relative overflow-hidden group ${
                                    formData.plan === p.id 
                                    ? 'bg-primary/10 border-primary shadow-[0_0_40px_rgba(245,158,11,0.1)]' 
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex flex-col">
                                    <div className={`text-[12px] font-black uppercase tracking-[0.2em] italic ${formData.plan === p.id ? 'text-primary' : 'text-white'}`}>{p.name}</div>
                                    <div className={`text-[9px] font-bold uppercase tracking-widest italic mt-1 ${formData.plan === p.id ? 'text-white/60' : 'text-slate-600'}`}>{p.desc}</div>
                                </div>
                                <div className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                                    formData.plan === p.id ? 'border-primary bg-primary' : 'border-white/10 bg-transparent'
                                }`}>
                                    {formData.plan === p.id && <div className="text-[14px] text-black">✓</div>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="pt-24 flex flex-col items-center">
                <button disabled={isPending} className="badge-solid-primary h-16 w-full max-w-xl text-[12px] font-black uppercase tracking-[0.4em] active:scale-[0.98] transition-all disabled:opacity-50 !rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] !bg-primary !text-black">
                    {isPending ? "Configuring Access..." : "Submit Application →"}
                </button>
            </div>
        </form>
    );
}
