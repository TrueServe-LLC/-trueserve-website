"use client";

import { useActionState, useState, startTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { submitDriverApplication } from "./actions";

const initialState = { message: "", success: false, error: false };

export default function DriverApplicationForm() {
    return (
        <Suspense fallback={<div className="p-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px] animate-pulse italic">Loading enrollment terminal...</div>}>
            <DriverApplicationFormInner />
        </Suspense>
    );
}

function DriverApplicationFormInner() {
    const searchParams = useSearchParams();
    const isMockMode = searchParams.get("qa") === "true";

    const [state, formAction, isPending] = useActionState(submitDriverApplication, initialState);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        first_name: "", last_name: "", email: "", phone: "",
        dob: "", ssn_last4: "", address: "", city: "",
        state: "", zip: "", lat: 35.2271, lng: -80.8431,
        vehicleType: "car", vehicleMake: "", vehicleModel: "",
        vehicleColor: "", licensePlate: "", hasSignedAgreement: false,
    });

    const [idFile, setIdFile] = useState<File | null>(null);
    const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
    const [registrationFile, setRegistrationFile] = useState<File | null>(null);

    const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("name", `${formData.first_name} ${formData.last_name}`.toUpperCase());
        fd.append("email", formData.email.toUpperCase());
        fd.append("phone", formData.phone);
        fd.append("dob", formData.dob);
        fd.append("address", `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`.toUpperCase());
        fd.append("lat", formData.lat.toString());
        fd.append("lng", formData.lng.toString());
        fd.append("vehicleType", formData.vehicleType || "car");
        fd.append("vehicleMake", formData.vehicleMake || "N/A");
        fd.append("vehicleModel", formData.vehicleModel || "N/A");
        fd.append("vehicleColor", formData.vehicleColor || "N/A");
        fd.append("licensePlate", formData.licensePlate || "N/A");
        fd.append("hasSignedAgreement", formData.hasSignedAgreement.toString());
        if (idFile) fd.append("idDocument", idFile);
        if (insuranceFile) fd.append("insuranceDocument", insuranceFile);
        if (registrationFile) fd.append("registrationDocument", registrationFile);
        startTransition(() => formAction(fd));
    };

    const fillDemoData = () => {
        setFormData({
            ...formData, first_name: "ALEX", last_name: "JOHNSON",
            email: `DRIVER_${Math.floor(Math.random() * 1000)}@TRUELOGISTICS.TEST`,
            phone: "+1 555-987-6543", dob: "1992-05-15", ssn_last4: "8899",
            address: "101 N TRYON ST", city: "CHARLOTTE", state: "NC", zip: "28202",
            vehicleType: "car", vehicleMake: "Toyota", vehicleModel: "Camry",
            vehicleColor: "Silver", licensePlate: "FLEET-01", hasSignedAgreement: true,
        });
        setCurrentStep(1);
    };

    const steps = ["Identity", "Logistics", "Credentials", "Approval"];

    if (state.success) {
        return (
            <div className="w-full max-w-2xl mx-auto p-16 text-center space-y-8 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
                <div className="relative z-10 w-20 h-20 bg-primary/10 border-2 border-primary/20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto">🚀</div>
                <div className="relative z-10 space-y-3">
                    <h3 className="text-4xl font-serif italic text-white tracking-tight uppercase">Deployment Commenced!</h3>
                    <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed italic font-bold">
                        Your application is under review. Expect a response on your mobile terminal within 24 hours.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    <Link href="/driver/login" className="badge-solid-primary !py-4 !px-12 !text-[11px] h-glow">Check Status</Link>
                    <Link href="/" className="px-10 py-4 text-[10px] font-black uppercase text-slate-600 hover:text-white transition-all border border-white/5 rounded-2xl italic tracking-widest">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto relative">
            {isMockMode && (
                <div className="absolute top-0 right-0 z-[60]">
                    <button onClick={fillDemoData} className="text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary hover:bg-primary hover:text-black transition-all italic">
                        Auto-Fill
                    </button>
                </div>
            )}

            {/* Step Progress */}
            <div className="flex items-center justify-center gap-3 mb-12 overflow-x-auto pb-2">
                {steps.map((label, i) => {
                    const s = i + 1;
                    const active = currentStep >= s;
                    const current = currentStep === s;
                    return (
                        <div key={s} className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-700 ${
                                    active ? "bg-primary text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]" : "bg-white/5 text-slate-600 border border-white/5"
                                }`}>
                                    {currentStep > s ? "✓" : s}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap ${current ? "text-white" : "text-slate-700"}`}>{label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-12 h-px mb-6 transition-all duration-700 ${currentStep > s ? "bg-primary/40" : "bg-white/5"}`} />
                            )}
                        </div>
                    );
                })}
            </div>


            {/* Form - no outer box */}
            <div className="w-full">
                {state.error && (
                    <div className="mb-6">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">⚠️ {state.message}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} key={currentStep}>
                    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-white/5 pb-5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] italic">
                                {["Personal Identification", "Operational Logistics", "Credentials Upload", "Review & Agreement"][currentStep - 1]}
                            </h4>
                        </div>

                        {/* Step 1: Identity */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="label-sm">First Name <span className="text-primary">*</span></label>
                                    <input name="first_name" required value={formData.first_name} onChange={updateForm} placeholder="Alex" className="input-field" />
                                </div>
                                <div className="space-y-2">
                                    <label className="label-sm">Last Name <span className="text-primary">*</span></label>
                                    <input name="last_name" required value={formData.last_name} onChange={updateForm} placeholder="Johnson" className="input-field" />
                                </div>
                                <div className="space-y-2">
                                    <label className="label-sm">Date of Birth <span className="text-primary">*</span></label>
                                    <input name="dob" type="date" required value={formData.dob} onChange={updateForm} className="input-field font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <label className="label-sm">SSN Last 4 <span className="text-primary">*</span></label>
                                    <input name="ssn_last4" maxLength={4} required value={formData.ssn_last4} onChange={updateForm} placeholder="XXXX" className="input-field font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <label className="label-sm">Email <span className="text-primary">*</span></label>
                                    <input name="email" type="email" required value={formData.email} onChange={updateForm} placeholder="hello@trueserve.com" className="input-field" />
                                </div>
                                <div className="space-y-2">
                                    <label className="label-sm">Phone <span className="text-primary">*</span></label>
                                    <input name="phone" required value={formData.phone} onChange={updateForm} placeholder="(336) 000-0000" className="input-field font-mono" />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Logistics */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="label-sm">Street Address <span className="text-primary">*</span></label>
                                    <input name="address" required value={formData.address} onChange={updateForm} placeholder="Street address" className="input-field uppercase" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 col-span-1">
                                        <label className="label-sm">City <span className="text-primary">*</span></label>
                                        <input name="city" required value={formData.city} onChange={updateForm} placeholder="City" className="input-field uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">State <span className="text-primary">*</span></label>
                                        <input name="state" required value={formData.state} onChange={updateForm} placeholder="SC" className="input-field uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">ZIP <span className="text-primary">*</span></label>
                                        <input name="zip" required value={formData.zip} onChange={updateForm} placeholder="29401" className="input-field font-mono" />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <label className="label-sm">Vehicle Type</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[{ id: "bicycle", icon: "🚲", name: "Bicycle" }, { id: "motorcycle", icon: "🛵", name: "Moto" }, { id: "car", icon: "🚗", name: "Auto" }].map(v => (
                                            <button key={v.id} type="button" onClick={() => setFormData({ ...formData, vehicleType: v.id })}
                                                className={`p-5 rounded-2xl border transition-all text-center space-y-2 ${formData.vehicleType === v.id ? "bg-primary/10 border-primary" : "bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100"}`}>
                                                <div className="text-3xl">{v.icon}</div>
                                                <div className={`text-[10px] font-black uppercase tracking-widest ${formData.vehicleType === v.id ? "text-primary" : "text-slate-500"}`}>{v.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="label-sm">Color <span className="text-primary">*</span></label>
                                        <input name="vehicleColor" required value={formData.vehicleColor} onChange={updateForm} placeholder="Silver" className="input-field uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">Make/Model <span className="text-primary">*</span></label>
                                        <input name="vehicleMake" required value={formData.vehicleMake} onChange={updateForm} placeholder="Toyota Camry" className="input-field uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-sm">License Plate <span className="text-primary">*</span></label>
                                        <input name="licensePlate" required value={formData.licensePlate} onChange={updateForm} placeholder="ABC-123" className="input-field uppercase font-mono" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents */}
                        {currentStep === 3 && (
                            <div className="space-y-5">
                                <p className="text-slate-500 text-[11px] italic font-bold opacity-70 leading-relaxed">Upload scans or photos of your credentials. JPEG or PDF accepted.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {[
                                        { label: "Driver's License", icon: "🪪", file: idFile, onChange: (f: File) => setIdFile(f) },
                                        { label: "Proof of Insurance", icon: "📄", file: insuranceFile, onChange: (f: File) => setInsuranceFile(f) },
                                        { label: "Vehicle Registration", icon: "🚗", file: registrationFile, onChange: (f: File) => setRegistrationFile(f) },
                                    ].map((doc, i) => (
                                        <div key={i} className="space-y-2">
                                            <label className="label-sm">{doc.label} <span className="text-primary">*</span></label>
                                            <div className="relative border-2 border-dashed border-white/8 rounded-2xl h-32 bg-white/[0.02] flex flex-col items-center justify-center gap-2 hover:border-primary/40 cursor-pointer transition-all group overflow-hidden">
                                                <input type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && doc.onChange(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <div className="text-3xl group-hover:scale-110 transition-transform duration-500">{doc.icon}</div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-primary px-4 text-center transition-colors">
                                                    {doc.file ? <span className="text-primary">{doc.file.name}</span> : "Upload File"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Agreement */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[80px] rounded-full" />
                                    <p className="text-[12px] text-white font-black uppercase tracking-tight opacity-90 relative z-10">Terms of Operational Engagement</p>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold relative z-10">
                                        By finalizing this application, you authorize TrueServe to perform a comprehensive background and identity validation.
                                        You acknowledge operating as an Independent Contractor (1099) and affirm all provided credentials are accurate and current.
                                    </p>
                                </div>
                                <label className="flex items-center gap-6 cursor-pointer group/agree p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all">
                                    <input name="hasSignedAgreement" type="checkbox" checked={formData.hasSignedAgreement} onChange={updateForm} className="hidden" />
                                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
                                        formData.hasSignedAgreement ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "bg-transparent border-white/10 group-hover/agree:border-primary/40"
                                    }`}>
                                        {formData.hasSignedAgreement && <span className="text-lg font-black text-black">✓</span>}
                                    </div>
                                    <div>
                                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-400 group-hover/agree:text-white transition-colors">I Accept Fleet Protocols</span>
                                        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest mt-1">Digital Signature — Level Alpha</p>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-8 mt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 opacity-40">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-slate-700 text-[9px] font-black uppercase tracking-widest italic">Secure · Encrypted</span>
                        </div>
                        <div className="flex gap-3">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="px-8 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/20 transition-all italic">
                                    Back
                                </button>
                            )}
                            {currentStep < 4 ? (
                                <button type="button" onClick={nextStep} className="badge-solid-primary !py-3 !px-10 !text-[11px] !rounded-xl">
                                    Continue →
                                </button>
                            ) : (
                                <button type="submit" disabled={isPending || !formData.hasSignedAgreement} className="badge-solid-primary !py-3 !px-10 !text-[11px] !rounded-xl disabled:opacity-30">
                                    {isPending ? "Submitting..." : "Submit Application ✓"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 0.875rem;
                    padding: 0.8rem 1.1rem;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .input-field:focus {
                    border-color: rgba(245,158,11,0.4);
                    background: rgba(245,158,11,0.03);
                    box-shadow: 0 0 0 3px rgba(245,158,11,0.04);
                }
                .input-field::placeholder {
                    color: rgba(255,255,255,0.12);
                    font-style: italic;
                    font-size: 0.75rem;
                }
                .label-sm {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: rgb(100,116,139);
                    text-transform: uppercase;
                    letter-spacing: 0.18em;
                    margin-left: 2px;
                    margin-bottom: 4px;
                }
            `}</style>
        </div>
    );
}
