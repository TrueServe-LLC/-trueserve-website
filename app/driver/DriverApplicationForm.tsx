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
        <form onSubmit={handleSubmit} className="space-y-16 max-w-4xl mx-auto font-sans text-left">
            {isMockMode && (
                <div className="text-right">
                    <button type="button" onClick={fillDemoData} className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all uppercase tracking-widest italic">
                        Auto-fill for testing
                    </button>
                </div>
            )}
            
            {state.error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-200 text-xs font-black uppercase tracking-widest animate-shake italic">
                    ⚠️ {state.message}
                </div>
            )}

            <div className="space-y-16">
                {/* SECTION 1: IDENTITY */}
                <div className="space-y-10 group">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-emerald-500/20">About You</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-600 ml-1 uppercase tracking-widest italic">Full Name</label>
                            <input name="name" type="text" required value={formData.name} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-emerald-500 transition-all font-black uppercase tracking-tight" placeholder="Legal Name" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-600 ml-1 uppercase tracking-widest italic">Email Address</label>
                           <input name="email" type="email" required value={formData.email} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-black uppercase tracking-tight" placeholder="YOUR@EMAIL.COM" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-600 ml-1 uppercase tracking-widest italic">Phone Number</label>
                           <input name="phone" type="tel" required value={formData.phone} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-black" placeholder="(555) 000-0000" />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: DISPATCH Area */}
                <div className="space-y-10 pt-16 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-primary/20">Where will you be driving?</span>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 ml-1 uppercase tracking-widest italic">Home Address</label>
                        <div className="[&>div>input]:!bg-white/[0.03] [&>div>input]:!border-white/10 [&>div>input]:!px-6 [&>div>input]:!py-4 [&>div>input]:!rounded-2xl [&>div>input]:!text-sm [&>div>input]:focus:!border-emerald-500 [&>div>input]:!font-black [&>div>input]:!placeholder-slate-800 [&>div>input]:!uppercase [&>div>input]:!tracking-tight">
                           <AddressInput initialAddress={formData.address} onAddressSelect={handleAddressSelect} />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: Vehicle */}
                <div className="space-y-10 pt-16 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-orange-500/20">How will you deliver?</span>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                                className={`py-6 px-4 rounded-3xl border flex flex-col items-center gap-4 transition-all duration-500 group relative overflow-hidden ${formData.vehicleType === type ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/60 border-white/5 text-slate-500 hover:border-white/10'}`}
                            >
                                <span className={`text-4xl transition-transform duration-500 ${formData.vehicleType === type ? 'scale-110 rotate-12' : 'group-hover:scale-110'}`}>{icon}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest italic">{type}</span>
                                {formData.vehicleType === type && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500"></div>}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <input name="vehicleMake" type="text" value={formData.vehicleMake} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-emerald-500 transition-all font-black uppercase italic tracking-tight" placeholder="Vehicle Make" />
                       <input name="vehicleModel" type="text" value={formData.vehicleModel} onChange={updateForm} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-emerald-500 transition-all font-black uppercase italic tracking-tight" placeholder="Vehicle Model" />
                    </div>
                </div>

                {/* SECTION 4: Documents */}
                <div className="space-y-10 pt-16 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-white bg-white/5 px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-white/10">Next Steps</span>
                    </div>

                    <div className="space-y-8">
                         <div className="relative border border-dashed border-white/10 rounded-3xl p-12 text-center hover:bg-white/[0.02] transition-all cursor-pointer group active:scale-[0.99]">
                            <input name="idDocument" type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">🛡️</div>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">
                                {file ? <span className="text-emerald-400">{file.name}</span> : "Upload ID or License"}
                            </p>
                        </div>
                        
                        <label className="flex items-start gap-6 p-8 rounded-[2rem] bg-black border border-white/5 hover:border-emerald-500/20 cursor-pointer transition-all group">
                            <input type="checkbox" name="hasSignedAgreement" required checked={formData.hasSignedAgreement} onChange={updateForm} className="mt-1 w-6 h-6 rounded-lg border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 transition-all cursor-pointer" />
                            <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-widest italic group-hover:text-emerald-400 transition-colors">I agree to the terms</p>
                                <p className="text-[10px] text-slate-600 font-medium italic mt-2 leading-relaxed">I authorize TrueServe to perform a standard background check to keep our community safe.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="pt-16">
                <button disabled={isPending || !formData.hasSignedAgreement} className="badge-solid-primary h-[70px] w-full text-xs font-black uppercase tracking-[0.4em] active:scale-[0.98] transition-all disabled:opacity-50">
                    {isPending ? "Submitting application..." : "Send Application →"}
                </button>
                <p className="mt-10 text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.5em] italic leading-relaxed opacity-50">
                    TrueServe Local Fleet <br />
                    Supporting our community
                </p>
            </div>
        </form>
    );
}
