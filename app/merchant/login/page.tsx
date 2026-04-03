"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthSession, loginAsDemoMerchant } from "@/app/auth/actions";
import Logo from "@/components/Logo";

function MerchantLoginPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const isPreview = document.cookie.includes("preview_mode=true");
      if (isPreview) { router.push("/merchant/dashboard"); return; }
      const session = await getAuthSession();
      if (session.isAuth && session.role === 'MERCHANT') { router.push("/merchant/dashboard"); }
    };
    checkUser();
  }, [router]);

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

    function drawGrid() {
      ctx!.strokeStyle = 'rgba(232,162,48,0.04)'; ctx!.lineWidth = 1;
      const size = 52;
      for (let x = 0; x < W; x += size) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke(); }
      for (let y = 0; y < H; y += size) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke(); }
    }

    const GOLD = '#e8a230';
    function drawFork(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
      ctx.save(); ctx.translate(x,y); ctx.globalAlpha = alpha; ctx.strokeStyle = GOLD; ctx.lineWidth = size * 0.12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, size*0.1); ctx.lineTo(0, size); ctx.stroke();
      [-0.22, 0, 0.22].forEach(dx => { ctx.beginPath(); ctx.moveTo(dx*size, -size); ctx.lineTo(dx*size, -size*0.1); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(-0.22*size, -size*0.4); ctx.lineTo(0.22*size, -size*0.4); ctx.stroke(); ctx.restore();
    }
    const shapes = ['fork', 'plate', 'bag', 'star'];
    const particles = Array.from({length: 12}, (_, i) => ({
      x: Math.random(), y: Math.random(), vy: -(0.0001 + Math.random() * 0.00015),
      size: 8 + Math.random() * 12, alpha: 0.05 + Math.random() * 0.15,
      rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.006, 
      shape: shapes[i % shapes.length], phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    function animate() {
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = '#0a0c12'; ctx!.fillRect(0, 0, W, H); drawGrid();
      particles.forEach(p => {
        p.x += Math.sin(t * 0.8 + p.phase) * 0.0001; p.y += p.vy; p.rot += p.rotSpeed;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        ctx!.save(); ctx!.translate(p.x * W, p.y * H); ctx!.rotate(p.rot);
        drawFork(ctx!, 0, 0, p.size, p.alpha); ctx!.restore();
      });
      t += 0.016; requestAnimationFrame(animate);
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
             <div className="s-heading animate-up"><div className="w">Partner</div><div className="g">Command.</div></div>
             <div className="s-sub animate-up [animation-delay:0.1s]">Access your storefront infrastructure. Monitor operations, sync inventory, and scale your merchant footprint.</div>
          </div>
        </div>

        <div className="s-right">
          <div className="s-form animate-up">
            <div className="form-title">Merchant <span>Access.</span></div>
            <div className="form-sub">Secure uplink for partnership protocols</div>
            <div className="sec-label">Credentials Terminal</div>
            
            <form onSubmit={(e) => { e.preventDefault(); setIsLoading(true); setTimeout(() => router.push("/merchant/dashboard"), 1000); }}>
              <div className="fl">Identifier <span className="text-[#e24b4a]">*</span></div>
              <input className="fi" type="email" placeholder="partner@yourplace.com" required />
              <div className="fl">Security Passkey <span className="text-[#e24b4a]">*</span></div>
              <input className="fi" type="password" placeholder="••••••••" required />
              
              <button className="cta" disabled={isLoading}>
                {isLoading ? "Authorizing Connection..." : "Establish Session →"}
              </button>
            </form>

            <button onClick={loginAsDemoMerchant} className="w-full mt-4 bg-transparent border border-white/5 py-4 text-[9px] font-bold tracking-[0.2em] text-[#444] hover:border-[#e8a230]/30 hover:text-[#e8a230] transition-all uppercase rounded-[2px]">
              Quick Pilot Access (Merchant)
            </button>

            <div className="signup-note">New to network? <Link href="/merchant/signup">Apply for partnership</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MerchantLoginPage() {
  return <Suspense fallback={null}><MerchantLoginPageContent /></Suspense>;
}
