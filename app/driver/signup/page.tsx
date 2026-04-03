"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/components/Logo";

export default function DriverSignupPage() {
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
    const GREEN = '#3dd68c';
    const CELL = 72;

    // --- DRIVER ANIMATION LOGIC (From Template) ---
    function drawCity() {
      ctx!.fillStyle = '#0e1218';
      ctx!.fillRect(0, 0, W, H);
      const cols = Math.ceil(W / CELL) + 2;
      const rows = Math.ceil(H / CELL) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = (c - 0.5) * CELL + 8;
          const by = (r - 0.5) * CELL + 8;
          const bw = CELL - 16;
          const bh = CELL - 16;
          const shade = (r * 7 + c * 13) % 3;
          const fills = ['#111820', '#0f151e', '#13191f'];
          ctx!.fillStyle = fills[shade];
          ctx!.fillRect(bx, by, bw, bh);
          ctx!.fillStyle = 'rgba(232,162,48,0.06)';
          for (let wy = by + 6; wy < by + bh - 4; wy += 8) {
            for (let wx = bx + 6; wx < bx + bw - 4; wx += 10) {
              if (Math.sin(wx * 0.4 + wy * 0.7) > 0.2) {
                ctx!.fillRect(wx, wy, 4, 5);
              }
            }
          }
        }
      }
      ctx!.strokeStyle = 'rgba(232,162,48,0.07)';
      ctx!.lineWidth = 1;
      for (let x = 0; x <= W; x += CELL) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let y = 0; y <= H; y += CELL) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }
      ctx!.setLineDash([8, 14]);
      ctx!.strokeStyle = 'rgba(232,162,48,0.09)';
      ctx!.lineWidth = 0.8;
      for (let x = CELL/2; x <= W; x += CELL) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let y = CELL/2; y <= H; y += CELL) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }
      ctx!.setLineDash([]);
    }

    function makeRoute() {
      const snapX = (n: number) => Math.round(n / CELL) * CELL;
      const snapY = (n: number) => Math.round(n / CELL) * CELL;
      const sx = snapX(Math.random() * W);
      const sy = snapY(Math.random() * H);
      const ex = snapX(Math.random() * W);
      const ey = snapY(Math.random() * H);
      return {
        sx, sy, ex, ey,
        mid: Math.random() > 0.5 ? {x: ex, y: sy} : {x: sx, y: ey},
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        color: Math.random() > 0.5 ? AMBER : GREEN,
        alpha: 0.5 + Math.random() * 0.5,
        dotR: 3 + Math.random() * 3,
        trailLen: 0.15 + Math.random() * 0.2,
      };
    }

    let routes = Array.from({length: 14}, makeRoute);
    function getPos(r: any, prog: number) {
      const half = 0.5;
      if (prog < half) {
        const t = prog / half;
        return { x: r.sx + (r.mid.x - r.sx)*t, y: r.sy + (r.mid.y - r.sy)*t };
      } else {
        const t = (prog - half) / half;
        return { x: r.mid.x + (r.ex - r.mid.x)*t, y: r.mid.y + (r.ey - r.mid.y)*t };
      }
    }

    const pins = Array.from({length: 8}, () => ({
      x: Math.round((0.1 + Math.random()*0.8) * W / CELL) * CELL,
      y: Math.round((0.1 + Math.random()*0.8) * H / CELL) * CELL,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? AMBER : GREEN,
    }));

    let t = 0;
    function animate() {
      drawCity();
      routes.forEach(r => {
        const steps = 30;
        for (let i = 0; i < steps; i++) {
          const tp = r.progress - (i / steps) * r.trailLen;
          if (tp < 0) continue;
          const pos = getPos(r, tp % 1);
          const alpha = ((steps - i) / steps) * r.alpha * 0.35;
          ctx!.globalAlpha = alpha;
          ctx!.fillStyle = r.color;
          ctx!.beginPath(); ctx!.arc(pos.x, pos.y, r.dotR * 0.5, 0, Math.PI*2); ctx!.fill();
        }
        ctx!.globalAlpha = 1;
        const pos = getPos(r, r.progress);
        const grd = ctx!.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r.dotR * 4);
        grd.addColorStop(0, r.color.replace('rgb', 'rgba').replace(')', ',0.4)'));
        grd.addColorStop(1, 'transparent');
        ctx!.fillStyle = grd;
        ctx!.beginPath(); ctx!.arc(pos.x, pos.y, r.dotR*4, 0, Math.PI*2); ctx!.fill();
        ctx!.globalAlpha = r.alpha;
        ctx!.fillStyle = r.color;
        ctx!.beginPath(); ctx!.arc(pos.x, pos.y, r.dotR, 0, Math.PI*2); ctx!.fill();
        ctx!.globalAlpha = 1;
        r.progress += r.speed;
        if (r.progress >= 1) { Object.assign(r, makeRoute()); r.progress = 0; }
      });

      pins.forEach(p => {
        const pulse = Math.sin(t * 2 + p.pulse);
        const pr = 4 + pulse * 1.5;
        ctx!.globalAlpha = 0.12 + pulse * 0.06;
        ctx!.strokeStyle = p.color;
        ctx!.lineWidth = 1;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, pr * 3, 0, Math.PI*2); ctx!.stroke();
        ctx!.globalAlpha = 0.2 + pulse * 0.1;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, pr * 2, 0, Math.PI*2); ctx!.stroke();
        ctx!.globalAlpha = 0.8;
        ctx!.fillStyle = p.color;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, pr, 0, Math.PI*2); ctx!.fill();
        ctx!.globalAlpha = 1;
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
      <style dangerouslySetInnerHTML={{ __html: `
        .signup-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        .s-left { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 44px 48px; }
        .anim-canvas { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; }
        .video-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to bottom,rgba(8,10,16,0.9) 0%,rgba(8,10,16,0.22) 38%,rgba(8,10,16,0.55) 68%,rgba(8,10,16,0.97) 100%),linear-gradient(to right,rgba(8,10,16,0.75) 0%,rgba(8,10,16,0.05) 60%); }
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
        .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 14px; }
        .check-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(8,10,16,0.72); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); }
        .chk { width: 16px; height: 16px; background: rgba(232,162,48,0.14); border: 1px solid rgba(232,162,48,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .check-txt { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,.4); }
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
        .vehicle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 14px; }
        .vehicle-opt { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; background: #0f1219; border: 1px solid #2a2f3a; cursor: pointer; transition: all .15s; text-align: center; border-radius: 2px; }
        .vehicle-opt.selected { background: #1a1200; border-color: #e8a230; }
        .vehicle-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444; }
        .vehicle-opt.selected .vehicle-lbl { color: #e8a230; }
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
            <div className="s-badge"><span className="s-badge-dot"></span><span className="s-badge-txt">Fleet Protocols</span></div>
            <div className="s-heading"><div className="w">Fleet</div><div className="g">Protocols.</div></div>
            <div className="s-sub">Your city, your schedule, your earnings. Join the TrueServe fleet and start making money delivering for local restaurants today.</div>
            <div className="s-feats">
              <div className="s-feat"><div className="s-feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#e8a230" stroke-width="1.2"/><path d="M7 4.5v3l1.5 1" stroke="#e8a230" stroke-width="1.2" stroke-linecap="round"/></svg></div><div><div className="s-feat-name">Fair Pay</div><div className="s-feat-desc">Competitive base pay + tips deposited weekly.</div></div></div>
              <div className="s-feat"><div className="s-feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1" stroke="#e8a230" stroke-width="1.2"/><path d="M2 5h10M5 2v3" stroke="#e8a230" stroke-width="1.2" stroke-linecap="round"/></svg></div><div><div className="s-feat-name">Flex Hours</div><div className="s-feat-desc">Drive when you want — you are your own boss.</div></div></div>
              <div className="s-feat"><div className="s-feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2C4.8 2 3 3.8 3 6c0 3 4 7 4 7s4-4 4-7c0-2.2-1.8-4-4-4z" stroke="#e8a230" stroke-width="1.2"/><circle cx="7" cy="6" r="1.2" stroke="#e8a230" stroke-width="1"/></svg></div><div><div className="s-feat-name">Local Pride</div><div className="s-feat-desc">Deliver for the best neighborhood restaurants.</div></div></div>
            </div>
            <div className="check-grid">
              <div className="check-item"><div className="chk"><svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2 2 4-4" stroke="#e8a230" stroke-width="1.2" stroke-linecap="round"/></svg></div><div className="check-txt">18+ years old</div></div>
              <div className="check-item"><div className="chk"><svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2 2 4-4" stroke="#e8a230" stroke-width="1.2" stroke-linecap="round"/></svg></div><div className="check-txt">Driver's license</div></div>
              <div className="check-item"><div className="chk"><svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2 2 4-4" stroke="#e8a230" stroke-width="1.2" stroke-linecap="round"/></svg></div><div className="check-txt">Vehicle or bike</div></div>
              <div className="check-item"><div className="chk"><svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2 2 4-4" stroke="#e8a230" stroke-width="1.2" stroke-linecap="round"/></svg></div><div className="check-txt">Smartphone</div></div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="s-right">
          <div className="s-form">
            <div className="form-title">Start Your <span>Application.</span></div>
            <div className="form-sub">5 minutes · Approval within 24 hours</div>
            <div className="steps">
              <div className="step active"><div className="step-c active">1</div><div className="step-lbl">You</div></div>
              <div className="step"><div className="step-c pending">2</div><div className="step-lbl">Vehicle</div></div>
              <div className="step"><div className="step-c pending">3</div><div className="step-lbl">Documents</div></div>
              <div className="step"><div className="step-c pending">4</div><div className="step-lbl">Approval</div></div>
            </div>
            <div className="sec-label">Personal Information</div>
            <div className="frow">
              <div><div className="fl">First Name <span className="text-[#e24b4a]">*</span></div><input className="fi" type="text" placeholder="Alex" /></div>
              <div><div className="fl">Last Name <span className="text-[#e24b4a]">*</span></div><input className="fi" type="text" placeholder="Johnson" /></div>
            </div>
            <div className="frow">
              <div><div className="fl">Email Address <span className="text-[#e24b4a]">*</span></div><input className="fi" type="email" placeholder="you@email.com" /></div>
              <div><div className="fl">Phone Number <span className="text-[#e24b4a]">*</span></div><input className="fi" type="tel" placeholder="(336) 000-0000" /></div>
            </div>
            <div className="frow">
              <div><div className="fl">Date of Birth <span className="text-[#e24b4a]">*</span></div><input className="fi" type="date" /></div>
              <div><div className="fl">Zip Code <span className="text-[#e24b4a]">*</span></div><input className="fi" type="text" placeholder="28306" maxLength={5} /></div>
            </div>
            <div className="fl">Vehicle Type <span className="text-[#e24b4a]">*</span></div>
            <div className="vehicle-grid">
              <div className="vehicle-opt selected">
                <svg width="28" height="20" viewBox="0 0 28 20" fill="none"><rect x="2" y="7" width="24" height="10" rx="2" stroke="#e8a230" stroke-width="1.4"/><path d="M6 7L8 3h12l2 4" stroke="#e8a230" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="17" r="2.5" stroke="#e8a230" stroke-width="1.4"/><circle cx="20" cy="17" r="2.5" stroke="#e8a230" stroke-width="1.4"/></svg>
                <div className="vehicle-lbl">Car</div>
              </div>
              <div className="vehicle-opt">
                <svg width="28" height="20" viewBox="0 0 28 20" fill="none"><circle cx="8" cy="14" r="4" stroke="#e8a230" stroke-width="1.4"/><circle cx="20" cy="14" r="4" stroke="#e8a230" stroke-width="1.4"/><path d="M8 14h12M14 10V6M14 6l-4 4M14 6l4 4" stroke="#e8a230" stroke-width="1.4" stroke-linecap="round"/></svg>
                <div className="vehicle-lbl">Bicycle</div>
              </div>
              <div className="vehicle-opt">
                <svg width="28" height="20" viewBox="0 0 28 20" fill="none"><circle cx="7" cy="14" r="4" stroke="#e8a230" stroke-width="1.4"/><circle cx="21" cy="14" r="4" stroke="#e8a230" stroke-width="1.4"/><path d="M11 14h6M14 10l-3-6h5l2 3" stroke="#e8a230" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <div className="vehicle-lbl">Scooter</div>
              </div>
            </div>
            <div className="fl">Create Password <span className="text-[#e24b4a]">*</span></div>
            <input className="fi" type="password" placeholder="At least 8 characters" />
            <button className="cta">Continue →</button>
            <div className="login-note">Already a driver? <Link href="/driver/login">Login here</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}
