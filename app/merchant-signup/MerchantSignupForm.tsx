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
        <Suspense fallback={<div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-white/[0.02] rounded-[32px] border border-white/5 animate-pulse italic">Initializing Partner Rails...</div>}>
            <MerchantSignupFormInner />
        </Suspense>
    );
}

function MerchantSignupFormInner() {
    const [state, formAction, isPending] = useActionState(submitMerchantInquiry, initialState);
    const [selectedPlan, setSelectedPlan] = useState<string>("Flex Options");
    
    // Form Data State
    const [formData, setFormData] = useState({
        restaurantName: "",
        contactName: "",
        email: "",
        password: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        posSystem: "None",
        posClientId: "",
        posClientSecret: "",
    });

    const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
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
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("restaurantName", formData.restaurantName);
        fd.append("contactName", formData.contactName);
        fd.append("email", formData.email);
        fd.append("password", formData.password);
        fd.append("address", formData.address);
        fd.append("city", formData.city);
        fd.append("state", formData.state);
        fd.append("zip", formData.zip);
        fd.append("phone", formData.phone);
        fd.append("plan", selectedPlan);
        fd.append("posSystem", formData.posSystem);
        fd.append("posClientId", formData.posClientId);
        fd.append("posClientSecret", formData.posClientSecret);

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
        <form onSubmit={handleSubmit} className="space-y-24 max-w-5xl mx-auto font-sans px-4">
            {state.error && (
                <div className="p-8 bg-black/60 border border-red-500/20 rounded-2xl text-red-200 text-[10px] font-black uppercase tracking-[0.4em] animate-shake italic text-center shadow-2xl backdrop-blur-3xl">
                    ⚠️ {state.message}
                </div>
            )}

            <div className="space-y-16">
                {/* SECTION 1: Identity */}
                <div className="relative p-10 md:p-14 border border-white/10 bg-white/[0.02] rounded-[2.5rem] group hover:border-white/20 transition-all">
                    <div className="absolute -top-5 left-8 px-6 py-2 bg-black border border-primary text-primary text-[10px] font-black uppercase italic tracking-[0.4em] rounded-full z-10 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        Business Identification
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[11px] font-bold text-slate-400 ml-1">Restaurant Name</label>
                            <input name="restaurantName" type="text" required value={formData.restaurantName} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all font-black uppercase tracking-[0.1em]" placeholder="YOUR ESTABLISHMENT" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-400 ml-1">Contact Name</label>
                            <input name="contactName" type="text" required value={formData.contactName} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all font-black uppercase tracking-[0.1em]" placeholder="LEGAL REPRESENTATIVE" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-400 ml-1">Password</label>
                            <input name="password" type="password" required value={formData.password} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all font-black" placeholder="••••••••" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-400 ml-1">Email Address</label>
                            <input name="email" type="email" required value={formData.email} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all font-black uppercase tracking-[0.1em]" placeholder="PARTNER@EMAIL.COM" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-400 ml-1">Phone Number</label>
                            <input name="phone" type="tel" required value={formData.phone} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all font-black" placeholder="(864) 555-0312" />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Geography */}
                <div className="relative p-10 md:p-14 border border-white/10 bg-white/[0.02] rounded-[2.5rem] group hover:border-white/20 transition-all">
                    <div className="absolute -top-5 left-8 px-6 py-2 bg-black border border-primary text-primary text-[10px] font-black uppercase italic tracking-[0.4em] rounded-full z-10 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        Operational Domain
                    </div>
                    
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-400 ml-1">Physical Address</label>
                            <div className="[&>div>input]:!bg-white/[0.03] [&>div>input]:!border-white/10 [&>div>input]:!px-8 [&>div>input]:!py-5 [&>div>input]:!rounded-2xl [&>div>input]:!text-sm [&>div>input]:focus:!border-primary/40 [&>div>input]:!font-black [&>div>input]:!placeholder-slate-800 [&>div>input]:!uppercase [&>div>input]:transition-all">
                                <AddressInput initialAddress={formData.address} onAddressSelect={handleAddressSelect} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-400 ml-1">City</label>
                                <input name="city" type="text" required value={formData.city} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none focus:border-primary/40 font-black uppercase tracking-widest" placeholder="CITY" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-slate-400 ml-1">State</label>
                                <input name="state" type="text" required maxLength={2} value={formData.state} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none focus:border-primary/40 font-black uppercase text-center tracking-widest" placeholder="ST" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-slate-400 ml-1">Zip</label>
                                <input name="zip" type="text" required value={formData.zip} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none focus:border-primary/40 font-black uppercase tracking-widest" placeholder="ZIP" />
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <div className="pt-20 flex flex-col items-center">
                <button disabled={isPending} className="badge-solid-primary h-[70px] w-full max-w-xl text-sm font-black uppercase tracking-[0.6em] active:scale-[0.98] transition-all disabled:opacity-50 !rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                    {isPending ? "Configuring Access..." : "Submit Application →"}
                </button>
                <p className="mt-20 text-center text-[11px] text-slate-700 font-black uppercase tracking-[1em] italic leading-relaxed opacity-40">
                    TrueServe Global Logsitics <br />
                    Supporting Network Integration
                </p>
            </div>
        </form>
    );
}
