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

const vehicles = [
    { id: 'bicycle', name: 'Bicycle', description: 'Eco-friendly & Fast' },
    { id: 'motorcycle', name: 'Motorcycle', description: 'Rapid Urban Delivery' },
    { id: 'car', name: 'Car', description: 'Standard Fleet Option' },
    { id: 'van', name: 'Van / Cargo', description: 'High-Volume Logistics' }
];

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
        password: "",
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
            const val = (name === 'name' || name === 'email') ? value.toUpperCase() : value;
            setFormData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, address: address.toUpperCase(), lat, lng }));
    };

    const fillDemoData = () => {
        setFormData({
            ...formData,
            name: `ALEX JOHNSON (DEMO)`,
            email: `DRIVER_${Math.floor(Math.random() * 1000)}@TRUELOGISTICS.TEST`,
            phone: "+1 555-987-6543",
            dob: "1992-05-15",
            address: "101 N TRYON ST, CHARLOTTE, NC 28202",
            lat: 35.2271,
            lng: -80.8431,
            vehicleType: "car",
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
        fd.append("vehicleType", formData.vehicleType || "car");
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
        <form onSubmit={handleSubmit} className="space-y-16 max-w-5xl mx-auto font-sans text-left px-4">
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

            <div className="flex flex-col items-center mb-24 text-center">
                 <h3 className="text-[11px] font-black uppercase text-primary italic tracking-[1em] mb-6">The Future</h3>
                 <h2 className="text-4xl md:text-6xl font-black text-white italic h-glow uppercase leading-none">Is Yours.</h2>
                 <div className="w-16 h-px bg-primary/20 mt-8" />
            </div>

            <div className="space-y-24">
                {/* SECTION 1: IDENTITY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 group">
                    <div className="col-span-1 md:col-span-2 flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-primary px-3 py-1 border border-primary/20 rounded-full italic tracking-widest bg-primary/5">01</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-0">Identity & Credentials</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Full Name</label>
                        <input
                            name="name"
                            required
                            placeholder="LEGAL NAME"
                            value={formData.name}
                            onChange={updateForm}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Password</label>
                        <input
                            name="password"
                            required
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={updateForm}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Email Address</label>
                        <input
                            name="email"
                            required
                            type="email"
                            placeholder="YOUR@EMAIL.COM"
                            value={formData.email}
                            onChange={updateForm}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Phone Number</label>
                        <input
                            name="phone"
                            required
                            type="tel"
                            placeholder="(555) 000-0000"
                            value={formData.phone}
                            onChange={updateForm}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        />
                    </div>
                </div>

                {/* SECTION 2: DISPATCH Area */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-primary px-3 py-1 border border-primary/20 rounded-full italic tracking-widest bg-primary/5">02</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-0">Dispatch Logistics</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">Home Address</label>
                        <AddressInput onAddressSelect={handleAddressSelect} initialAddress={formData.address} />
                    </div>
                </div>

                {/* SECTION 3: Vehicle Selection */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-primary px-3 py-1 border border-primary/20 rounded-full italic tracking-widest bg-primary/5">03</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-0">Vehicle Fleet Selection</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="flex flex-col gap-4">
                        {vehicles.map((v) => (
                             <button
                                key={v.id}
                                type="button"
                                onClick={() => setFormData(d => ({ ...d, vehicleType: v.id }))}
                                className={`w-full flex items-center justify-between p-8 rounded-2xl border transition-all ${
                                    formData.vehicleType === v.id 
                                    ? 'bg-primary border-primary shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                }`}
                             >
                                <div className="text-left">
                                    <h4 className={`text-[12px] font-black uppercase tracking-[0.2em] italic ${formData.vehicleType === v.id ? 'text-black' : 'text-white'}`}>{v.name}</h4>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest italic ${formData.vehicleType === v.id ? 'text-black/60' : 'text-slate-600'}`}>{v.description}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                                    formData.vehicleType === v.id ? 'border-black bg-black' : 'border-white/10 bg-transparent'
                                }`}>
                                </div>
                             </button>
                        ))}
                    </div>
                </div>



                {/* SECTION 4: Documents */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-primary px-3 py-1 border border-primary/20 rounded-full italic tracking-widest bg-primary/5">04</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-0">Strategic Verification</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="space-y-12">
                         <div className="relative border border-dashed border-white/10 rounded-2xl p-20 text-center hover:bg-white/[0.04] transition-all cursor-pointer group backdrop-blur-3xl">
                            <input name="idDocument" type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-700">🛡️</div>
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] mb-2 italic">
                                {file ? <span className="text-primary">{file.name}</span> : "Upload ID or License"}
                            </p>
                            <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em] italic">Secure SSL Upload Protocol</p>
                        </div>
                        
                        <label className="flex items-start gap-8 p-12 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-primary/30 cursor-pointer transition-all group">
                            <input type="checkbox" name="hasSignedAgreement" required checked={formData.hasSignedAgreement} onChange={updateForm} className="mt-1 w-7 h-7 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary/20 transition-all cursor-pointer" />
                            <div>
                                <p className="text-[12px] font-black text-white uppercase tracking-[0.6em] italic group-hover:text-primary transition-colors">I agree to the terms</p>
                                <p className="text-[10px] text-slate-500 font-bold italic mt-5 leading-relaxed max-w-2xl">I authorize TrueServe to perform a standard background check to keep our community safe.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="pt-24 flex flex-col items-center">
                <button disabled={isPending || !formData.hasSignedAgreement} className="badge-solid-primary h-16 w-full max-w-xl text-[12px] font-black uppercase tracking-[0.4em] active:scale-[0.98] transition-all disabled:opacity-50 !rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] !bg-primary !text-black">
                    {isPending ? "Configuring Access..." : "Join The Fleet →"}
                </button>
                <p className="mt-20 text-center text-[11px] text-slate-700 font-black uppercase tracking-[1em] italic leading-relaxed opacity-40">
                    TrueServe Global Logistics <br />
                    Supporting Network Integration
                </p>
            </div>
        </form>
    );
}
