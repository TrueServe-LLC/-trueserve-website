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
    <div className="min-h-screen bg-[#0c0e13] text-white">
      {/* NAV */}
      <nav>
        <Logo size="sm" />
        <div className="nav-links hidden md:flex">
          <Link href="/">Order Food</Link>
          <Link href="/merchant/signup">For Merchants</Link>
          <Link href="/driver/signup">Driver Hub</Link>
        </div>
        <div className="nav-r">
          {userId ? (
            <Link href="/user/settings" className="btn btn-ghost">Account</Link>
          ) : (
            <Link href="/login" className="btn btn-ghost">Sign In</Link>
          )}
          <Link href="/merchant/signup" className="btn btn-gold">Join Network</Link>
        </div>
      </nav>

      {/* HOME VIEW */}
      <main id="view-home">
        <div className="home-bg-img"></div>
        <div className="home-bg-grad"></div>
        <div className="home-inner">
          <div className="eyebrow">Zero Platform Fees · Fair Driver Pay</div>
          <h1 className="home-h1">Cravings meet<br /><span className="g">Lightning Speed.</span></h1>
          <p className="home-p">The future of local food delivery is here.<br />Enter your address to see restaurants near you.</p>
          
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Enter your delivery address…" 
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            />
            <button onClick={doSearch}>Find Food</button>
          </div>
          

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {[
              "Free delivery on first order",
              "Real-time tracking",
              "AI-powered support"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-extrabold uppercase tracking-widest hover:border-[#e8a230]/50 hover:bg-[#e8a230]/5 transition-all">
                <span className="text-[#e8a230]">✓</span> {feature}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ADDITIONAL SECTIONS (Adapting from previous version but in new style) */}
      <section className="py-24 bg-[#0a0a0b] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Order Locally.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", desc: "Support independent gems. Zero platform fees ensure local restaurants stay in business.", link: "/restaurants" },
              { title: "Grow Partners.", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", desc: "Stop losing margins to big apps. Fair pricing and elite dispatch built for you.", link: "/merchant/signup" },
              { title: "Drive More.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", desc: "Join our fleet and earn 20-30% more with optimized routing and reliable payouts.", link: "/driver/signup" }
            ].map((card, i) => (
              <Link key={i} href={card.link} className="group relative block h-[500px] overflow-hidden rounded-2xl border border-white/10 transition-all hover:border-[#e8a230]/50">
                <img src={card.img} alt={card.title} className="absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e13] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">{card.title}</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{card.desc}</p>
                  <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#e8a230]">
                    Learn More <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 bg-[#0c0e13] border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <Logo size="md" className="mb-12" />
          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-12">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/merchant/signup" className="hover:text-[#e8a230] transition-colors">Merchants</Link>
            <Link href="/driver/signup" className="hover:text-[#e8a230] transition-colors">Drivers</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} TrueServe Platform. <br />
            Supporting Independent Culinary Infrastructure.
          </p>
        </div>
      </footer>
    </div>
  );
}

