"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Activity, Clock, MapPin } from "lucide-react";

function DriverSignupContent() {
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen bg-[#0c0e13] text-white font-sans selection:bg-[#e8a230]/30 selection:text-black overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                .bebas { font-family: 'Bebas Neue', sans-serif; }
                .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
                
                .fi-input {
                    background: #131720;
                    border: 1px solid #2a2f3a;
                    border-radius: 4px;
                    padding: 12px 16px;
                    width: 100%;
                    outline: none;
                    font-size: 14px;
                    color: #fff;
                    transition: border-color 0.2s;
                }
                .fi-input:focus { border-color: #e8a230; }
                .fi-input::placeholder { color: #555; }
                
                .fi-label {
                    font-family: 'Barlow Condensed', sans-serif;
                    font-weight: 800;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #e8a230;
                    margin-bottom: 8px;
                    display: block;
                }

                .vehicle-card {
                    background: #131720;
                    border: 1px solid #2a2f3a;
                    border-radius: 4px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .vehicle-card.active {
                    background: rgba(232,162,48,0.05);
                    border-color: #e8a230;
                }
                .vehicle-card:hover:not(.active) {
                    border-color: #555;
                }
            ` }} />

            {/* ── TOP NAV TABS ── */}
            <div className="flex bg-[#080a0f] border-b border-white/5">
                <Link href="/merchant/signup" className="px-8 py-4 text-[#555] hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">Merchant Sign-up</Link>
                <Link href="/driver/signup" className="px-8 py-4 bg-[#e8a230] text-black font-bold text-xs uppercase tracking-widest">Driver Sign-up</Link>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-50px)]">
                
                {/* ── LEFT COLUMN ── */}
                <div className="w-full lg:w-1/2 p-10 lg:p-24 space-y-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-[#e8a230] flex items-center justify-center">
                            <span className="text-[#e8a230] text-xl">✓</span>
                        </div>
                        <span className="barlow-cond text-2xl font-black uppercase tracking-widest">TrueServe</span>
                    </div>

                    <div className="space-y-8">
                        <div className="inline-block px-3 py-1 border border-[#e8a230] rounded flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#e8a230]" />
                            <span className="barlow-cond font-black text-[10px] uppercase tracking-[0.2em] text-[#e8a230]">FLEET PROTOCOLS</span>
                        </div>

                        <h1 className="italic text-white text-[80px] lg:text-[110px] leading-[0.85] font-black uppercase tracking-tighter">
                            FLEET<br />
                            <span className="text-[#e8a230]">PROTOCOLS.</span>
                        </h1>

                        <p className="max-w-md text-[#888] font-medium text-lg leading-relaxed">
                            Your city, your schedule, your earnings. Join the TrueServe fleet and start making money delivering for local restaurants today.
                        </p>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        {[
                            { title: "Fair Pay", desc: "Competitive base pay + tips deposited weekly.", icon: "🕒" },
                            { title: "Flex Hours", desc: "Drive when you want — you are your own boss.", icon: "🗓️" },
                            { title: "Local Pride", desc: "Deliver for the best neighborhood restaurants.", icon: "📍" }
                        ].map((card) => (
                            <div key={card.title} className="bg-[#0f1219] border border-white/5 p-6 flex items-center gap-6 rounded-sm">
                                <div className="w-12 h-12 bg-[#131720] border border-[#2a2f3a] rounded flex items-center justify-center text-[#e8a230] text-xl">{card.icon}</div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{card.title}</h3>
                                    <p className="text-[#555] text-sm">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-10 pt-10">
                        <div className="flex items-center gap-3">
                            <span className="text-[#e8a230]">✓</span>
                            <span className="barlow-cond font-black text-[11px] uppercase tracking-widest text-[#555]">18+ YEARS OLD</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#e8a230]">✓</span>
                            <span className="barlow-cond font-black text-[11px] uppercase tracking-widest text-[#555]">DRIVER'S LICENSE</span>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="w-full lg:w-1/2 bg-[#0c0e13] border-l border-white/5 p-10 lg:p-24 flex items-center justify-center">
                    <div className="max-w-[600px] w-full">
                        <div className="mb-12">
                            <h2 className="italic text-white text-5xl font-black uppercase tracking-tight">START YOUR <span className="text-[#e8a230]">APPLICATION.</span></h2>
                            <p className="barlow-cond font-black text-[10px] uppercase tracking-[0.3em] text-[#555] mt-2">5 MINUTES · APPROVAL WITHIN 24 HOURS</p>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center justify-between relative mb-12">
                            <div className="absolute top-[14px] left-8 right-8 h-[1px] bg-white/5" />
                            {[
                                { id: 1, label: "YOU" },
                                { id: 2, label: "VEHICLE" },
                                { id: 3, label: "DOCUMENTS" },
                                { id: 4, label: "APPROVAL" }
                            ].map((s) => (
                                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${s.id === 1 ? 'bg-[#e8a230] text-black' : 'bg-[#131720] border border-[#2a2f3a] text-[#555]'}`}>{s.id}</div>
                                    <span className={`barlow-cond font-black text-[10px] uppercase tracking-widest ${s.id === 1 ? 'text-[#e8a230]' : 'text-[#2a2f3a]'}`}>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="barlow-cond font-black text-[12px] uppercase tracking-[0.2em] text-[#e8a230] border-b border-white/5 pb-4 mb-8 text-white">PERSONAL INFORMATION</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="fi-label">FIRST NAME *</label>
                                            <input type="text" className="fi-input" placeholder="Alex" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="fi-label">LAST NAME *</label>
                                            <input type="text" className="fi-input" placeholder="Johnson" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="fi-label">EMAIL ADDRESS *</label>
                                            <input type="email" className="fi-input" placeholder="you@email.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="fi-label">PHONE NUMBER *</label>
                                            <input type="tel" className="fi-input" placeholder="(336) 000-0000" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="fi-label">DATE OF BIRTH *</label>
                                            <input type="text" className="fi-input" placeholder="04 / 03 / 1996" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="fi-label">ZIP CODE *</label>
                                            <input type="text" className="fi-input" placeholder="28306" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="fi-label">VEHICLE TYPE *</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="vehicle-card active">
                                                <div className="text-xl mb-2">🚗</div>
                                                <div className="barlow-cond font-black text-[10px] uppercase tracking-widest text-white">CAR</div>
                                            </div>
                                            <div className="vehicle-card text-[#555]">
                                                <div className="text-xl mb-2">🚲</div>
                                                <div className="barlow-cond font-black text-[10px] uppercase tracking-widest">BICYCLE</div>
                                            </div>
                                            <div className="vehicle-card text-[#555]">
                                                <div className="text-xl mb-2">🛵</div>
                                                <div className="barlow-cond font-black text-[10px] uppercase tracking-widest">SCOOTER</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="fi-label">CREATE PASSWORD *</label>
                                        <input type="password" className="fi-input" placeholder="At least 8 characters" />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-[#e8a230] text-black font-black uppercase text-sm py-5 rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                CONTINUE →
                            </button>
                            
                            <div className="text-center">
                                <p className="text-[#555] text-xs font-bold uppercase tracking-widest">
                                    Already apply? <Link href="/driver/login" className="text-[#e8a230] hover:underline">Check status</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DriverSignupPage() {
    return <DriverSignupContent />;
}
