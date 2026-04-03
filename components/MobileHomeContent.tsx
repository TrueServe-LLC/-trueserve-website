'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function MobileHomeContent({ userId }: { userId?: string }) {
    const [unlocked, setUnlocked] = useState(false);
    const [slide, setSlide] = useState(0);
    const [address, setAddress] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setSlide((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleUnlock = () => {
        if (address.trim()) {
            setUnlocked(true);
            // Simulate scroll like the template
            setTimeout(() => {
                window.scrollTo({ top: 300, behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className={`lg:hidden noise-overlay font-dm-sans min-h-screen relative flex flex-col z-10 bg-[#0c0e13] ${unlocked ? 'unlocked' : ''}`}>
            
            {/* ── HOME TOP BAR ── */}
            <div className="flex items-center justify-between px-5 py-6 absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#0c0e13]/95 via-[#0c0e13]/60 to-transparent pt-13 pb-4">
                <div className="flex items-center gap-2">
                    <Logo size="sm" />
                </div>
                <Link href={userId ? "/user/settings" : "/login"} className="w-8.5 h-8.5 rounded-full bg-[#131720]/85 border border-[#2a2f3a] flex items-center justify-center backdrop-blur-md">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5.5" r="2.8" stroke="#aaa" strokeWidth="1.3"/><path d="M1.5 13.5c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32">
                {/* ── HERO BANNER ── */}
                <div className="relative h-[280px] overflow-hidden flex-shrink-0">
                    {[
                        { emoji: '🍔', tag: '⚡ Fast Delivery', tagColor: 'var(--gdim)', border: 'var(--gb)', txt: 'var(--gold)', title: <>Taste Your<br/><span className="text-[#e8a230]">City.</span></>, sub: 'Local restaurants. Fresh food. Delivered to your door.' },
                        { emoji: '🍕', tag: '🌿 Local Only', tagColor: 'rgba(61,214,140,.1)', border: 'rgba(61,214,140,.22)', txt: 'var(--green)', title: <>No<br/><span className="text-[#e8a230]">Chains.</span></>, sub: 'Every restaurant is locally owned and community-loved.' },
                        { emoji: '🍜', tag: '🔥 Trending', tagColor: 'rgba(226,75,74,.1)', border: 'rgba(226,75,74,.22)', txt: 'var(--red)', title: <>New<br/><span className="text-[#e8a230]">Eats.</span></>, sub: 'Discover hidden gems and new flavors near you every week.' },
                    ].map((s, i) => (
                        <div key={i} className={`absolute inset-0 transition-opacity duration-[1.5s] ease-in-out ${slide === i ? 'opacity-100' : 'opacity-0'}`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${i === 0 ? 'from-[#1a1208] to-[#0f1219]' : i === 1 ? 'from-[#060f0c] to-[#0f1219]' : 'from-[#100a1a] to-[#0f1219]'}`} />
                            <div className="absolute right-5 top-1/2 -translate-y-[60%] text-[90px] opacity-25 blur-[1px] select-none">{s.emoji}</div>
                            <div className="absolute inset-0 flex flex-col justify-end p-5.5 bg-gradient-to-t from-[#0c0e13]/96 via-[#0c0e13]/40 to-transparent">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2.5 border" style={{ backgroundColor: s.tagColor, borderColor: s.border }}>
                                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: s.txt }}>{s.tag}</span>
                                </div>
                                <h1 className="font-barlow-cond text-[32px] font-extrabold italic uppercase text-white leading-[0.95] mb-1.5">{s.title}</h1>
                                <p className="text-[12px] text-white/50 leading-relaxed max-w-[240px] font-medium">{s.sub}</p>
                            </div>
                        </div>
                    ))}
                    
                    {/* Slide dots */}
                    <div className="absolute bottom-20 left-5.5 flex gap-1.5 z-10">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={`h-1.25 rounded-full transition-all duration-300 ${slide === i ? 'bg-[#e8a230] w-4.5' : 'bg-white/30 w-1.25'}`} />
                        ))}
                    </div>
                </div>

                {/* ── ADDRESS SECTION ── */}
                <div className="px-4.5 py-3.5 bg-[#0c0e13] border-b border-[#1c1f28] flex-shrink-0">
                    <div className="flex items-center gap-2.5 bg-[#0f1219] border-[1.5px] border-[#2a2f3a] rounded-[14px] p-1 pl-3.5 focus-within:border-[#e8a230] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0"><path d="M7 1C4.8 1 3 2.8 3 5c0 2.8 4 7 4 7s4-4.2 4-7c0-2.2-1.8-4-4-4z" stroke="#e8a230" strokeWidth="1.4"/><circle cx="7" cy="5" r="1.3" stroke="#e8a230" strokeWidth="1.1"/></svg>
                        <input 
                            className="flex-1 bg-transparent border-none text-[#ccc] font-dm-sans text-[13px] py-2.5 outline-none placeholder:text-[#333]" 
                            type="text" 
                            placeholder="Enter your delivery address..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                        />
                        <button className="bg-[#e8a230] border-none text-black text-[11px] font-bold tracking-[.08em] uppercase px-4 py-2.5 cursor-pointer rounded-[10px] whitespace-nowrap shrink-0 active:scale-95 transition-transform" onClick={handleUnlock}>Search</button>
                    </div>
                </div>

                {/* ── GATED CONTENT ── */}
                <div className={`${unlocked ? 'block animate-up' : 'hidden'}`}>
                    {/* CATEGORIES */}
                    <div className="pt-4 flex-shrink-0">
                        <div className="text-[10px] font-bold tracking-[.14em] uppercase text-[#555] mb-3 px-4.5">What are you craving?</div>
                        <div className="flex gap-2.5 overflow-x-auto px-4.5 pb-1 scrollbar-hide">
                            {['🍽️ All', '🍔 Burgers', '🍕 Pizza', '🍣 Sushi', '🍗 Chicken', '🌮 Mexican', '🍜 Asian', '🥗 Healthy'].map((cat, i) => (
                                <div key={i} className={`flex items-center gap-2 px-3.5 py-2 rounded-full cursor-pointer shrink-0 transition-all border ${i === 0 ? 'bg-[#e8a230]/15 border-[#e8a230]/24' : 'bg-[#0f1219] border-[#1c1f28]'}`}>
                                    <span className="text-base leading-none">{cat.split(' ')[0]}</span>
                                    <span className={`text-[11px] font-bold tracking-tight whitespace-nowrap ${i === 0 ? 'text-[#e8a230]' : 'text-[#ccc]'}`}>{cat.split(' ')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FOOD STRIP */}
                    <div className="pt-5 overflow-hidden flex-shrink-0">
                        <div className="text-[10px] font-bold tracking-[.14em] uppercase text-[#555] mb-3 px-4.5 flex items-center justify-between">
                            <span>Popular Dishes</span>
                            <Link href="/restaurants" className="text-[#e8a230] font-semibold text-[12px]">See all</Link>
                        </div>
                        <div className="overflow-hidden">
                            <div className="flex gap-2.5 animate-scroll-track w-max">
                                {[
                                    { e: '🍖', n: 'Jerk Chicken Plate', r: "Dhan's", s: '4.9' },
                                    { e: '🍕', n: 'Margherita Pizza', r: "Bella's", s: '4.7' },
                                    { e: '🍜', n: 'Pho Special', r: "Saigon", s: '4.6' },
                                    { e: '🌮', n: 'Street Tacos', r: "Cantina", s: '4.8' },
                                    { e: '🍣', n: 'Salmon Roll', r: "Kiro", s: '4.9' },
                                ].concat([
                                    { e: '🍖', n: 'Jerk Chicken Plate', r: "Dhan's", s: '4.9' },
                                    { e: '🍕', n: 'Margherita Pizza', r: "Bella's", s: '4.7' },
                                    { e: '🍜', n: 'Pho Special', r: "Saigon", s: '4.6' },
                                    { e: '🌮', n: 'Street Tacos', r: "Cantina", s: '4.8' },
                                    { e: '🍣', n: 'Salmon Roll', r: "Kiro", s: '4.9' },
                                ]).map((f, i) => (
                                    <Link href="/restaurants" key={i} className="w-[130px] shrink-0 bg-[#0f1219] border border-[#1c1f28] rounded-[14px] overflow-hidden active:scale-95 transition-transform">
                                        <div className="h-20 flex items-center justify-center text-4xl bg-gradient-to-br from-[#1a1208] to-[#111820]">{f.e}</div>
                                        <div className="p-2.5 px-3">
                                            <div className="text-[11px] font-bold text-[#ddd] mb-0.5 line-height-tight">{f.n}</div>
                                            <div className="text-[10px] text-[#555]">{f.r} · ★ {f.s}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RESTAURANTS */}
                    <div className="p-4.5">
                        <div className="flex items-center justify-between mb-3.5">
                            <div className="text-[16px] font-bold text-white">Near You</div>
                            <Link href="/restaurants" className="text-[12px] font-semibold text-[#e8a230]">See all</Link>
                        </div>
                        {[
                            { e: '🍖', c: 'Caribbean · Soul Food', n: "Dhan's Kitchen", r: '4.9', t: '29–39 min', p: '$$$', f: '$2.99 fee', tag: 'OPEN', color: 'from-[#1a1208] to-[#111820]' },
                            { e: '🥩', c: 'American · Comfort', n: "Emerald Kitchen", r: '4.7', t: '20–30 min', p: '$$$', f: '$1.99 fee', tag: 'POPULAR', color: 'from-[#101a12] to-[#111820]' },
                            { e: '🍜', c: 'Vietnamese · Asian', n: "Pho Saigon", r: '4.6', t: '25–35 min', p: '$$', f: 'Free delivery', tag: 'OPEN', color: 'from-[#0a1520] to-[#111820]' },
                        ].map((r, i) => (
                            <Link href="/restaurants" key={i} className="bg-[#0f1219] border border-[#1c1f28] rounded-[16px] overflow-hidden mb-3 block active:scale-[0.98] transition-all">
                                <div className={`h-[130px] flex items-center justify-center text-5xl relative bg-gradient-to-br ${r.color}`}>
                                    {r.e}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1219]/90 to-transparent" />
                                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                                        <div className="bg-black/65 text-[10px] font-bold text-[#ccc] px-2 py-1 rounded-full">{r.f}</div>
                                        <div className={`tag-template ${r.tag === 'OPEN' ? 'bg-[#3dd68c]/10 text-[#3dd68c] border-[#3dd68c]/22' : 'bg-[#e8a230]/13 text-[#e8a230] border-[#e8a230]/24 border'}`}>{r.tag}</div>
                                    </div>
                                </div>
                                <div className="p-3 px-3.5">
                                    <div className="text-[10px] font-semibold tracking-[.06em] uppercase text-[#555] mb-1">{r.c}</div>
                                    <div className="text-[15px] font-bold text-[#ddd] mb-1">{r.n}</div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[12px] text-[#e8a230] font-bold">★ {r.r}</span>
                                        <span className="text-[11px] text-[#555] font-medium">{r.t}</span>
                                        <span className="text-[11px] text-[#555] font-medium">{r.p}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* JOIN SECTION */}
                <div className="px-4.5 pb-4.5">
                    <div className="text-[16px] font-bold text-white mb-3.5">Join TrueServe</div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <Link href="/merchant/login" className="bg-[#e8a230]/10 border border-[#e8a230]/24 p-4.5 rounded-[16px] text-center active:scale-95 transition-all text-decoration-none">
                            <span className="text-[28px] mb-2 block">🏪</span>
                            <div className="text-[13px] font-extrabold text-[#e8a230] mb-1">Merchant</div>
                            <div className="text-[10px] text-white/40 leading-tight">List & grow your restaurant</div>
                        </Link>
                        <Link href="/driver/login" className="bg-[rgba(61,214,140,.08)] border border-[rgba(61,214,140,.2)] p-4.5 rounded-[16px] text-center active:scale-95 transition-all text-decoration-none">
                            <span className="text-[28px] mb-2 block">🛵</span>
                            <div className="text-[13px] font-extrabold text-[#3dd68c] mb-1">Driver</div>
                            <div className="text-[10px] text-white/40 leading-tight">Deliver on your schedule</div>
                        </Link>
                    </div>
                </div>
                
                <div className="h-20" />
            </div>

            {/* ── APP TABS ── */}
            <div className="flex bg-[#0f1219] border-t border-[#1c1f28] pt-2.5 pb-7 shrink-0">
                <Link href="/" className="flex-1 flex flex-col items-center gap-1 active:opacity-70">
                    <div className="w-5.5 h-5.5 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 8.5l7-6 7 6V17a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="#e8a230" strokeWidth="1.5"/><rect x="7.5" y="12" width="2.5" height="4" rx=".5" stroke="#e8a230" strokeWidth="1.2"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#e8a230]">Home</div>
                </Link>
                <Link href="/orders" className="flex-1 flex flex-col items-center gap-1 opacity-100">
                    <div className="w-5.5 h-5.5 flex items-center justify-center opacity-35">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#888" strokeWidth="1.5"/><path d="M10 6.5v3.5l2.5 1.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#555]">Orders</div>
                </Link>
                <Link href="/user/settings" className="flex-1 flex flex-col items-center gap-1 opacity-100">
                    <div className="w-5.5 h-5.5 flex items-center justify-center opacity-35">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="#888" strokeWidth="1.5"/><path d="M3 19c0-4 3-7 7-7s7 3 7 7" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#555]">Account</div>
                </Link>
            </div>
        </div>
    );
}
