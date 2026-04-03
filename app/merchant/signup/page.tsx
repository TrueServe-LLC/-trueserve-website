"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/components/Logo";

export default function MerchantSignupPage() {
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

    // --- MERCHANT ANIMATION LOGIC (From Template) ---
    function drawGrid() {
      ctx!.strokeStyle = 'rgba(232,162,48,0.04)';
      ctx!.lineWidth = 1;
      const size = 52;
      for (let x = 0; x < W; x += size) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let y = 0; y < H; y += size) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }
    }

    const glows = [
      { x: 0.3, y: 0.35, r: 220, color: 'rgba(232,162,48,0.09)' },
      { x: 0.7, y: 0.6,  r: 180, color: 'rgba(232,162,48,0.06)' },
      { x: 0.15, y: 0.7, r: 140, color: 'rgba(200,130,30,0.05)' },
    ];

    const GOLD = '#e8a230';
    function drawFork(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
      ctx.save(); ctx.translate(x,y); ctx.globalAlpha = alpha;
      ctx.strokeStyle = GOLD; ctx.lineWidth = size * 0.12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, size*0.1); ctx.lineTo(0, size); ctx.stroke();
      [-0.22, 0, 0.22].forEach(dx => {
        ctx.beginPath(); ctx.moveTo(dx*size, -size); ctx.lineTo(dx*size, -size*0.1); ctx.stroke();
      });
      ctx.beginPath(); ctx.moveTo(-0.22*size, -size*0.4); ctx.lineTo(0.22*size, -size*0.4); ctx.stroke();
      ctx.restore();
    }
    function drawPlate(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
      ctx.save(); ctx.translate(x,y); ctx.globalAlpha = alpha;
      ctx.strokeStyle = GOLD; ctx.lineWidth = size * 0.08;
      ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, size*0.6, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    function drawBag(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
      ctx.save(); ctx.translate(x,y); ctx.globalAlpha = alpha;
      ctx.strokeStyle = GOLD; ctx.lineWidth = size * 0.1; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeRect(-size*0.6, -size*0.3, size*1.2, size*1.1);
      ctx.beginPath(); ctx.moveTo(-size*0.3, -size*0.3); ctx.quadraticCurveTo(-size*0.3, -size*0.9, 0, -size*0.9); ctx.quadraticCurveTo(size*0.3, -size*0.9, size*0.3, -size*0.3); ctx.stroke();
      ctx.restore();
    }
    function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
      ctx.save(); ctx.translate(x,y); ctx.globalAlpha = alpha;
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI*2/5) - Math.PI/2;
        const b = a + Math.PI/5;
        ctx.lineTo(Math.cos(a)*size, Math.sin(a)*size);
        ctx.lineTo(Math.cos(b)*size*0.4, Math.sin(b)*size*0.4);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    const shapes = ['fork', 'plate', 'bag', 'star'];
    const particles = Array.from({length: 18}, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vy: -(0.00012 + Math.random() * 0.00018),
      vx: (Math.random() - 0.5) * 0.00006,
      size: 8 + Math.random() * 14,
      alpha: 0.05 + Math.random() * 0.18,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      shape: shapes[i % shapes.length],
      phase: Math.random() * Math.PI * 2,
    }));

    const steam = Array.from({length: 30}, () => ({
      x: 0.25 + Math.random() * 0.5,
      y: 0.4 + Math.random() * 0.4,
      vy: -(0.0003 + Math.random() * 0.0006),
      alpha: 0,
      maxAlpha: 0.04 + Math.random() * 0.08,
      r: 4 + Math.random() * 12,
      life: 0, maxLife: 0.6 + Math.random() * 0.4,
      phase: Math.random(),
    }));

    let t = 0;
    function animate() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = '#0a0c12';
      ctx!.fillRect(0, 0, W, H);
      drawGrid();
      
      glows.forEach(g => {
        const grd = ctx!.createRadialGradient(g.x*W, g.y*H, 0, g.x*W, g.y*H, g.r);
        grd.addColorStop(0, g.color);
        grd.addColorStop(1, 'transparent');
        ctx!.fillStyle = grd;
        ctx!.beginPath(); ctx!.arc(g.x*W, g.y*H, g.r, 0, Math.PI*2); ctx!.fill();
      });

      steam.forEach(s => {
        s.life += 0.004;
        if (s.life > s.maxLife) {
          s.life = 0;
          s.x = 0.2 + Math.random() * 0.6;
          s.y = 0.35 + Math.random() * 0.45;
          s.r = 4 + Math.random() * 14;
        }
        const prog = s.life / s.maxLife;
        const alpha = prog < 0.3 ? (prog/0.3)*s.maxAlpha : prog < 0.7 ? s.maxAlpha : ((1-prog)/0.3)*s.maxAlpha;
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = 'rgba(232,162,48,1)';
        ctx!.beginPath();
        ctx!.arc(s.x*W + Math.sin(t*2 + s.phase*6)*8, (s.y - prog*0.2)*H, s.r*(1+prog*0.5), 0, Math.PI*2);
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });

      particles.forEach(p => {
        p.x += p.vx + Math.sin(t * 0.8 + p.phase) * 0.0001;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }

        ctx!.save();
        ctx!.translate(p.x * W, p.y * H);
        ctx!.rotate(p.rot);
        if (p.shape === 'fork')  drawFork(ctx!, 0, 0, p.size, p.alpha);
        if (p.shape === 'plate') drawPlate(ctx!, 0, 0, p.size, p.alpha);
        if (p.shape === 'bag')   drawBag(ctx!, 0, 0, p.size, p.alpha);
        if (p.shape === 'star')  drawStar(ctx!, 0, 0, p.size, p.alpha);
        ctx!.restore();
      });

      t += 0.016;
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e13] text-white selection:bg-[#e8a230]/30 overflow-x-hidden font-['DM_Sans',sans-serif]">
      {/* --- CSS FROM TEMPLATE --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        .signup-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        .s-left { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 44px 48px; }
        .anim-canvas { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; }
        .video-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to bottom,rgba(8,10,16,0.88) 0%,rgba(8,10,16,0.22) 38%,rgba(8,10,16,0.55) 68%,rgba(8,10,16,0.97) 100%),linear-gradient(to right,rgba(8,10,16,0.75) 0%,rgba(8,10,16,0.05) 60%); }
        .logo-row { position: absolute; top: 36px; left: 48px; z-index: 5; display: flex; align-items: center; gap: 10px; }
        .logo-circle { width: 38px; height: 38px; background: rgba(12,14,19,.85); border: 1.5px solid rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; border-radius: 50%; backdrop-filter: blur(14px); }
        .logo-name { font-size: 16px; font-weight: 700; color: #fff; text-shadow: 0 1px 10px rgba(0,0,0,.7); }
        .s-left-content { position: relative; z-index: 4; }
        .s-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(20,14,0,.8); border: 1px solid #3a2800; padding: 4px 12px; margin-bottom: 18px; backdrop-filter: blur(10px); }
        .s-badge-dot { width: 6px; height: 6px; background: #e8a230; border-radius: 50%; }
        .s-badge-txt { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #e8a230; }
        .s-heading { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(46px,5vw,72px); font-weight: 800; font-style: italic; text-transform: uppercase; line-height: .92; margin-bottom: 14px; }
        .s-heading .w { color: #fff; } .s-heading .g { color: #e8a230; }
        .s-sub { font-size: 13px; color: rgba(255,255,255,.55); line-height: 1.65; max-width: 360px; margin-bottom: 28px; }
        .s-feats { display: flex; flex-direction: column; gap: 4px; }
        .s-feat { display: flex; align-items: center; gap: 12px; padding: 11px 14px; background: rgba(8,10,16,0.72); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(16px); }
        .s-feat-icon { width: 32px; height: 32px; background: rgba(232,162,48,0.14); border: 1px solid rgba(232,162,48,0.24); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .s-feat-name { font-size: 12px; font-weight: 700; color: #e6e6e6; margin-bottom: 1px; }
        .s-feat-desc { font-size: 10px; color: rgba(255,255,255,.35); }
        .s-right { background: #0c0e13; border-left: 1px solid #1c1f28; display: flex; align-items: flex-start; justify-content: center; padding: 48px 60px; overflow-y: auto; }
        .s-form { width: 100%; max-width: 440px; }
        .form-title { font-family: 'Barlow Condensed', sans-serif; font-size: 30px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; margin-bottom: 3px; }
        .form-title span { color: #e8a230; }
        .form-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #444; margin-bottom: 28px; }
        .steps { display: flex; margin-bottom: 28px; }
        .step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; position: relative; }
        .step:not(:last-child)::after { content:''; position: absolute; top: 13px; left: 50%; width: 100%; height: 1px; background: #1c1f28; z-index: 0; }
        .step-c { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; font-family: 'DM Mono', monospace; position: relative; z-index: 1; border-radius: 2px; }
        .step-c.active { background: #e8a230; color: #000; }
        .step-c.pending { background: #131720; border: 1px solid #2a2f3a; color: #2a2f3a; }
        .step-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #2a2f3a; }
        .step.active .step-lbl { color: #e8a230; }
        .sec-label { font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #e8a230; padding-bottom: 8px; border-bottom: 1px solid #1c1f28; margin-bottom: 16px; }
        .fl { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-bottom: 6px; }
        .fi { width: 100%; background: #0f1219; border: 1px solid #2a2f3a; color: #ccc; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 12px 14px; outline: none; margin-bottom: 14px; transition: border-color .2s; border-radius: 2px; }
        .fi:focus { border-color: #e8a230; }
        .fi::placeholder { color: #2a2f3a; }
        .frow { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cta { width: 100%; background: #e8a230; border: none; color: #000; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; padding: 15px; cursor: pointer; transition: opacity .15s, transform .1s; margin-top: 4px; border-radius: 2px; }
        .login-note { font-size: 11px; color: #333; text-align: center; margin-top: 14px; }
        .login-note a { color: #e8a230; cursor: pointer; font-weight: 600; text-decoration: none; }
      ` }} />

      <div className="signup-wrap">
        {/* LEFT PANEL */}
        <div className="s-left">
          <canvas ref={canvasRef} className="anim-canvas"></canvas>
          <div className="video-overlay"></div>
          <div className="logo-row">
            <Logo size="md" />
          </div>
          <div className="s-left-content">
            <div className="s-badge"><span className="s-badge-dot"></span><span className="s-badge-txt">Partner Portal</span></div>
            <div className="s-heading"><div className="w">Partner</div><div className="g">Portal.</div></div>
            <div className="s-sub">Engineered for merchant success. List your restaurant, reach more customers, and grow without losing control of your brand.</div>
            <div className="s-feats">
              <div className="s-feat"><div className="s-feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10L5 7l2 2 3-4 2 2" stroke="#e8a230" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div><div className="s-feat-name">Rapid Growth</div><div className="s-feat-desc">Expand reach without losing control of your brand.</div></div></div>
              <div className="s-feat"><div className="s-feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h6M2 10h8" stroke="#e8a230" stroke-width="1.3" stroke-linecap="round"/></svg></div><div><div className="s-feat-name">Native Protocol</div><div className="s-feat-desc">Secure web-hook integrations for seamless orders.</div></div></div>
              <div className="s-feat"><div className="s-feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#e8a230" stroke-width="1.2"/><path d="M5 7l1.5 1.5L9.5 5" stroke="#e8a230" stroke-width="1.3" stroke-linecap="round"/></svg></div><div><div className="s-feat-name">Premium Fleet</div><div className="s-feat-desc">Professionally vetted brand ambassadors.</div></div></div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="s-right">
          <div className="s-form">
            <div className="form-title">Start Your <span>Partnership.</span></div>
            <div className="form-sub">Establish your digital storefront in minutes</div>
            <div className="steps">
              <div className="step active"><div className="step-c active">1</div><div className="step-lbl">Identity</div></div>
              <div className="step"><div className="step-c pending">2</div><div className="step-lbl">Geography</div></div>
              <div className="step"><div className="step-c pending">3</div><div className="step-lbl">Partnership</div></div>
            </div>
            <div className="sec-label">Identity & Credentials</div>
            <div className="fl">Business Name <span className="text-[#e24b4a]">*</span></div>
            <input className="fi" type="text" placeholder="Ex: The Gourmet Bistro" />
            <div className="frow">
              <div><div className="fl">Contact Name <span className="text-[#e24b4a]">*</span></div><input className="fi" type="text" placeholder="Legal representative" /></div>
              <div><div className="fl">Phone Number <span className="text-[#e24b4a]">*</span></div><input className="fi" type="tel" placeholder="(336) 000-0000" /></div>
            </div>
            <div className="frow">
              <div><div className="fl">Email Address <span className="text-[#e24b4a]">*</span></div><input className="fi" type="email" placeholder="partner@yourplace.com" /></div>
              <div><div className="fl">Password <span className="text-[#e24b4a]">*</span></div><input className="fi" type="password" placeholder="••••••••" /></div>
            </div>
            <button className="cta">Continue →</button>
            <div className="login-note">Existing partner? <Link href="/merchant/login">Login here</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}
