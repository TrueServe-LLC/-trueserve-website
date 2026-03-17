"use client";

import { useActionState, useState, useRef, startTransition, useEffect } from "react";
import Link from "next/link";
import { submitDriverApplication } from "./actions";
import AddressInput from "@/components/AddressInput";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function DriverApplicationForm() {
    const [state, formAction, isPending] = useActionState(submitDriverApplication, initialState);

    // Multi-step Wizard State
    const [step, setStep] = useState(1);

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
        // Consents
        consentIdentity: false,
        consentBackground: false,
        hasSignedAgreement: false,
    });

    const [file, setFile] = useState<File | null>(null);
    const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
    const [registrationFile, setRegistrationFile] = useState<File | null>(null);

    const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleNext = () => {
        // Validation before next step
        if (step === 1) {
            if (!formData.email || !formData.phone) return;
        }
        if (step === 3) {
            if (!formData.vehicleType || !formData.vehicleMake || !file) return;
        }
        if (step === 4) {
            if (!formData.consentIdentity || !formData.consentBackground) return;
        }
        setStep(prev => prev + 1);
    };


    const handleBack = () => setStep(prev => prev - 1);



    const fillDemoData = (hubName?: string) => {
        const hubs = [
            { name: "Alex Luthor", city: "Fayetteville", address: "225 Hay St, Fayetteville, NC 28301", lat: 35.0527, lng: -78.8784 },
            { name: "Bruce Wayne", city: "Charlotte", address: "101 N Tryon St, Charlotte, NC 28202", lat: 35.2271, lng: -80.8431 },
            { name: "Clark Kent", city: "Mount Airy", address: "125 N Main St, Mount Airy, NC 27030", lat: 36.5028, lng: -80.6084 },
            { name: "Diana Prince", city: "Greenville", address: "101 N Main St, Greenville, SC 29601", lat: 34.8526, lng: -82.3940 }
        ];
        
        const hub = hubName 
            ? hubs.find(h => h.city === hubName) || hubs[0]
            : hubs[Math.floor(Math.random() * hubs.length)];

        setFormData({
            name: `${hub.name} (Demo)`,
            email: `driver_${hub.city.toLowerCase()}_${Math.floor(Math.random() * 1000)}@truelogistics.test`,
            phone: "+1555" + Math.floor(Math.random() * 9000000 + 1000000),
            dob: "1992-05-15",
            address: hub.address,
            lat: hub.lat,
            lng: hub.lng,
            vehicleType: "Car",
            vehicleMake: "Tesla",
            vehicleModel: "Model 3",
            vehicleColor: "Deep Blue Metallic",
            licensePlate: `TS-${hub.city.substring(0,3).toUpperCase()}-1`,
            consentIdentity: true,
            consentBackground: true,
            hasSignedAgreement: true,
        });

        // Create a dummy 1x1 pixel image for the file uploads
        const dummyFile = new File(
            [new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52])], 
            "demo_license.png", 
            { type: "image/png" }
        );
        
        setFile(dummyFile);
        setInsuranceFile(dummyFile);
        setRegistrationFile(dummyFile);
        setStep(5); // Skip to the final signature step
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
        fd.append("vehicleType", formData.vehicleType);
        fd.append("vehicleMake", formData.vehicleMake);
        fd.append("vehicleModel", formData.vehicleModel);
        fd.append("vehicleColor", formData.vehicleColor);
        fd.append("licensePlate", formData.licensePlate);
        fd.append("hasSignedAgreement", formData.hasSignedAgreement.toString());

        if (file) {
            fd.append("idDocument", file);
        }
        if (insuranceFile) {
            fd.append("insuranceDocument", insuranceFile);
        }
        if (registrationFile) {
            fd.append("registrationDocument", registrationFile);
        }

        startTransition(() => {
            formAction(fd);
        });
    };

    if (state.success) {
        return (
            <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center animate-in fade-in zoom-in duration-500 pb-12">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 border border-emerald-500/30">✅</div>
                <h3 className="text-2xl font-black text-emerald-400 mb-2 leading-tight py-1">Thanks for applying!</h3>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">We will get back with you soon.</p>
                <Link href="/login" className="btn btn-primary w-full mt-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Log In to Portal</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {process.env.NODE_ENV === 'development' && (
                <div className="space-y-2 mb-6 p-4 bg-primary/5 border border-dashed border-primary/20 rounded-2xl">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest text-center mb-2">⚡ Mock Signup (Selection)</p>
                    <div className="grid grid-cols-2 gap-2">
                        {["Fayetteville", "Charlotte", "Mount Airy", "Greenville"].map((city) => (
                            <button 
                                key={city}
                                type="button" 
                                onClick={() => fillDemoData(city)}
                                className="py-2.5 bg-black/40 hover:bg-black/60 border border-white/5 rounded-xl text-[9px] font-black text-white hover:text-primary uppercase tracking-widest transition-all"
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {state.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs font-bold animate-shake">
                    ⚠️ {state.message}
                </div>
            )}



            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 px-2 relative">
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 -z-10 translate-y-[-50%]"></div>
                <div className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 translate-y-[-50%] transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

                {[1, 2, 3, 4, 5].map((num) => (

                    <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black tracking-widest transition-all ${step >= num ? 'bg-primary text-black scale-110 shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'bg-slate-800 text-slate-500 border border-white/10'}`}>
                        {num}
                    </div>
                ))}
            </div>

            <div className="min-h-[350px]">
                {/* STEP 1: Contact Info */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Get Started</h3>
                            <p className="text-xs text-slate-400">Step 1: Contact info.</p>
                        </div>

                        <input name="email" type="email" required value={formData.email} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Email Address" />
                        <input name="phone" type="tel" required value={formData.phone} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Mobile Phone" />
                    </div>
                )}

                {/* STEP 2: Personal Info & Address */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Personal Info</h3>
                            <p className="text-xs text-slate-400">Step 2: Your identity & location.</p>
                        </div>

                        <input name="name" type="text" required value={formData.name} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm mb-2" placeholder="Legal Full Name" />

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Home Address</label>
                            <AddressInput
                                initialAddress={formData.address}
                                onAddressSelect={handleAddressSelect}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date of Birth</label>
                            <input name="dob" type="date" required value={formData.dob} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" />
                        </div>
                    </div>
                )}

                {/* STEP 3: Gov ID & Vehicle */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Vehicle & ID</h3>
                            <p className="text-xs text-slate-400">Step 3: Security & driving eligibility.</p>
                        </div>

                        <div className="relative group">
                            <select name="vehicleType" required value={formData.vehicleType} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white appearance-none cursor-pointer font-bold text-sm">
                                <option value="" disabled>Select Vehicle Type</option>
                                <option value="Car">Car</option>
                                <option value="SUV">SUV</option>
                                <option value="Truck">Truck</option>
                                <option value="Scooter">Scooter / Bike</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">▼</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <input name="vehicleMake" type="text" required value={formData.vehicleMake} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Make (e.g. Toyota)" />
                            <input name="vehicleModel" type="text" required value={formData.vehicleModel} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Model (e.g. Camry)" />
                            <input name="vehicleColor" type="text" required value={formData.vehicleColor} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="Color (e.g. Silver)" />
                            <input name="licensePlate" type="text" required value={formData.licensePlate} onChange={updateForm} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 uppercase focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm" placeholder="License Plate" />
                        </div>

                        <div className="p-6 bg-black/30 border border-dashed border-white/10 hover:border-primary/50 transition-colors rounded-2xl mt-4">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Upload Driver's License</label>
                            <input name="idDocument" type="file" required accept="image/*,.pdf" onChange={handleFile} className="w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:transition-all cursor-pointer" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-black/30 border border-dashed border-white/10 hover:border-primary/50 transition-colors rounded-2xl">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Proof of Insurance</label>
                                <input name="insurance" type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setInsuranceFile(e.target.files[0])} className="w-full text-[9px] text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:bg-white/5 file:text-white cursor-pointer" />
                            </div>
                            <div className="p-6 bg-black/30 border border-dashed border-white/10 hover:border-primary/50 transition-colors rounded-2xl">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Vehicle Registration</label>
                                <input name="registration" type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setRegistrationFile(e.target.files[0])} className="w-full text-[9px] text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:bg-white/5 file:text-white cursor-pointer" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: Background Check & Final Consent */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Final Consents</h3>
                            <p className="text-xs text-slate-400">Step 4: Agreements and background checks.</p>
                        </div>

                        <label className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                            <input type="checkbox" name="consentIdentity" required checked={formData.consentIdentity} onChange={updateForm} className="mt-1 w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-black bg-black" />
                            <div>
                                <p className="text-sm font-bold text-white mb-1">Identity Verification Agreement</p>
                                <p className="text-xs text-slate-500 leading-relaxed">I consent to TrueServe verifying my identity using the provided ID and personal information.</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                            <input type="checkbox" name="consentBackground" required checked={formData.consentBackground} onChange={updateForm} className="mt-1 w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-black bg-black" />
                            <div>
                                <p className="text-sm font-bold text-white mb-1">Motor Vehicle & Background Check</p>
                                <p className="text-xs text-slate-500 leading-relaxed">I authorize TrueServe to obtain consumer reports, including criminal background and MVR checks.</p>
                            </div>
                        </label>
                    </div>
                )}

                {/* STEP 5: IC Agreement */}
                {step === 5 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Contractor Agreement</h3>
                            <p className="text-xs text-slate-400">Step 5: Review and sign our delivery terms.</p>
                        </div>

                        <div className="bg-black/80 border border-white/10 rounded-2xl p-6 h-64 overflow-y-auto custom-scrollbar text-[11px] text-slate-400 leading-relaxed font-medium">
                            <h4 className="text-white font-black uppercase tracking-widest mb-4">INDEPENDENT CONTRACTOR AGREEMENT</h4>
                            <p className="mb-4">This Agreement is between <strong>TrueServe LLC</strong> ("TrueServe") and the <strong>Independent Contractor</strong> ("Contractor").</p>
                            
                            <p className="mb-4"><strong>1. NATURE OF SERVICE:</strong> Contractor is an independent contractor, not an employee of TrueServe. Contractor maintains the right to perform services for other companies and is not required to work exclusively for TrueServe.</p>
                            
                            <p className="mb-4"><strong>2. EQUIPMENT & EXPENSES:</strong> Contractor shall provide their own vehicle and equipment. All expenses incurred while performing services (fuel, maintenance, insurance, mobile data) are the sole responsibility of the Contractor.</p>
                            
                            <p className="mb-4"><strong>3. COMPENSATION:</strong> Contractor will be paid on a per-delivery basis. Current rates and breakdown are visible in the TrueServe Driver Dashboard. Payouts are processed via Stripe Connect.</p>
                            
                            <p className="mb-4"><strong>4. TAXES & COMPLIANCE:</strong> As an independent contractor, Contractor is responsible for all local, state, and federal taxes. TrueServe will issue a 1099-NEC if earnings exceed the IRS threshold.</p>
                            
                            <p className="mb-4"><strong>5. TERMINATION:</strong> Either party may terminate this agreement at any time, for any reason, with written notice or by stopping the use of the platform.</p>
                            
                            <p className="mb-4"><strong>6. CONFIDENTIALITY:</strong> Contractor agrees to protect customer data and restaurant trade secrets encountered during deliveries.</p>
                        </div>

                        <label className="flex items-center gap-4 p-5 rounded-2xl border-2 border-primary/20 bg-primary/5 cursor-pointer transition-all hover:border-primary">
                            <input 
                                type="checkbox" 
                                name="hasSignedAgreement" 
                                required 
                                checked={formData.hasSignedAgreement} 
                                onChange={updateForm} 
                                className="w-6 h-6 rounded border-white/20 text-primary focus:ring-primary bg-black" 
                            />
                            <div>
                                <p className="text-sm font-black text-white">I agree to the Contractor Terms</p>
                                <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">Sign Digitally</p>
                            </div>
                        </label>
                    </div>
                )}
            </div>


            <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                {step > 1 && (
                    <button type="button" onClick={handleBack} disabled={isPending} className="px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-white font-bold text-sm transition-colors opacity-70 hover:opacity-100">
                        Back
                    </button>
                )}

                {step < 5 ? (
                    <button type="button" onClick={handleNext} className="flex-1 btn btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 rounded-2xl hover:scale-[1.02] transition-all">
                        Next Step →
                    </button>
                ) : (
                    <button type="submit" disabled={isPending || !formData.hasSignedAgreement} className="flex-1 btn btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100 rounded-2xl hover:scale-[1.02] transition-all">
                        {isPending ? "Finish & Submit" : "Sign & Submit Application"}
                    </button>
                )}
            </div>
            {step === 5 && (

                <p className="text-[10px] text-slate-500 text-center px-4 font-medium leading-relaxed mt-4">
                    By clicking submit, you acknowledge all TrueServe onboarding requirements.
                </p>
            )}
        </form>
    );
}
