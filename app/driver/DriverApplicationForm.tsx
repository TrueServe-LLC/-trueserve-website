"use client";

import { useActionState, useState, startTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { submitDriverApplication } from "./actions";

const initialState = { message: "", success: false, error: false };

export default function DriverApplicationForm() {
    return (
        <Suspense fallback={<div className="p-16 text-center text-slate-600 font-bebas uppercase tracking-widest text-sm animate-pulse italic">Loading enrollment terminal...</div>}>
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
            <div className="w-full max-w-2xl mx-auto p-8 md:p-16 text-center space-y-6 md:space-y-8 bg-[#131313] border border-white/5 rounded-[2rem] md:rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-fade-in font-barlow">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#e8a230]/10 via-transparent to-transparent" />
                <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-[#e8a230]/10 border-2 border-[#e8a230]/20 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl mx-auto">🚀</div>
                <div className="relative z-10 space-y-3">
                    <h3 className="text-3xl md:text-5xl font-bebas text-white tracking-tight uppercase italic">Deployment Commenced!</h3>
                    <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed italic font-bold">
                        Your application is under review. Expect a response on your mobile terminal within 24 hours.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    <Link href="/driver/login" className="bg-[#e8a230] text-black px-12 py-4 rounded-full font-bebas text-lg shadow-[0_0_30px_rgba(232,162,48,0.3)]">Check Status</Link>
                    <Link href="/" className="px-10 py-4 text-[10px] font-black uppercase text-slate-600 hover:text-white transition-all border border-white/5 rounded-2xl italic tracking-[0.3em] font-barlow-cond">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative font-barlow-cond">
            {isMockMode && (
                <div className="absolute -top-12 right-0 z-[60]">
                    <button onClick={fillDemoData} className="text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-full text-[#e8a230] hover:bg-[#e8a230] hover:text-black transition-all italic font-bebas">
                        Auto-Fill
                    </button>
                </div>
            )}

            {/* Step Progress */}
            <div className="flex items-center justify-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
                {steps.map((label, i) => {
                    const s = i + 1;
                    const active = currentStep >= s;
                    const current = currentStep === s;
                    return (
                        <div key={s} className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bebas transition-all duration-700 ${
                                    active ? "bg-[#e8a230] text-black shadow-[0_0_20px_rgba(232,162,48,0.5)]" : "bg-white/5 text-slate-600 border border-white/5"
                                }`}>
                                    {currentStep > s ? "✓" : s}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap ${current ? "text-white" : "text-slate-700"}`}>{label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-6 h-px mb-6 transition-all duration-700 ${currentStep > s ? "bg-[#e8a230]/40" : "bg-white/5"}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Form */}
            <div className="w-full">
                {state.error && (
                    <div className="mb-6">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">⚠️ {state.message}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} key={currentStep}>
                    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-white/5 pb-5">
                            <h4 className="text-3xl font-bebas text-white uppercase italic tracking-wider">
                                {["Personal Identity", "Operational Logistics", "Secure Credentials", "Fleet Agreement"][currentStep - 1]}
                            </h4>
                        </div>

                        {/* Step 1: Identity */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormItem label="First Name" required><input name="first_name" required value={formData.first_name} onChange={updateForm} placeholder="Alex" className="input-field" /></FormItem>
                                <FormItem label="Last Name" required><input name="last_name" required value={formData.last_name} onChange={updateForm} placeholder="Johnson" className="input-field" /></FormItem>
                                <FormItem label="Date of Birth" required><input name="dob" type="date" required value={formData.dob} onChange={updateForm} className="input-field" /></FormItem>
                                <FormItem label="SSN Last 4" required><input name="ssn_last4" maxLength={4} required value={formData.ssn_last4} onChange={updateForm} placeholder="XXXX" className="input-field font-mono" /></FormItem>
                                <FormItem label="Email" required><input name="email" type="email" required value={formData.email} onChange={updateForm} placeholder="hello@trueserve.com" className="input-field" /></FormItem>
                                <FormItem label="Phone" required><input name="phone" required value={formData.phone} onChange={updateForm} placeholder="(336) 000-0000" className="input-field font-mono" /></FormItem>
                            </div>
                        )}

                        {/* Step 2: Logistics */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <FormItem label="Street Address" required><input name="address" required value={formData.address} onChange={updateForm} placeholder="123 MAIN ST" className="input-field uppercase" /></FormItem>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="col-span-2 sm:col-span-1"><FormItem label="City" required><input name="city" required value={formData.city} onChange={updateForm} placeholder="CHARLOTTE" className="input-field uppercase" /></FormItem></div>
                                    <FormItem label="State" required><input name="state" required value={formData.state} onChange={updateForm} placeholder="NC" className="input-field uppercase" /></FormItem>
                                    <FormItem label="ZIP" required><input name="zip" required value={formData.zip} onChange={updateForm} placeholder="28202" className="input-field font-mono" /></FormItem>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5550]">Vehicle Protocol</label>
                                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                                        {[{ id: "bicycle", icon: "🚲", name: "Bicycle" }, { id: "motorcycle", icon: "🛵", name: "Moto" }, { id: "car", icon: "🚗", name: "Auto" }].map(v => (
                                            <button key={v.id} type="button" onClick={() => setFormData({ ...formData, vehicleType: v.id })}
                                                className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${formData.vehicleType === v.id ? "bg-[#e8a230]/10 border-[#e8a230]" : "bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100"}`}>
                                                <div className="text-2xl">{v.icon}</div>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${formData.vehicleType === v.id ? "text-[#e8a230]" : "text-slate-600"}`}>{v.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem label="Vehicle Color" required><input name="vehicleColor" required value={formData.vehicleColor} onChange={updateForm} placeholder="Black" className="input-field uppercase" /></FormItem>
                                    <FormItem label="License Plate" required><input name="licensePlate" required value={formData.licensePlate} onChange={updateForm} placeholder="ABC-1234" className="input-field uppercase font-mono" /></FormItem>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents */}
                        {currentStep === 3 && (
                            <div className="grid grid-cols-1 gap-5">
                                <p className="text-[11px] text-slate-500 italic font-medium opacity-70">Attach high-resolution scans of your documentation.</p>
                                {[
                                    { label: "Driver's License", icon: "🪪", file: idFile, onChange: (f: File) => setIdFile(f) },
                                    { label: "Proof of Insurance", icon: "📄", file: insuranceFile, onChange: (f: File) => setInsuranceFile(f) },
                                    { label: "Vehicle Registration", icon: "🚗", file: registrationFile, onChange: (f: File) => setRegistrationFile(f) },
                                ].map((doc, i) => (
                                    <div key={i} className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5550]">{doc.label} <span className="text-[#e8a230]">*</span></label>
                                        <div className="relative border border-dashed border-white/10 rounded-2xl h-24 bg-white/[0.02] flex items-center gap-4 px-6 hover:border-[#e8a230]/40 cursor-pointer transition-all group overflow-hidden">
                                            <input type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && doc.onChange(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{doc.icon}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#5A5550] group-hover:text-white transition-colors truncate max-w-[200px]">
                                                {doc.file ? doc.file.name : "Select File"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Step 4: Approval */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-[#131313] border border-white/5 space-y-3">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8a230]">Engagement Terms</p>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        By selecting 'Accept Protocol', you verify that all information is accurate. You authorize TrueServe to perform identity validation and understand your engagement is as an Independent Agent.
                                    </p>
                                </div>
                                <label className="flex items-center gap-5 cursor-pointer group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#e8a230]/20 transition-all">
                                    <input name="hasSignedAgreement" type="checkbox" checked={formData.hasSignedAgreement} onChange={updateForm} className="hidden" />
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                                        formData.hasSignedAgreement ? "bg-[#e8a230] border-[#e8a230]" : "bg-transparent border-white/10"
                                    }`}>
                                        {formData.hasSignedAgreement && <span className="text-black font-bold">✓</span>}
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 group-hover:text-white transition-colors">Accept Protocol Signature</span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-10 flex flex-col gap-6">
                        <div className="flex gap-4">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="flex-1 px-8 py-4 rounded-xl border border-white/5 text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-white transition-all">
                                    Previous
                                </button>
                            )}
                            {currentStep < 4 ? (
                                <button type="button" onClick={nextStep} className="flex-1 bg-[#e8a230] text-black px-12 py-4 rounded-xl font-bebas text-lg shadow-[0_0_20px_rgba(232,162,48,0.2)]">
                                    Next Protocol →
                                </button>
                            ) : (
                                <button type="submit" disabled={isPending || !formData.hasSignedAgreement} className="flex-1 bg-[#e8a230] text-black px-12 py-4 rounded-xl font-bebas text-lg shadow-[0_0_20px_rgba(232,162,48,0.3)] disabled:opacity-20">
                                    {isPending ? "PROCESSING..." : "SUBMIT ENROLLMENT ✓"}
                                </button>
                            )}
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 italic">
                                Active Agent? <Link href="/driver/login" className="text-[#e8a230] font-black underline underline-offset-4 ml-2">Login Terminal</Link>
                            </span>
                        </div>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 1rem;
                    padding: 1rem 1.25rem;
                    color: white;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .input-field:focus {
                    border-color: rgba(232,162,48,0.4);
                    background: rgba(232,162,48,0.02);
                }
                .input-field::placeholder {
                    color: rgba(255,255,255,0.1);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.75rem;
                }
            `}</style>
        </div>
    );
}

function FormItem({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5550] block ml-1">
                {label} {required && <span className="text-[#e8a230]">*</span>}
            </label>
            {children}
        </div>
    );
}
