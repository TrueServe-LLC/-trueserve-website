"use client";

import { useActionState, useState, startTransition, Suspense } from "react";
import Link from "next/link";
import { submitMerchantInquiry } from "@/app/merchant/actions";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function MerchantSignupForm() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-[#0a0a0b] rounded-[3rem] border border-white/5 animate-pulse italic">Establishing Merchant Uplink...</div>}>
            <MerchantSignupFormInner />
        </Suspense>
    );
}

function MerchantSignupFormInner() {
    const [state, formAction, isPending] = useActionState(submitMerchantInquiry, initialState);
    const [currentStep, setCurrentStep] = useState(1);
    
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
            <div className="w-full bg-[#0a0a0b] border border-white/5 rounded-[4rem] p-16 md:p-24 text-center space-y-10 animate-fade-in shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-50" />
                <div className="relative z-10 w-24 h-24 bg-primary/10 border-2 border-primary/20 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-pop-in">
                    🏛️
                </div>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-4xl md:text-6xl font-serif italic text-white tracking-tight uppercase leading-none">Partnership Authorized!</h3>
                    <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed italic font-bold">
                        Welcome to the family. A partner specialist will reach out to you within 24 hours to finalize your menu integration and POS synchronization.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-6 pt-10">
                    <Link href="/login?role=merchant" className="badge-solid-primary !py-6 !px-16 !text-[13px] h-glow">
                        Access Dashboard
                    </Link>
                    <Link href="/" className="px-12 py-6 text-[11px] font-black uppercase text-slate-500 hover:text-white transition-all border-b border-transparent hover:border-white/20 italic tracking-[0.4em]">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[950px] flex bg-[#0a0a0b] border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl ring-1 ring-white/5 relative group/terminal">
            {/* Sidebar - Merchant Perks */}
            <aside className="hidden lg:flex w-[440px] bg-[#111112] border-r border-white/5 flex-col p-16 relative overflow-hidden shrink-0">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src="/merchant_hero_cinematic_1774395289646.png" className="w-full h-full object-cover opacity-[0.15] grayscale scale-110" alt="Merchant" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111112] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-primary/2 backdrop-blur-[1px]" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-12 w-fit">
                        🏛️ Partner Onboarding
                    </div>

                    <h2 className="text-7xl font-serif italic text-white leading-[0.9] tracking-tighter mb-10 uppercase">
                        Scale.<br />
                        Integrate.<br />
                        <span className="text-primary not-italic font-black tracking-[-0.05em] h-glow">Thrive.</span>
                    </h2>

                    <p className="text-slate-500 text-sm font-bold leading-relaxed mb-16 italic opacity-70 max-w-xs">
                        Join an elite logistics network designed to prioritize local margins and high-velocity synchronizations.
                    </p>

                    <div className="space-y-4 mt-auto">
                        <PerkCard icon="🚀" title="Direct POS Sync" desc="Automated Toast & Clover integration." amber />
                        <PerkCard icon="💎" title="Elite Drivers" desc="Vetted ambassadors representing your brand." />
                        <PerkCard icon="📈" title="Higher Margins" desc="Low commission rates that support your growth." amber />
                        <PerkCard icon="🛠️" title="Merchant Portal" desc="Real-time analytics and menu management." />
                    </div>
                </div>
            </aside>

            {/* Main Form Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0a0a0b]">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
                </div>

                <div className="relative z-10 p-12 md:p-20 max-w-4xl mx-auto space-y-16">
                    {/* Header & Steps */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-4xl md:text-5xl font-serif italic text-white leading-tight tracking-tight px-1 uppercase">Merchant Inquiry</h3>
                            <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] italic opacity-50 px-1">Establish your digital storefront in minutes</p>
                        </div>

                        {/* Progress Line */}
                        <div className="relative flex justify-between items-center px-10">
                            <div className="absolute left-14 right-14 top-1/2 -translate-y-1/2 h-px bg-white/5 z-0" />
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-black transition-all duration-700 ${
                                        currentStep >= s ? 'bg-primary text-black shadow-[0_0_30px_rgba(245,158,11,0.6)] scale-110' : 'bg-[#1c1916] text-slate-700 border border-white/5'
                                    }`}>
                                        {currentStep > s ? '✓' : s}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${currentStep === s ? 'text-white' : 'text-slate-700'}`}>
                                        {['Identity', 'Geography', 'Partnership'][s-1]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {state.error && (
                        <div className="p-8 bg-black/60 border border-red-500/20 rounded-3xl text-red-200 text-[10px] font-black uppercase tracking-[0.4em] animate-shake italic text-center shadow-2xl backdrop-blur-3xl relative z-20">
                            ⚠️ {state.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-16 animate-fade-in" key={currentStep}>
                        {currentStep === 1 && (
                            <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Identity & Credentials</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Business Name <span className="text-primary">*</span></label>
                                            <input name="businessName" required value={formData.businessName} onChange={updateForm} placeholder="EX: THE GOURMET BISTRO" className="input-field" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Contact Name <span className="text-primary">*</span></label>
                                            <input name="contactName" required value={formData.contactName} onChange={updateForm} placeholder="LEGAL REPRESENTATIVE" className="input-field" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Mobile Terminal <span className="text-primary">*</span></label>
                                            <input name="phone" required value={formData.phone} onChange={updateForm} placeholder="(336) 000-0000" className="input-field font-mono" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Email Terminal <span className="text-primary">*</span></label>
                                            <input name="email" type="email" required value={formData.email} onChange={updateForm} placeholder="PARTNER@ESTABLISHMENT.COM" className="input-field uppercase" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Secure Password <span className="text-primary">*</span></label>
                                            <input name="password" type="password" required value={formData.password} onChange={(e) => setFormData(d => ({ ...d, password: e.target.value }))} placeholder="••••••••" className="input-field" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Operational Domain</h4>
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Physical Location Address <span className="text-primary">*</span></label>
                                            <input name="address" required value={formData.address} onChange={updateForm} placeholder="STREET ADDRESS" className="input-field uppercase" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">City <span className="text-primary">*</span></label>
                                                <input name="city" required value={formData.city} onChange={updateForm} placeholder="CITY" className="input-field uppercase" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">State <span className="text-primary">*</span></label>
                                                <input name="state" required value={formData.state} onChange={updateForm} placeholder="EX: SC" className="input-field uppercase" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">ZIP Code <span className="text-primary">*</span></label>
                                                <input name="zip" required value={formData.zip} onChange={updateForm} placeholder="ZIP" className="input-field font-mono" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Establishment Category</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { id: 'RESTAURANT', icon: '🍳', name: 'Restaurant' },
                                            { id: 'GROCERY', icon: '🛒', name: 'Market' },
                                            { id: 'LIQUOR', icon: '🍷', name: 'Beverage' }
                                        ].map(v => (
                                            <button 
                                                key={v.id}
                                                type="button"
                                                onClick={() => setFormData({...formData, category: v.id})}
                                                className={`p-10 rounded-[3rem] border transition-all space-y-4 group/v shadow-xl ${
                                                    formData.category === v.id ? 'bg-primary/10 border-primary shadow-primary/10 scale-[1.02]' : 'bg-[#1c1916] border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-4xl group-hover/v:scale-110 transition-transform duration-500 shadow-xl">{v.icon}</div>
                                                <div className={`text-[12px] font-black uppercase tracking-widest italic ${formData.category === v.id ? 'text-primary' : 'text-slate-500'}`}>{v.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Partnership Protocol</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { id: 'FLEX', name: 'Flex Plan', desc: 'No Monthly Fee • 20% Commission' },
                                            { id: 'PRO', name: 'Pro Plan', desc: '$49/Mo • 15% Commission' }
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setFormData(d => ({ ...d, plan: p.id }))}
                                                className={`flex items-center justify-between px-12 py-10 rounded-[3rem] border transition-all duration-500 text-left relative overflow-hidden group/plan shadow-2xl ${
                                                    formData.plan === p.id 
                                                    ? 'bg-primary/10 border-primary shadow-[0_0_40px_rgba(245,158,11,0.1)] scale-[1.02]' 
                                                    : 'bg-[#1c1916] border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className={`text-[14px] font-black uppercase tracking-[0.3em] italic ${formData.plan === p.id ? 'text-primary' : 'text-white'}`}>{p.name}</div>
                                                    <div className={`text-[10px] font-bold uppercase tracking-widest italic leading-relaxed ${formData.plan === p.id ? 'text-white/60' : 'text-slate-600'}`}>{p.desc}</div>
                                                </div>
                                                <div className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                                                    formData.plan === p.id ? 'border-primary bg-primary shadow-lg shadow-primary/20' : 'border-white/10 bg-transparent'
                                                }`}>
                                                    {formData.plan === p.id && <div className="text-[18px] text-black font-black">✓</div>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">POS Infrastructure</h4>
                                    <p className="text-slate-500 text-[11px] italic font-bold opacity-60 px-2 leading-relaxed uppercase tracking-widest">Select your primary terminal interface for seamless menu injection.</p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {['Toast', 'Clover', 'Square', 'None'].map(pos => (
                                            <button 
                                                key={pos}
                                                type="button"
                                                onClick={() => setFormData({...formData, posSystem: pos})}
                                                className={`py-8 rounded-[2.5rem] border transition-all text-center shadow-xl font-black uppercase tracking-[0.2em] italic text-[11px] ${
                                                    formData.posSystem === pos ? 'bg-primary/10 border-primary text-primary' : 'bg-[#1c1916] border-white/5 text-slate-600 opacity-40 hover:opacity-100 hover:border-white/20'
                                                }`}
                                            >
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center pt-16 border-t border-white/5 gap-10">
                            <div className="flex items-center gap-4 opacity-30 group-hover/terminal:opacity-60 transition-opacity">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(245,158,11,1)]" />
                                <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] italic">
                                    Logistics Gateway Active &bull; {new Date().getFullYear()}
                                </span>
                            </div>
                            
                            <div className="flex gap-6 w-full md:w-auto">
                                {currentStep > 1 && (
                                    <button type="button" onClick={prevStep} className="flex-1 md:flex-none badge-outline-white !py-6 !px-14 !text-[12px] !rounded-[2.5rem] opacity-40 hover:opacity-100 uppercase tracking-[0.3em] font-black shadow-xl">
                                        Back
                                    </button>
                                )}
                                
                                {currentStep < 3 ? (
                                    <button type="button" onClick={nextStep} className="flex-1 md:flex-none badge-solid-primary !py-6 !px-20 !text-[12px] !rounded-[2.5rem] h-glow shadow-2xl font-black italic">
                                        Next Stage →
                                    </button>
                                ) : (
                                    <button 
                                        type="submit" 
                                        disabled={isPending}
                                        className="flex-1 md:flex-none badge-solid-primary !py-6 !px-20 !text-[12px] !rounded-[2.5rem] h-glow disabled:opacity-20 shadow-2xl font-black italic"
                                    >
                                        {isPending ? "Configuring Hub..." : "INITIATE PARTNERSHIP ✓"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </main>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    background: #1c1916;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1.75rem;
                    padding: 1.75rem 2.25rem;
                    color: white;
                    font-size: 1rem;
                    font-weight: 800;
                    outline: none;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                }
                .input-field:focus {
                    border-color: rgba(245, 158, 11, 0.5);
                    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.05), inset 0 2px 4px rgba(0,0,0,0.2);
                    background: #28241d;
                    transform: translateY(-1px);
                }
                .input-field::placeholder {
                    color: rgba(255, 255, 255, 0.06);
                    letter-spacing: 0.3em;
                    font-style: italic;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.04);
                    border-radius: 100px;
                    border: 3px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(245, 158, 11, 0.2);
                    background-clip: content-box;
                }
            `}</style>
        </div>
    );
}

function PerkCard({ icon, title, desc, amber }: { icon: string; title: string; desc: string; amber?: boolean }) {
    return (
        <div className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-[2.5rem] group hover:border-primary/30 transition-all duration-500 cursor-default hover:translate-x-1 shadow-lg">
            <div className={`w-14 h-14 shrink-0 rounded-[1.5rem] flex items-center justify-center text-3xl transition-all duration-700 group-hover:rotate-[15deg] group-hover:scale-110 ${amber ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-[14px] font-black text-white tracking-widest italic leading-none">{title}</p>
                <p className="text-[11px] text-slate-600 font-bold italic leading-tight mt-1 opacity-80">{desc}</p>
            </div>
        </div>
    );
}
