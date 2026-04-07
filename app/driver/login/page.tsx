"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthSession, loginAsDemoDriver } from "@/app/auth/actions";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

function DriverLoginPageContent() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                prompt: 'select_account',
            }
        }
    });

    if (error) {
        alert(`Authentication Failure: ${error.message}`);
        setIsLoading(false);
    }
  };

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return alert("Please enter your mobile identifier.");
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`,
    });

    if (error) {
      alert(`Carrier Link Rejected: ${error.message}`);
    } else {
      setStep("otp");
    }
    setIsLoading(false);
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return alert("Please enter the 6-digit mission code.");
    setIsLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`,
      token: otp,
      type: "sms",
    });

    if (error) {
      alert(`Terminal Clearance Denied: ${error.message}`);
    } else {
      router.push("/driver/dashboard");
    }
    setIsLoading(false);
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number;

    const resize = () => {
      if (!canvas.parentElement) return;
      W = canvas.width = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const AMBER = '#e8a230';
    const CELL = 72;

    function drawCity() {
      ctx!.fillStyle = '#06080b'; ctx!.fillRect(0, 0, W, H);
      const cols = Math.ceil(W / CELL) + 2; const rows = Math.ceil(H / CELL) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = (c - 0.5) * CELL + 12; const by = (r - 0.5) * CELL + 12;
          const bw = CELL - 24; const bh = CELL - 24;
          const shade = (r * 7 + c * 13) % 4;
          const fills = ['#0a0e14', '#080c12', '#0c1016', '#05070a'];
          ctx!.fillStyle = fills[shade]; ctx!.fillRect(bx, by, bw, bh);
        }
      }
      ctx!.strokeStyle = 'rgba(232,162,48,0.04)'; ctx!.lineWidth = 1;
      for (let x = 0; x <= W; x += CELL) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke(); }
      for (let y = 0; y <= H; y += CELL) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke(); }
    }

    function makeRoute() {
      const snapX = (n: number) => Math.round(n / CELL) * CELL;
      const snapY = (n: number) => Math.round(n / CELL) * CELL;
      return {
        sx: snapX(Math.random() * W), sy: snapY(Math.random() * H),
        ex: snapX(Math.random() * W), ey: snapY(Math.random() * H),
        progress: Math.random(), speed: 0.002 + Math.random() * 0.003,
        color: AMBER, trailLen: 0.2 + Math.random() * 0.3, dotR: 2 + Math.random() * 2,
      };
    }

    let routes = Array.from({length: 12}, makeRoute);
    function animate() {
      drawCity();
      routes.forEach(r => {
        const x = r.sx + (r.ex - r.sx) * r.progress;
        const y = r.sy + (r.ey - r.sy) * r.progress;
        
        ctx!.shadowBlur = 15;
        ctx!.shadowColor = AMBER;
        ctx!.fillStyle = 'rgba(232,162,48,0.4)'; ctx!.beginPath(); ctx!.arc(x, y, r.dotR * 3, 0, Math.PI*2); ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.fillStyle = AMBER; ctx!.beginPath(); ctx!.arc(x, y, r.dotR, 0, Math.PI*2); ctx!.fill();
        r.progress += r.speed; if (r.progress >= 1) { Object.assign(r, makeRoute()); r.progress = 0; }
      });
      requestAnimationFrame(animate);
    }
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] selection:bg-[#e8a230]/30 overflow-x-hidden font-barlow-cond">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            {/* TERMINAL ANIMATION SIDE */}
            <div className="relative overflow-hidden hidden lg:flex flex-col justify-end p-20 border-r border-white/5 bg-[#06080b]">
                <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40"></canvas>
                <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-[#0c0e13] via-transparent to-transparent"></div>
                
                <div className="relative z-10 space-y-6">
                    <div className="px-6 py-2 bg-black/60 border border-white/10 rounded-full w-fit backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#3dd68c] animate-pulse shadow-[0_0_10px_#3dd68c]"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3dd68c] italic">Regional Grid Live</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-8xl font-bebas italic text-white uppercase leading-[0.9] tracking-tighter">
                            Driver <span className="text-[#e8a230]">Portal.</span>
                        </h1>
                        <p className="text-slate-500 font-semibold uppercase tracking-[0.4em] text-[11px] italic">// Fleet ID: East-Coast-Sector-Alpha</p>
                    </div>
                    
                    <p className="text-sm text-slate-400 max-w-sm font-medium leading-relaxed italic opacity-60">
                        Secure mission hub for authorized fleet partners. Manage route manifests, synchronize regional logistics, and track yield performance in real-time.
                    </p>
                </div>

                {/* Scanline Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
            </div>

            {/* AUTHENTICATION SIDE */}
            <div className="relative flex items-center justify-center p-8 bg-[#0c0e13]">
                <div className="absolute top-12 left-12 lg:hidden">
                    <Logo size="sm" />
                </div>
                
                <div className="w-full max-w-md space-y-12 animate-fade-in-up">
                    <div className="lg:hidden mb-20">
                         <div className="text-5xl font-bebas italic text-white uppercase mb-2">Driver Portal.</div>
                         <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#e8a230] italic">// Mission Ready</div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-4xl font-bebas italic text-white uppercase tracking-wider">Terminal Access</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Secure Uplink Protocol v2.5</p>
                    </div>

                    <div className="space-y-10">
                        <div className="pb-4 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8a230] italic">
                                {step === "phone" ? "Step 01: Identification" : "Step 02: Verification"}
                            </span>
                            <div className="flex gap-1">
                                <div className={`w-12 h-1 rounded-full ${step === 'phone' ? 'bg-[#e8a230]' : 'bg-[#e8a230]/20'}`}></div>
                                <div className={`w-12 h-1 rounded-full ${step === 'otp' ? 'bg-[#e8a230]' : 'bg-white/5'}`}></div>
                            </div>
                        </div>

                        {step === "phone" ? (
                            <form onSubmit={requestOTP} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic block ml-2">Mobile Terminal ID (US Only)</label>
                                    <input 
                                        type="tel" 
                                        placeholder="+1 (555) 000-0000" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 px-8 text-white font-bold tracking-widest outline-none focus:border-[#e8a230]/50 focus:bg-white/[0.04] transition-all placeholder:text-slate-800"
                                        required 
                                    />
                                </div>
                                <button className="w-full bg-[#e8a230] hover:bg-[#f5b342] text-black font-black uppercase tracking-[0.3em] py-5 rounded-2xl text-[11px] transition-all hover:scale-[1.02] active:scale-95 shadow-glow shadow-[#e8a230]/20 italic" disabled={isLoading}>
                                    {isLoading ? "Requesting Uplink..." : "Initialize Manifest →"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={verifyOTP} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic block ml-2">Mission Authorization Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="000 000" 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        maxLength={6} 
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-6 px-8 text-center text-4xl font-bebas italic text-[#e8a230] tracking-[0.5em] outline-none focus:border-[#e8a230]/50 transition-all"
                                        required 
                                    />
                                </div>
                                <button className="w-full bg-[#e8a230] text-black font-black uppercase tracking-[0.3em] py-5 rounded-2xl text-[11px] transition-all hover:scale-[1.02] italic shadow-glow shadow-[#e8a230]/20" disabled={isLoading}>
                                    {isLoading ? "Validating Signal..." : "Complete Handshake →"}
                                </button>
                                <button onClick={() => setStep("phone")} className="w-full text-center text-[10px] font-black text-slate-600 uppercase tracking-widest italic hover:text-white transition-colors py-2">
                                    ← Recalibrate ID
                                </button>
                            </form>
                        )}
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em] text-slate-800 italic"><span className="bg-[#0c0e13] px-6">Terminal Uplink</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => signInWithProvider('google')} className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all italic">
                                <span className="text-[#e8a230]">G</span> Google Auth
                            </button>
                            <button onClick={loginAsDemoDriver} className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all italic">
                                🚀 Fleet Alpha
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-xs font-semibold text-slate-600 italic">
                        Unregistered Node? <Link href="/driver/signup" className="text-[#e8a230] font-black uppercase tracking-widest ml-2 hover:underline">Apply for Fleet Authorization</Link>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default function DriverLoginPage() {
  return <Suspense fallback={null}><DriverLoginPageContent /></Suspense>;
}
