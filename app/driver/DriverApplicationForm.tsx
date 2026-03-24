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
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Onboarding Rails...</div>}>
            <DriverApplicationFormInner />
        </Suspense>
    );
}

function DriverApplicationFormInner() {
    const searchParams = useSearchParams();
    const isMockMode = searchParams.get('qa') === 'true';

    const [state, formAction, isPending] = useActionState(submitDriverApplication, initialState);

    // Form Data State
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
    const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
    const [registrationFile, setRegistrationFile] = useState<File | null>(null);

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
        fd.append("vehicleColor", formData.vehicleColor || "N/A");
        fd.append("licensePlate", formData.licensePlate || "N/A");
        fd.append("hasSignedAgreement", formData.hasSignedAgreement.toString());

        if (file) fd.append("idDocument", file);
        if (insuranceFile) fd.append("insuranceDocument", insuranceFile);
        if (registrationFile) fd.append("registrationDocument", registrationFile);

        startTransition(() => {
            formAction(fd);
        });
    };

    if (state.success) {
        return (
            <div className="max-w-2xl mx-auto p-12 bg-white/[0.02] border border-white/10 rounded-[32px] text-center shadow-2xl">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 text-emerald-500">✓</div>
                <h3 className="text-2xl font-black text-white italic mb-2 tracking-tighter">Application Hub Entry Complete</h3>
                <p className="text-slate-500 font-medium mb-8">Your operational profile has been synced. We will reach out to you within 24 hours.</p>
                <Link href="/driver/login" className="badge-solid-primary w-full py-5 text-[10px] font-black uppercase tracking-widest shadow-emerald-500/20 block text-center">Enter Portal Command</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-12 max-w-4xl mx-auto font-sans">
            {isMockMode && (
                <div className="text-right">
                    <button type="button" onClick={fillDemoData} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-emerald-500 hover:text-white hover:border-emerald-500 transition-all uppercase tracking-widest">
                        Initialize Demo Protocol
                    </button>
                </div>
            )}
            
            {state.error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-xs font-black uppercase tracking-widest animate-shake">
                    ⚠️ {state.message}
                </div>
            )}

            {/* CARD 1: Personal Information */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm border border-emerald-500/20">1</div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <span>👤</span> Full Legal Name
                        </label>
                        <input name="name" type="text" required value={formData.name} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold placeholder:text-slate-700" placeholder="Alex Johnson" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <span>📧</span> Email Identity
                        </label>
                        <input name="email" type="email" required value={formData.email} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold placeholder:text-slate-700" placeholder="alex@email.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <span>📞</span> Mobile Terminal
                        </label>
                        <input name="phone" type="tel" required value={formData.phone} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold placeholder:text-slate-700" placeholder="(555) 987-6543" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <span>📍</span> Dispatch / Delivery Area
                        </label>
                        <div className="[&>div>input]:!bg-black/40 [&>div>input]:!border-white/10 [&>div>input]:!px-6 [&>div>input]:!py-4 [&>div>input]:!rounded-xl [&>div>input]:!text-sm [&>div>input]:focus:!border-emerald-500 [&>div>input]:!font-bold [&>div>input]:!placeholder-slate-700">
                           <AddressInput initialAddress={formData.address} onAddressSelect={handleAddressSelect} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 2: Vehicle & Experience */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm border border-emerald-500/20">2</div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Vehicle & Experience</h2>
                </div>

                <div className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Vehicle Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                    className={`py-8 px-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${formData.vehicleType === type ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/20'}`}
                                >
                                    <span className="text-3xl">{icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Vehicle Make</label>
                           <input name="vehicleMake" type="text" value={formData.vehicleMake} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 transition-all font-bold" placeholder="e.g. Toyota" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Vehicle Model</label>
                           <input name="vehicleModel" type="text" value={formData.vehicleModel} onChange={updateForm} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 transition-all font-bold" placeholder="e.g. Camry" />
                       </div>
                    </div>
                </div>
            </div>

            {/* CARD 3: Documents */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm border border-emerald-500/20">3</div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Protocol Verification</h2>
                </div>

                <div className="space-y-8">
                    <div className="relative border border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/[0.02] transition-colors cursor-pointer group">
                        <input name="idDocument" type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="text-31 mb-4 group-hover:scale-110 transition-transform">📄</div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            {file ? <span className="text-emerald-400">{file.name}</span> : "Upload Driver's License or Legal ID"}
                        </p>
                        <p className="text-[9px] text-slate-700 font-bold italic">Verification required for high-margin tiers</p>
                    </div>
                    
                    <label className="flex items-start gap-4 p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/20 cursor-pointer transition-all">
                        <input type="checkbox" name="hasSignedAgreement" required checked={formData.hasSignedAgreement} onChange={updateForm} className="mt-1 w-5 h-5 rounded border-white/10 bg-black/60 text-emerald-500 focus:ring-emerald-500/20" />
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-widest">Acknowledge Fleet Terms</p>
                            <p className="text-[10px] text-slate-500 font-medium italic mt-1">I authorize TrueServe to perform standard screening and background checks.</p>
                        </div>
                    </label>
                </div>
            </div>
            
            <div className="pt-8">
                <button disabled={isPending || !formData.hasSignedAgreement} className="badge-emerald w-full py-6 text-xs font-black uppercase tracking-[0.3em] shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50">
                    {isPending ? "Syncing Onboarding Data..." : "Launch Application Hub Entry →"}
                </button>
                <p className="mt-6 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest italic leading-relaxed">
                    By clicking submit, you agree to become part of the TrueServe network <br />
                    as an independent delivery specialist.
                </p>
            </div>
        </form>
    );
}
