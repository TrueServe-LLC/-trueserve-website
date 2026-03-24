"use client";

import { useActionState, useState, startTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { submitDriverApplication } from "./actions";
import AddressInput from "@/components/AddressInput";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function DriverApplicationForm() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-white/[0.02] rounded-[32px] border border-white/5 animate-pulse italic">Initializing Fleet Protocols...</div>}>
            <DriverApplicationFormInner />
        </Suspense>
    );
}

function DriverApplicationFormInner() {
    const searchParams = useSearchParams();
    const isMockMode = searchParams.get('qa') === 'true';

    const [state, formAction, isPending] = useActionState(submitDriverApplication, initialState);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        lat: 0,
        lng: 0,
        vehicleType: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleColor: "",
        licensePlate: "",
        consentIdentity: false,
        consentBackground: false,
        hasSignedAgreement: false,
    });

    const [file, setFile] = useState<File | null>(null);

    const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, address, lat, lng }));
    };

    const fillDemoData = () => {
        setFormData({
            ...formData,
            name: `Alex Johnson (Demo)`,
            email: `driver_${Math.floor(Math.random() * 1000)}@truelogistics.test`,
            phone: "+1 555-987-6543",
            dob: "1992-05-15",
            address: "101 N Tryon St, Charlotte, NC 28202",
            lat: 35.2271,
            lng: -80.8431,
            vehicleType: "Car",
            hasSignedAgreement: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("email", formData.email);
        fd.append("phone", formData.phone);
        fd.append("dob", formData.dob);
        fd.append("address", formData.address);
        fd.append("lat", formData.lat.toString());
        fd.append("lng", formData.lng.toString());
        fd.append("vehicleType", formData.vehicleType || "Car");
        fd.append("vehicleMake", formData.vehicleMake || "N/A");
        fd.append("vehicleModel", formData.vehicleModel || "N/A");
        fd.append("hasSignedAgreement", formData.hasSignedAgreement.toString());

        if (file) fd.append("idDocument", file);

        startTransition(() => {
            formAction(fd);
        });
    };

    if (state.success) {
        return (
            <div className="max-w-2xl mx-auto p-12 md:p-24 bg-black/40 border border-white/10 rounded-[3rem] text-center shadow-3xl font-sans relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-50"></div>
                <div className="w-20 h-20 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10 text-emerald-500 animate-bounce shadow-2xl transition-all group-hover:scale-110">✓</div>
                <h3 className="text-3xl md:text-5xl font-black text-white italic mb-6 tracking-tighter uppercase leading-none px-2">Application Received!</h3>
                <p className="text-slate-500 font-bold mb-12 italic text-lg leading-relaxed max-w-md mx-auto">Thanks for applying to drive with us. Our team will review your info and get back to you shortly.</p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link href="/driver/login" className="badge-solid-primary py-6 px-12 text-[10px] tracking-widest !rounded-[2rem]">Driver Login →</Link>
                    <Link href="/" className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all border-b border-transparent hover:border-white/20 italic">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-20 max-w-5xl mx-auto font-sans text-left px-4">
            {isMockMode && (
                <div className="text-right">
                    <button type="button" onClick={fillDemoData} className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary hover:text-white hover:bg-primary transition-all uppercase tracking-[0.3em] italic">
                        Auto-fill for testing
                    </button>
                </div>
            )}
            
            {state.error && (
                <div className="p-8 bg-black/60 border border-red-500/20 rounded-2xl text-red-200 text-[10px] font-black uppercase tracking-[0.4em] animate-shake italic text-center shadow-2xl backdrop-blur-3xl">
                    ⚠️ {state.message}
                </div>
            )}

            <div className="space-y-24">
                {/* SECTION 1: IDENTITY */}
                <div className="space-y-16">
                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-black text-primary bg-primary/10 self-start px-5 py-2 rounded-full uppercase tracking-[0.5em] italic border border-primary/20">About You</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic ml-1">Full Name</label>
                                <input name="name" type="text" required value={formData.name} onChange={updateForm} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-6 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-black uppercase tracking-[0.2em]" placeholder="LEGAL NAME" />
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic ml-1">Email Address</label>
                               <input name="email" type="email" required value={formData.email} onChange={updateForm} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-6 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-black uppercase tracking-[0.2em]" placeholder="YOUR@EMAIL.COM" />
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic ml-1">Phone Number</label>
                               <input name="phone" type="tel" required value={formData.phone} onChange={updateForm} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-6 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-black" placeholder="(555) 000-0000" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: DISPATCH Area */}
                <div className="space-y-16">
                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-black text-primary bg-primary/10 self-start px-5 py-2 rounded-full uppercase tracking-[0.5em] italic border border-primary/20">Where will you be driving?</span>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic ml-1">Home Address</label>
                            <div className="[&>div>input]:!bg-white/[0.02] [&>div>input]:!border-white/10 [&>div>input]:!px-8 [&>div>input]:!py-6 [&>div>input]:!rounded-2xl [&>div>input]:!text-sm [&>div>input]:focus:!border-primary/40 [&>div>input]:!font-black [&>div>input]:!placeholder-slate-800 [&>div>input]:!uppercase [&>div>input]:!tracking-[0.2em] [&>div>input]:transition-all">
                               <AddressInput initialAddress={formData.address} onAddressSelect={handleAddressSelect} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: Vehicle */}
                <div className="space-y-16">
                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-black text-primary bg-primary/10 self-start px-5 py-2 rounded-full uppercase tracking-[0.5em] italic border border-primary/20">How will you deliver?</span>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            {[
                                { type: 'Bicycle', icon: '🚲' },
                                { type: 'Motorcycle', icon: '🏍️' },
                                { type: 'Car', icon: '🚗' },
                                { type: 'Van / Cargo', icon: '🚚' }
                            ].map(({type, icon}) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({...prev, vehicleType: type}))}
                                    className={`py-10 px-6 rounded-2xl border flex flex-col items-center gap-6 transition-all duration-700 group relative overflow-hidden ${formData.vehicleType === type ? 'bg-primary/20 border-primary text-primary shadow-2xl scale-105' : 'bg-white/[0.01] border-white/5 text-slate-500 hover:border-white/20'}`}
                                >
                                    <span className={`text-5xl transition-transform duration-700 ${formData.vehicleType === type ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">{type}</span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic ml-1">Vehicle Make</label>
                                <input name="vehicleMake" type="text" value={formData.vehicleMake} onChange={updateForm} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-6 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-black uppercase italic tracking-[0.2em]" placeholder="VEHICLE MAKE" />
                           </div>
                           <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic ml-1">Vehicle Model</label>
                                <input name="vehicleModel" type="text" value={formData.vehicleModel} onChange={updateForm} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-6 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-black uppercase italic tracking-[0.2em]" placeholder="VEHICLE MODEL" />
                           </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: Documents */}
                <div className="space-y-16">
                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-black text-primary bg-primary/10 self-start px-5 py-2 rounded-full uppercase tracking-[0.5em] italic border border-primary/20">Next Steps</span>

                        <div className="space-y-12">
                             <div className="relative border border-dashed border-white/10 rounded-2xl p-20 text-center hover:bg-white/[0.03] transition-all cursor-pointer group active:scale-[0.99] backdrop-blur-3xl glow-blur-primary">
                                <input name="idDocument" type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl">🛡️</div>
                                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] mb-2 italic">
                                    {file ? <span className="text-primary">{file.name}</span> : "Upload ID or License"}
                                </p>
                                <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em] italic">Secure SSL Upload Protocol</p>
                            </div>
                            
                            <label className="flex items-start gap-8 p-12 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-primary/30 cursor-pointer transition-all group shadow-2xl backdrop-blur-3xl">
                                <input type="checkbox" name="hasSignedAgreement" required checked={formData.hasSignedAgreement} onChange={updateForm} className="mt-1 w-7 h-7 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary/20 transition-all cursor-pointer" />
                                <div>
                                    <p className="text-[12px] font-black text-white uppercase tracking-[0.6em] italic group-hover:text-primary transition-colors">I agree to the terms</p>
                                    <p className="text-[10px] text-slate-500 font-bold italic mt-5 leading-relaxed max-w-2xl">I authorize TrueServe to perform a standard background check to keep our community safe.</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="pt-20 flex flex-col items-center">
                <button disabled={isPending || !formData.hasSignedAgreement} className="badge-solid-primary h-[70px] w-full max-w-xl text-sm font-black uppercase tracking-[0.6em] active:scale-[0.98] transition-all disabled:opacity-50 !rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                    {isPending ? "Syncing Grid..." : "Join the Fleet →"}
                </button>
                <p className="mt-20 text-center text-[11px] text-slate-700 font-black uppercase tracking-[1em] italic leading-relaxed opacity-40">
                    TrueServe Global Logsitics <br />
                    Supporting Corporate Expansion
                </p>
            </div>
        </form>
    );
}
