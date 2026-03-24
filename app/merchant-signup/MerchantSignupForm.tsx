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
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Initializing Partner Rails...</div>}>
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
            <div className="max-w-2xl mx-auto p-12 bg-white/[0.02] border border-white/10 rounded-[32px] text-center shadow-2xl font-sans">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 text-primary">✓</div>
                <h3 className="text-2xl font-black text-white italic mb-2 tracking-tighter uppercase">Partner Protocol Entry Complete</h3>
                <p className="text-slate-500 font-medium mb-8">Your brand has been registered for synchronization. We will be in touch shortly.</p>
                <Link href="/login?role=merchant" className="btn-standard w-full py-5 text-[10px] bg-primary text-white border-none shadow-primary/20 font-black uppercase tracking-widest block text-center">Enter Merchant Dashboard</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-12 max-w-4xl mx-auto font-sans">
            {state.error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-xs font-black uppercase tracking-widest animate-shake">
                    ⚠️ {state.message}
                </div>
            )}

            {/* CARD 1: Business Profile */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">1</div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Business Profile</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]"> <span>🏢</span> Restaurant / Brand Name</label>
                        <input name="restaurantName" type="text" required value={formData.restaurantName} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-bold" placeholder="High-Margin Eats" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]"> <span>🔑</span> Access Credentials (Password)</label>
                        <input name="password" type="password" required value={formData.password} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-bold" placeholder="••••••••" />
                    </div>
                </div>
            </div>

            {/* CARD 2: Point of Contact */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">2</div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Point of Contact</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 text-sans">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]"> <span>👤</span> Full Legal Name</label>
                        <input name="contactName" type="text" required value={formData.contactName} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-bold" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]"> <span>📧</span> Admin Email</label>
                        <input name="email" type="email" required value={formData.email} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-bold" placeholder="partner@domain.com" />
                    </div>
                </div>
            </div>

            {/* CARD 3: Physical Domain */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">3</div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Location Rails</h2>
                </div>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]"> <span>📍</span> Physical Street Address</label>
                        <div className="[&>div>input]:!bg-black/40 [&>div>input]:!border-white/10 [&>div>input]:!px-6 [&>div>input]:!py-4 [&>div>input]:!rounded-xl [&>div>input]:!text-sm [&>div>input]:!font-bold [&>div>input]:!placeholder-slate-700 [&>div>input]:focus:!border-primary">
                            <AddressInput initialAddress={formData.address} onAddressSelect={handleAddressSelect} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">City</label>
                            <input name="city" type="text" required value={formData.city} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary transition-all font-bold" placeholder="City" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">State</label>
                            <input name="state" type="text" required maxLength={2} value={formData.state} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary transition-all font-bold uppercase" placeholder="ST" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Zip Code</label>
                            <input name="zip" type="text" required value={formData.zip} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary transition-all font-bold" placeholder="ZIP Code" />
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 4: Plan */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">4</div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Service Tier</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { id: "Flex Options", title: "Flex Scale", desc: "15% Split per transaction.", icon: "🌱" },
                        { id: "Pro Subscription", title: "Pro Subscription", desc: "0% Split. $199/mo.", icon: "⚡" }
                    ].map((plan) => (
                        <div 
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`p-8 rounded-[24px] border transition-all cursor-pointer group ${selectedPlan === plan.id ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(42,91,89,0.1)]' : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-3xl group-hover:scale-110 transition-transform">{plan.icon}</span>
                                <h4 className="text-xs font-black uppercase tracking-widest leading-none">{plan.title}</h4>
                            </div>
                            <p className="mt-4 text-[11px] font-medium italic opacity-80 leading-relaxed">{plan.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-8">
                <button disabled={isPending} className="btn-premium-solid w-full py-6 text-xs font-black uppercase tracking-[0.3em] active:scale-[0.98] transition-all disabled:opacity-50">
                    {isPending ? "Syncing Partner Data..." : "Apply to Marketplace Network →"}
                </button>
                 <p className="mt-6 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest italic leading-relaxed">
                    By submitting, you agree to the TrueServe merchant agreement <br />
                    and technical synchronization protocols.
                </p>
            </div>
        </form>
    );
}
