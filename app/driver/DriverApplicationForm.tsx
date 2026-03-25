"use client";

import { useActionState, useState, startTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { submitDriverApplication } from "./actions";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function DriverApplicationForm() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-[#0a0a0b] rounded-[3rem] border border-white/5 animate-pulse italic">Establishing Secure Uplink...</div>}>
            <DriverApplicationFormInner />
        </Suspense>
    );
}

function DriverApplicationFormInner() {
    const searchParams = useSearchParams();
    const isMockMode = searchParams.get('qa') === 'true';

    const [state, formAction, isPending] = useActionState(submitDriverApplication, initialState);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        dob: "",
        ssn_last4: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        lat: 35.2271,
        lng: -80.8431,
        vehicleType: "car",
        vehicleMake: "",
        vehicleModel: "",
        vehicleColor: "",
        licensePlate: "",
        hasSignedAgreement: false,
    });

    const [idFile, setIdFile] = useState<File | null>(null);
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

        startTransition(() => {
            formAction(fd);
        });
    };

    const fillDemoData = () => {
        setFormData({
            ...formData,
            first_name: "ALEX",
            last_name: "JOHNSON",
            email: `DRIVER_${Math.floor(Math.random() * 1000)}@TRUELOGISTICS.TEST`,
            phone: "+1 555-987-6543",
            dob: "1992-05-15",
            ssn_last4: "8899",
            address: "101 N TRYON ST",
            city: "CHARLOTTE",
            state: "NC",
            zip: "28202",
            vehicleType: "car",
            vehicleMake: "Toyota",
            vehicleModel: "Camry",
            vehicleColor: "Silver",
            licensePlate: "FLEET-01",
            hasSignedAgreement: true,
        });
        setCurrentStep(1);
    };

    if (state.success) {
        return (
            <div className="w-full bg-[#0a0a0b] border border-white/5 rounded-[3.5rem] p-16 md:p-24 text-center space-y-10 animate-fade-in shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-50" />
                <div className="relative z-10 w-24 h-24 bg-primary/10 border-2 border-primary/20 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-pop-in">
                    🚀
                </div>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-4xl md:text-6xl font-serif italic text-white tracking-tight uppercase leading-none">Deployment Commenced!</h3>
                    <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed italic font-bold">
                        Your application is now under review by Fleet Command. Expect an encrypted uplink on your mobile terminal within 24 hours.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-6 pt-10">
                    <Link href="/driver/login" className="badge-solid-primary !py-6 !px-16 !text-[13px] h-glow">
                        Check Status
                    </Link>
                    <Link href="/" className="px-12 py-6 text-[11px] font-black uppercase text-slate-500 hover:text-white transition-all border-b border-transparent hover:border-white/20 italic tracking-[0.4em]">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[900px] flex bg-transparent overflow-hidden relative group/terminal">
             {isMockMode && (
                <div className="absolute top-8 right-8 z-[60]">
                    <button 
                        onClick={fillDemoData}
                        className="text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-primary hover:bg-primary hover:text-black transition-all italic h-glow"
                    >
                        Auto-Fill Terminal
                    </button>
                </div>
            )}

            {/* Sidebar - Cinematic Perks */}
            <aside className="hidden lg:flex w-[440px] bg-[#111112] border-r border-white/5 flex-col p-16 relative overflow-hidden shrink-0">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src="/diverse_drivers.png" className="w-full h-full object-cover opacity-[0.12] grayscale scale-110" alt="Drivers" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111112] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-primary/2 backdrop-blur-[1px]" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-12 w-fit">
                        🛵 Fleet Enrollment
                    </div>

                    <h2 className="text-7xl font-serif italic text-white leading-[0.9] tracking-tighter mb-10 uppercase">
                        Drive.<br />
                        Deliver.<br />
                        <span className="text-primary not-italic font-black tracking-[-0.05em] h-glow">Earn.</span>
                    </h2>

                    <p className="text-slate-500 text-sm font-bold leading-relaxed mb-16 italic opacity-70 max-w-xs">
                        Set your own hours and earn competitive pay. Join our community of independent drivers making real money on their schedule.
                    </p>

                    <div className="space-y-4 mt-auto">
                        <PerkCard icon="💰" title="Daily Payouts" desc="Paid out instantly after every route." amber />
                        <PerkCard icon="🕐" title="Flexible Hours" desc="Work whenever it suits you, no minimums." />
                        <PerkCard icon="⛽" title="Fuel Bonuses" desc="Extra earnings on every high-demand shift." amber />
                        <PerkCard icon="🏆" title="Fleet Rewards" desc="Tiered bonuses for our top performers." />
                    </div>
                </div>
            </aside>

            {/* Main Form Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-transparent">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
                </div>

                <div className="relative z-10 p-12 md:p-20 max-w-4xl mx-auto space-y-16">
                    {/* Header & Steps */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-4xl md:text-5xl font-serif italic text-white leading-tight tracking-tight px-1">Driver Application</h3>
                            <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] italic opacity-50 px-1">Takes about 5 minutes — approval within 24 hours</p>
                        </div>

                        {/* Progress Line */}
                        <div className="relative flex justify-between items-center px-10">
                            <div className="absolute left-14 right-14 top-1/2 -translate-y-1/2 h-px bg-white/5 z-0" />
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-black transition-all duration-700 ${
                                        currentStep >= s ? 'bg-primary text-black shadow-[0_0_30px_rgba(245,158,11,0.6)] scale-110' : 'bg-[#1c1916] text-slate-700 border border-white/5'
                                    }`}>
                                        {currentStep > s ? '✓' : s}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${currentStep === s ? 'text-white' : 'text-slate-700'}`}>
                                        {['Identity', 'Logistics', 'Credentials', 'Approval'][s-1]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {state.error && (
                        <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-3xl text-red-400 text-[10px] font-black uppercase tracking-[0.4em] italic text-center animate-shake">
                            ⚠️ {state.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-16 animate-fade-in" key={currentStep}>
                        {currentStep === 1 && (
                            <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Personal Identification</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">First Name <span className="text-primary">*</span></label>
                                            <input name="first_name" required value={formData.first_name} onChange={updateForm} placeholder="EX: ALEX" className="input-field" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Last Name <span className="text-primary">*</span></label>
                                            <input name="last_name" required value={formData.last_name} onChange={updateForm} placeholder="EX: JOHNSON" className="input-field" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Date of Birth <span className="text-primary">*</span></label>
                                            <input name="dob" type="date" required value={formData.dob} onChange={updateForm} className="input-field uppercase font-mono" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Identity (Last 4) <span className="text-primary">*</span></label>
                                            <input name="ssn_last4" maxLength={4} required value={formData.ssn_last4} onChange={updateForm} placeholder="XXXX" className="input-field font-mono" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Email Terminal <span className="text-primary">*</span></label>
                                            <input name="email" type="email" required value={formData.email} onChange={updateForm} placeholder="HELLO@TRUESERVE.COM" className="input-field uppercase" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Mobile Uplink <span className="text-primary">*</span></label>
                                            <input name="phone" required value={formData.phone} onChange={updateForm} placeholder="(336) 000-0000" className="input-field font-mono" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Operational Logistics</h4>
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Primary Deployment Address <span className="text-primary">*</span></label>
                                            <input name="address" required value={formData.address} onChange={updateForm} placeholder="STREET ADDRESS" className="input-field uppercase" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">City <span className="text-primary">*</span></label>
                                                <input name="city" required value={formData.city} onChange={updateForm} placeholder="CITY" className="input-field uppercase" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">State <span className="text-primary">*</span></label>
                                                <input name="state" required value={formData.state} onChange={updateForm} placeholder="SC" className="input-field uppercase" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">ZIP Code <span className="text-primary">*</span></label>
                                                <input name="zip" required value={formData.zip} onChange={updateForm} placeholder="ZIP" className="input-field font-mono" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Fleet Selection & Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { id: 'bicycle', icon: '🚲', name: 'Bicycle' },
                                            { id: 'motorcycle', icon: '🛵', name: 'Motorcycle' },
                                            { id: 'car', icon: '🚗', name: 'Standard Auto' }
                                        ].map(v => (
                                            <button 
                                                key={v.id}
                                                type="button"
                                                onClick={() => setFormData({...formData, vehicleType: v.id})}
                                                className={`p-10 rounded-[3rem] border transition-all space-y-4 group/v shadow-xl ${
                                                    formData.vehicleType === v.id ? 'bg-primary/10 border-primary shadow-primary/10 scale-[1.02]' : 'bg-[#1c1916] border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-4xl group-hover/v:rotate-12 transition-transform duration-500">{v.icon}</div>
                                                <div className={`text-[12px] font-black uppercase tracking-widest italic ${formData.vehicleType === v.id ? 'text-primary' : 'text-slate-500'}`}>{v.name}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Color <span className="text-primary">*</span></label>
                                            <input name="vehicleColor" required value={formData.vehicleColor} onChange={updateForm} placeholder="SILVER" className="input-field uppercase" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Make/Model <span className="text-primary">*</span></label>
                                            <input name="vehicleMake" required value={formData.vehicleMake} onChange={updateForm} placeholder="TOYOTA CAMRY" className="input-field uppercase" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">License Plate <span className="text-primary">*</span></label>
                                            <input name="licensePlate" required value={formData.licensePlate} onChange={updateForm} placeholder="ABC-123" className="input-field uppercase font-mono" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Uploader Gateway</h4>
                                    <p className="text-slate-500 text-[11px] italic font-bold opacity-60 px-2 leading-relaxed">Please provide encrypted scans of your credentials. JPEG or PDF formats authorized.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Driver's License (Front) <span className="text-primary">*</span></label>
                                            <div className="relative border-2 border-dashed border-white/10 rounded-[3rem] h-48 bg-[#1c1916] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/[0.02] cursor-pointer transition-all group/upl overflow-hidden shadow-2xl">
                                                <input type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setIdFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <div className="text-5xl group-hover/upl:scale-110 transition-transform duration-700">🪪</div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover/upl:text-primary px-10 text-center">
                                                    {idFile ? <span className="text-primary underline">{idFile.name}</span> : "Link identity Matrix"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Proof of Insurance <span className="text-primary">*</span></label>
                                            <div className="relative border-2 border-dashed border-white/10 rounded-[3rem] h-48 bg-[#1c1916] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/[0.02] cursor-pointer transition-all group/upl shadow-2xl">
                                                <input type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setInsuranceFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <div className="text-5xl group-hover/upl:scale-110 transition-transform duration-700">📄</div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover/upl:text-primary px-10 text-center">
                                                    {insuranceFile ? <span className="text-primary underline">{insuranceFile.name}</span> : "Link Insurance Deck"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Vehicle Registration <span className="text-primary">*</span></label>
                                            <div className="relative border-2 border-dashed border-white/10 rounded-[3rem] h-48 bg-[#1c1916] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/[0.02] cursor-pointer transition-all group/upl shadow-2xl">
                                                <input type="file" required accept="image/*,.pdf" onChange={(e) => e.target.files && setRegistrationFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <div className="text-5xl group-hover/upl:scale-110 transition-transform duration-700">🚐</div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover/upl:text-primary px-10 text-center">
                                                    {registrationFile ? <span className="text-primary underline">{registrationFile.name}</span> : "Link Fleet Registry"}
                                                </p>
                                            </div>
                                        </div>

                                        <UploadZone label="Portrait ID Matrix" icon="📷" placeholder="Secure Portrait Uplink" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="space-y-10">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] italic border-b border-white/5 pb-6">Fleet Protocol Affirmation</h4>
                                    
                                    <div className="p-12 rounded-[4rem] bg-[#1c1916] border border-white/5 space-y-10 italic shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full opacity-50" />
                                        
                                        <div className="space-y-6 relative z-10">
                                            <p className="text-[13px] text-white leading-relaxed font-black uppercase tracking-tight opacity-90">Terms of Operational Engagement</p>
                                            <p className="text-[12px] text-slate-500 leading-relaxed font-bold whitespace-pre-line opacity-80">
                                                By finalizing this application, you authorize TrueServe to perform a comprehensive background and identity validation through our secure vetting nodes. {"\n\n"}
                                                You acknowledge that you are operating as an Independent Contractor (1099) and affirm that all provided credentials, vehicle details, and legal identifiers are accurate and current.
                                            </p>
                                        </div>
                                        
                                        <div className="pt-10 border-t border-white/5 relative z-10">
                                            <label className="flex items-center gap-8 cursor-pointer group/agree">
                                                <input name="hasSignedAgreement" type="checkbox" checked={formData.hasSignedAgreement} onChange={updateForm} className="hidden" />
                                                <div className={`w-12 h-12 rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-500 scale-110 ${
                                                    formData.hasSignedAgreement ? 'bg-primary border-primary text-black shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'bg-transparent border-white/10 group-hover/agree:border-primary/40'
                                                }`}>
                                                    {formData.hasSignedAgreement && <span className="text-2xl font-black">✓</span>}
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 group-hover/agree:text-white transition-colors">I Accept Fleet Protocols</span>
                                                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest opacity-60">Digital Signature Verification Level: ALPHA</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center pt-16 border-t border-white/5 gap-10">
                            <div className="flex items-center gap-4 opacity-30 group-hover/terminal:opacity-60 transition-opacity">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(245,158,11,1)]" />
                                <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] italic">
                                    Encrypted Uplink Active &bull; {new Date().getFullYear()}
                                </span>
                            </div>
                            
                            <div className="flex gap-6 w-full md:w-auto">
                                {currentStep > 1 && (
                                    <button type="button" onClick={prevStep} className="flex-1 md:flex-none badge-outline-white !py-6 !px-14 !text-[12px] !rounded-[2.5rem] opacity-40 hover:opacity-100 uppercase tracking-[0.3em] font-black shadow-xl">
                                        Reverse
                                    </button>
                                )}
                                
                                {currentStep < 4 ? (
                                    <button type="button" onClick={nextStep} className="flex-1 md:flex-none badge-solid-primary !py-6 !px-20 !text-[12px] !rounded-[2.5rem] h-glow shadow-2xl font-black italic">
                                        Advance Terminal →
                                    </button>
                                ) : (
                                    <button 
                                        type="submit" 
                                        disabled={isPending || !formData.hasSignedAgreement}
                                        className="flex-1 md:flex-none badge-solid-primary !py-6 !px-20 !text-[12px] !rounded-[2.5rem] h-glow disabled:opacity-20 shadow-2xl font-black italic"
                                    >
                                        {isPending ? "Transmitting..." : "INITIATE DEPLOYMENT ✓"}
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
                    border-radius: 1rem;
                    padding: 0.85rem 1.25rem;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 700;
                    outline: none;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
                }
                .input-field:focus {
                    border-color: rgba(245, 158, 11, 0.4);
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.03), inset 0 1px 2px rgba(0,0,0,0.2);
                    background: #23201a;
                }
                .input-field::placeholder {
                    color: rgba(255, 255, 255, 0.05);
                    letter-spacing: 0.15em;
                    font-style: italic;
                    font-size: 0.7rem;
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

function UploadZone({ label, icon, placeholder }: { label: string; icon: string; placeholder?: string }) {
    return (
        <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">{label} <span className="text-primary">*</span></label>
            <div className="w-full h-48 bg-[#1c1916] border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-4 group/upl hover:border-primary/50 hover:bg-primary/[0.03] cursor-pointer transition-all duration-700 shadow-xl overflow-hidden">
                <span className="text-5xl group-hover/upl:scale-110 transition-transform duration-700 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{icon}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 group-hover/upl:text-primary transition-colors">{placeholder || "Link Security Matrix"}</span>
            </div>
        </div>
    );
}
