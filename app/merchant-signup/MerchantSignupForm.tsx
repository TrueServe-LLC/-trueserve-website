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
        fd.append("plan", selectedPlan);

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
        <form onSubmit={handleSubmit} className="space-y-16 max-w-4xl mx-auto font-sans">
            {state.error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-200 text-xs font-black uppercase tracking-widest animate-shake">
                    ⚠️ {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                <div className="space-y-6 md:sticky md:top-32 h-fit">
                    <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-6">Let's grow <br />together.</h2>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed italic max-w-sm mb-12">Fair pricing, local support, and more happy customers. That's the TrueServe promise.</p>
                    
                    <div className="space-y-6 pt-10 border-t border-white/5">
                        {[{ icon: '🎯', label: 'Local Access', desc: 'Direct link to neighborhood diners.' }, { icon: '🤝', label: 'Fair Fees', desc: 'Pricing plans that work for you.' }].map((feat, i) => (
                           <div key={i} className="flex gap-6 group">
                                <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{feat.icon}</div>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-1 italic">{feat.label}</h4>
                                    <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider italic">{feat.desc}</p>
                                </div>
                           </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-12">
                    {/* SECTION 1: Identity */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest italic border border-primary/20">Business Information</span>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 ml-1 uppercase tracking-widest italic font-sans">Restaurant Name</label>
                                <input name="restaurantName" type="text" required value={formData.restaurantName} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-primary transition-all font-black uppercase tracking-tight" placeholder="Your Restaurant Name" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 ml-1 uppercase tracking-widest italic">Contact Name</label>
                                    <input name="contactName" type="text" required value={formData.contactName} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-primary transition-all font-black uppercase tracking-tight" placeholder="Legal Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 ml-1 uppercase tracking-widest italic">Password</label>
                                    <input name="password" type="password" required value={formData.password} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-primary transition-all font-black" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 ml-1 uppercase tracking-widest italic">Email Address</label>
                                <input name="email" type="email" required value={formData.email} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-primary transition-all font-black uppercase tracking-tight" placeholder="your@email.com" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Geography */}
                    <div className="space-y-8 pt-12 border-t border-white/5">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-widest italic border border-orange-500/20">Store Location</span>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 ml-1 uppercase tracking-widest italic">Physical Address</label>
                                <div className="[&>div>input]:!bg-white/[0.03] [&>div>input]:!border-white/10 [&>div>input]:!px-6 [&>div>input]:!py-4 [&>div>input]:!rounded-2xl [&>div>input]:!text-sm [&>div>input]:!font-black [&>div>input]:!placeholder-slate-800 [&>div>input]:!uppercase [&>div>input]:!tracking-tight [&>div>input]:focus:!border-orange-500">
                                    <AddressInput initialAddress={formData.address} onAddressSelect={handleAddressSelect} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <input name="city" type="text" required value={formData.city} onChange={updateForm} className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-500 font-black uppercase" placeholder="City" />
                                <input name="state" type="text" required maxLength={2} value={formData.state} onChange={updateForm} className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-500 font-black uppercase text-center" placeholder="ST" />
                                <input name="zip" type="text" required value={formData.zip} onChange={updateForm} className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-500 font-black uppercase" placeholder="ZIP" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Tiers */}
                    <div className="space-y-8 pt-12 border-t border-white/5">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest italic border border-emerald-500/20">Choose Your Plan</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: "Flex Options", title: "Flex Plan", desc: "15% per order.", sub: "Great for starters.", icon: "🌱" },
                                { id: "Pro Subscription", title: "Pro Plan", desc: "0% commission. $199/mo.", sub: "High volume growth.", icon: "⚡" }
                            ].map((plan) => (
                                <div 
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`p-8 rounded-2xl border transition-all cursor-pointer group flex items-start gap-6 ${selectedPlan === plan.id ? 'bg-white/[0.05] border-white/20 text-white shadow-xl' : 'bg-black/60 border-white/5 text-slate-500 hover:border-white/10'}`}
                                >
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl group-hover:scale-110 transition-transform ${selectedPlan === plan.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-600'}`}>
                                        {plan.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-xs font-black uppercase tracking-widest mb-1 italic ${selectedPlan === plan.id ? 'text-white' : ''}`}>{plan.title}</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 leading-relaxed italic">{plan.desc}</p>
                                        <p className="text-[9px] text-slate-600 font-medium uppercase tracking-widest italic">{plan.sub}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === plan.id ? 'border-primary bg-primary' : 'border-white/10'}`}>
                                        {selectedPlan === plan.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-12">
                        <button disabled={isPending} className="badge-solid-primary h-[70px] w-full text-xs font-black uppercase tracking-[0.4em] active:scale-[0.98] transition-all disabled:opacity-50">
                            {isPending ? "Sending application..." : "Submit Application →"}
                        </button>
                        <p className="mt-8 text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] italic leading-relaxed opacity-60">
                            Secured Partnership Agreement <br />
                            TrueServe local network
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
