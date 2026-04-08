"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

function DriverLoginPageContent() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signInWithProvider = async (provider: 'google') => {
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
        alert(`Failed to connect with ${provider}: ${error.message}`);
        setIsLoading(false);
    }
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const AMBER = '#e8a230';
    const CELL = 72;

    function drawCity() {
      ctx!.fillStyle = '#0e1218'; ctx!.fillRect(0, 0, W, H);
      const cols = Math.ceil(W / CELL) + 2; const rows = Math.ceil(H / CELL) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = (c - 0.5) * CELL + 8; const by = (r - 0.5) * CELL + 8;
          const bw = CELL - 16; const bh = CELL - 16;
          const shade = (r * 7 + c * 13) % 3;
          const fills = ['#111820', '#0f151e', '#13191f'];
          ctx!.fillStyle = fills[shade]; ctx!.fillRect(bx, by, bw, bh);
        }
      }
      ctx!.strokeStyle = 'rgba(232,162,48,0.07)'; ctx!.lineWidth = 1;
      for (let x = 0; x <= W; x += CELL) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke(); }
      for (let y = 0; y <= H; y += CELL) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke(); }
    }

    function makeRoute() {
      const snapX = (n: number) => Math.round(n / CELL) * CELL;
      const snapY = (n: number) => Math.round(n / CELL) * CELL;
      return {
        sx: snapX(Math.random() * W), sy: snapY(Math.random() * H),
        ex: snapX(Math.random() * W), ey: snapY(Math.random() * H),
        progress: Math.random(), speed: 0.003 + Math.random() * 0.004,
        color: AMBER, trailLen: 0.15 + Math.random() * 0.2, dotR: 2 + Math.random() * 2,
      };
    }

    let routes = Array.from({length: 10}, makeRoute);
    function animate() {
      drawCity();
      routes.forEach(r => {
        const x = r.sx + (r.ex - r.sx) * r.progress;
        const y = r.sy + (r.ey - r.sy) * r.progress;
        const grd = ctx!.createRadialGradient(x, y, 0, x, y, r.dotR * 4);
        grd.addColorStop(0, 'rgba(232,162,48,0.3)'); grd.addColorStop(1, 'transparent');
        ctx!.fillStyle = grd; ctx!.beginPath(); ctx!.arc(x, y, r.dotR * 4, 0, Math.PI*2); ctx!.fill();
        ctx!.fillStyle = AMBER; ctx!.beginPath(); ctx!.arc(x, y, r.dotR, 0, Math.PI*2); ctx!.fill();
        r.progress += r.speed; if (r.progress >= 1) { Object.assign(r, makeRoute()); r.progress = 0; }
      });
      requestAnimationFrame(animate);
    }
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e13] text-white selection:bg-[#e8a230]/30 overflow-x-hidden font-['DM_Sans',sans-serif]">
      <style dangerouslySetInnerHTML={{ __html: `
        .login-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        .s-left { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 44px 48px; }
        .anim-canvas { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; }
        .video-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to bottom,rgba(8,10,16,0.88) 0%,rgba(8,10,16,0.22) 38%,rgba(8,10,16,0.55) 68%,rgba(8,10,16,0.97) 100%),linear-gradient(to right,rgba(8,10,16,0.75) 0%,rgba(8,10,16,0.05) 60%); }
        .logo-row { position: absolute; top: 36px; left: 48px; z-index: 5; display: flex; align-items: center; gap: 10px; }
        .logo-circle { width: 38px; height: 38px; background: rgba(12,14,19,.85); border: 1.5px solid rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; border-radius: 50%; backdrop-filter: blur(14px); }
        .logo-name { font-size: 16px; font-weight: 700; color: #fff; text-shadow: 0 1px 10px rgba(0,0,0,.7); }
        .s-heading { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(48px, 6vw, 84px); font-weight: 800; font-style: italic; text-transform: uppercase; line-height: .92; margin-bottom: 14px; }
        .s-heading .w { color: #fff; } .s-heading .g { color: #e8a230; }
        .s-sub { font-size: 13px; color: rgba(255,255,255,.55); line-height: 1.65; max-width: 360px; margin-bottom: 28px; }
        .s-right { background: #0c0e13; border-left: 1px solid #1c1f28; display: flex; align-items: center; justify-content: center; padding: 48px 60px; }
        .s-form { width: 100%; max-width: 440px; }
        .form-title { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; margin-bottom: 3px; }
        .form-title span { color: #e8a230; }
        .form-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #444; margin-bottom: 40px; }
        .sec-label { font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #e8a230; padding-bottom: 8px; border-bottom: 1px solid #1c1f28; margin-bottom: 24px; }
        .fl { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-bottom: 8px; }
        .fi { width: 100%; background: #0f1219; border: 1px solid #2a2f3a; color: #ccc; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 14px 16px; outline: none; margin-bottom: 20px; transition: border-color .2s; border-radius: 2px; }
        .fi:focus { border-color: #e8a230; }
        .fi::placeholder { color: #2a2f3a; }
        .cta { width: 100%; background: #e8a230; border: none; color: #000; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; padding: 18px; cursor: pointer; transition: opacity .15s, transform .1s; border-radius: 2px; }
        .signup-note { font-size: 11px; color: #333; text-align: center; margin-top: 24px; }
        .signup-note a { color: #e8a230; cursor: pointer; font-weight: 600; text-decoration: none; }
      ` }} />

      <div className="login-wrap">
        <div className="s-left">
          <canvas ref={canvasRef} className="anim-canvas"></canvas>
          <div className="video-overlay"></div>
          <div className="logo-row">
            <Logo size="md" />
          </div>
          <div className="s-left-content relative z-10 px-4">
             <div className="s-heading animate-up"><div className="w">Driver</div><div className="g">Portal.</div></div>
             <div className="s-sub animate-up [animation-delay:0.1s]">Access the driver mission hub. Manage your active tasks, track yield, and synchronize your schedule with regional logistics.</div>
          </div>
        </div>

        <div className="s-right">
          <div className="s-form animate-up">
            <div className="form-title">Driver <span>Login.</span></div>
            <div className="form-sub">Secure mobile terminal for mission hubs</div>
            <div className="sec-label">Authentication Terminal</div>
            
            <form onSubmit={(e) => { e.preventDefault(); setIsLoading(true); setTimeout(() => router.push("/driver/dashboard"), 1000); }}>
              <div className="fl">Mobile Identifier (US Only) <span className="text-[#e24b4a]">*</span></div>
              <input className="fi" type="tel" placeholder="(336) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              
              <button className="cta" disabled={isLoading}>
                {isLoading ? "Requesting Uplink..." : "Request Access Code →"}
              </button>
            </form>

            <div className="login-or" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0', color: '#222', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <div style={{ flex: 1, height: '1px', background: '#1c1f28' }}></div>
              social uplink
              <div style={{ flex: 1, height: '1px', background: '#1c1f28' }}></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <button className="social-btn" onClick={() => signInWithProvider('google')} disabled={isLoading} style={{ width: '100%', padding: '14px', background: '#0f1219', border: '1px solid #1c1f28', borderRadius: '2px', color: '#fff', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span style={{ fontSize: '14px', color: '#e8a230' }}>G</span> Google Access
                </button>
            </div>

            <div className="signup-note">New to fleet? <Link href="/driver/signup">Apply for partnership</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverLoginPage() {
  return <Suspense fallback={null}><DriverLoginPageContent /></Suspense>;
}
