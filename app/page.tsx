"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const [addr, setAddr] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Basic client-side check for userId cookie
    const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    if (match) setUserId(match[2]);
  }, []);

  const doSearch = () => {
    if (!addr.trim()) return;
    router.push(`/restaurants?address=${encodeURIComponent(addr.trim())}`);
  };


  return (
    <div className="min-h-screen bg-[#0a0d12] text-[#c8d8e8] selection:bg-[#e8a020]/30 selection:text-white relative overflow-hidden">
      {/* TOPBAR */}
      <div className="topbar bg-[#10151e] border-b border-[#1e2c3a] px-8 md:px-12 flex justify-between items-center h-[68px] sticky top-0 z-50 shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
        <Logo size="sm" />
        <div className="hidden md:flex items-center gap-12 text-[13px] font-extrabold uppercase tracking-widest text-[#7a90a8]">
          <Link href="/restaurants" className="hover:text-[#e8a020] transition-colors">Order Food</Link>
          <Link href="/merchant/signup" className="hover:text-[#e8a020] transition-colors">For Merchants</Link>
          <Link href="/driver/signup" className="hover:text-[#e8a020] transition-colors">Driver Hub</Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a5060]">Network Status</div>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_6px_#22c55e]"></div>
              <span className="text-[11px] font-bold text-[#22c55e]">Live</span>
            </div>
          </div>
          {userId ? (
            <Link href="/user/settings" className="bg-[#161d2a] hover:bg-[#1e2c3a] border border-[#1e2c3a] px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all">Account</Link>
          ) : (
            <Link href="/login" className="bg-[#161d2a] hover:bg-[#1e2c3a] border border-[#1e2c3a] px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all">Sign In</Link>
          )}
          <Link href="/merchant/signup" className="bg-[#e8a020] hover:bg-[#c87010] text-[#0a0d12] px-6 py-2.5 rounded-xl text-[13px] font-extrabold shadow-[0_4px_20px_rgba(232,160,32,0.3)] transition-all uppercase tracking-widest">Join Network</Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 md:gap-14 items-start">
        
        <div className="flex flex-col gap-6 md:gap-8">
          {/* HERO CARD */}
          <div className="bg-gradient-to-br from-[#0d1520] to-[#13200d] border border-[#1e2c3a] rounded-[24px] p-10 md:p-14 relative overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] group">
             <div className="absolute right-10 top-10 text-9xl opacity-[0.03] group-hover:opacity-10 transition-all duration-700 pointer-events-none transform rotate-12">🍴</div>
             
             <div className="inline-flex items-center gap-2 bg-[#e8a020]/10 border border-[#e8a020]/30 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#e8a020] mb-8">
               🛡️ Restaurant Delivery
             </div>

             <h1 className="font-['Barlow_Condensed',sans-serif] text-[72px] md:text-[96px] font-extrabold italic uppercase leading-[0.9] tracking-tight mb-6">
                AVAILABLE<br /><span className="text-[#e8a020]">NOW.</span>
             </h1>

             <p className="text-[15px] md:text-[16px] font-semibold text-[#7a90a8] leading-relaxed mb-10 max-w-[380px]">
                High-fidelity restaurant logistics and zero-fee independent food delivery. Establish your operational node today.
             </p>

             <div className="flex flex-wrap gap-3">
                {["Verified Nodes", "Fair Wages", "Zero Fees"].map(m => (
                  <span key={m} className="bg-white/5 border border-[#1e2c3a] rounded-full px-4 py-1.5 text-[12px] font-bold text-[#7a90a8]">
                    {m}
                  </span>
                ))}
             </div>
          </div>

          {/* STATUS CARD / SEARCH */}
          <div className="bg-[#10151e] border border-[#1e2c3a] rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
             <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">
                <div className="relative w-[72px] h-[72px] flex-shrink-0 flex items-center justify-center">
                   <div className="absolute rounded-full border-[1.5px] border-[#e8a020]/50 animate-ripple-1 transition-all w-[72px] h-[72px] origin-center"></div>
                   <div className="absolute rounded-full border-[1.5px] border-[#e8a020]/50 animate-ripple-2 transition-all w-[72px] h-[72px] origin-center"></div>
                   <div className="absolute rounded-full border-[1.5px] border-[#e8a020]/50 animate-ripple-3 transition-all w-[72px] h-[72px] origin-center"></div>
                   <div className="relative z-10 w-9 h-9 bg-[#e8a020] rounded-full flex items-center justify-center shadow-[0_0_16px_#e8a020/50] rotate-[-45deg] origin-center rounded-br-none scale-100">
                      <div className="w-3.5 h-3.5 bg-[#0a0d12] rounded-full rotate-[45deg]"></div>
                   </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                   <div className="text-[18px] md:text-[20px] font-extrabold text-white mb-2">Initialize Sector Scan</div>
                   <div className="text-[13px] md:text-[14px] font-semibold text-[#7a90a8]">Search for established operational nodes in your vicinity.</div>
                </div>

                <div className="flex gap-10">
                  <div className="text-center">
                    <div className="font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold italic text-[#e8a020] leading-none">48</div>
                    <div className="text-[10px] font-black text-[#3a5060] uppercase tracking-widest mt-1">Sectors</div>
                  </div>
                  <div className="text-center">
                    <div className="font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold italic text-[#e8a020] leading-none">ACTIVE</div>
                    <div className="text-[10px] font-black text-[#3a5060] uppercase tracking-widest mt-1">Grid Status</div>
                  </div>
                </div>
             </div>

             <div className="bg-[#161d2a]/50 p-6 md:p-8 border-t border-[#1e2c3a] flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Enter universal coordinates (Address)…" 
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                  className="flex-1 bg-[#0a0d12] border border-[#1e2c3a] rounded-xl px-6 py-4 text-[15px] font-semibold text-white placeholder-[#3a5060] outline-none focus:border-[#e8a020] transition-all"
                />
                <button 
                  onClick={doSearch}
                  className="bg-[#e8a020] hover:bg-[#c87010] text-[#0a0d12] font-['Barlow_Condensed',sans-serif] text-[20px] font-black italic tracking-widest px-10 py-4 rounded-xl shadow-[0_4px_20px_rgba(232,160,32,0.35)] hover:shadow-[0_6px_24px_rgba(232,160,32,0.5)] transition-all uppercase"
                >
                  INITIALIZE SCAN
                </button>
             </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
             <Link href="/restaurants" className="bg-[#10151e] border border-[#1e2c3a] hover:border-[#e8a020] hover:text-[#e8a020] px-6 py-3 rounded-xl text-[14px] font-bold text-[#c8d8e8] transition-all no-underline">Browse Sectors</Link>
             <button className="bg-[#10151e] border border-[#1e2c3a] hover:border-[#e8a020] hover:text-[#e8a020] px-6 py-3 rounded-xl text-[14px] font-bold text-[#c8d8e8] transition-all">Support Comms</button>
             <button className="bg-[#10151e] border border-[#1e2c3a] hover:border-[#e8a020] hover:text-[#e8a020] px-6 py-3 rounded-xl text-[14px] font-bold text-[#c8d8e8] transition-all">Fleet Registry</button>
          </div>
        </div>

        {/* RIGHT COL - TRENDING SECTORS / RESTAURANTS */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[20px] font-black text-white italic uppercase tracking-tight">Active Nodes</div>
            <div className="bg-[#e8a020]/10 border border-[#9b6a14] text-[#e8a020] text-[12px] font-black px-4 py-1 rounded-full uppercase italic tracking-widest">Sector Peak</div>
          </div>

          {[
            { icon: "🍣", name: "Sushi Neko", dist: "0.4 mi", loc: "Charlotte, NC", yield: "$4.20" },
            { icon: "🍖", name: "Mount Airy BBQ", dist: "0.8 mi", loc: "Mount Airy, NC", yield: "$3.56" },
            { icon: "🥗", name: "Emerald Kitchen", dist: "1.2 mi", loc: "Concord, NC", yield: "$3.84" },
            { icon: "🍕", name: "Krave It", dist: "1.5 mi", loc: "Bayside, NY", yield: "$4.12" },
            { icon: "🍜", name: "Harbor Ramen", dist: "2.1 mi", loc: "Charlotte, NC", yield: "SOON", dimmed: true },
          ].map((node, i) => (
            <div key={i} className={`bg-[#10151e] border border-[#1e2c3a] rounded-[18px] p-5 flex items-center gap-5 cursor-pointer hover:border-[#9b6a14] hover:shadow-[0_8px_30px_#e8a020/5] transition-all group ${node.dimmed ? 'opacity-40 pointer-events-none' : ''}`}>
               <div className="w-[52px] h-[52px] bg-[#161d2a] border border-[#1e2c3a] rounded-xl flex items-center justify-center text-[28px] flex-shrink-0 group-hover:scale-110 transition-transform">{node.icon}</div>
               <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-extrabold text-white truncate">{node.name}</div>
                  <div className="text-[13px] font-semibold text-[#7a90a8] truncate">{node.dist} · {node.loc}</div>
               </div>
               <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {!node.dimmed ? (
                    <>
                      <div className="bg-green-500/10 border border-green-500/30 text-[#22c55e] text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-tighter">● Live</div>
                      <div className="font-['Barlow_Condensed',sans-serif] text-[22px] font-extrabold italic text-[#e8a020] leading-none">{node.yield}</div>
                    </>
                  ) : (
                    <div className="bg-[#161d2a] border border-[#1e2c3a] text-[#3a5060] text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest">Coming Soon</div>
                  )}
               </div>
            </div>
          ))}

          <section className="mt-8 pt-8 border-t border-[#1e2c3a]">
             <div className="text-[11px] font-black uppercase tracking-[0.4em] text-[#3a5060] italic text-center">
                TrueServe Platform // Tactical Operational Hub V.1.0
             </div>
          </section>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="py-16 bg-[#0a0d12] border-t border-[#1e2c3a] text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <Logo size="md" className="mb-10" />
          <div className="flex flex-wrap justify-center gap-10 text-[11px] font-black uppercase tracking-[0.3em] text-[#3a5060] mb-10">
            <Link href="/privacy" className="hover:text-white transition-colors no-underline">Privacy</Link>
            <Link href="/merchant/signup" className="hover:text-[#e8a020] transition-colors no-underline">Merchants</Link>
            <Link href="/driver/signup" className="hover:text-[#e8a020] transition-colors no-underline">Drivers</Link>
            <Link href="/terms" className="hover:text-white transition-colors no-underline">Terms</Link>
          </div>
          <p className="text-[11px] font-bold text-[#3a5060] uppercase tracking-widest leading-loose">
            © {new Date().getFullYear()} TrueServe Platform. <br />
            Supporting Independent Culinary Infrastructure.
          </p>
        </div>
      </footer>
    </div>
  );
}

