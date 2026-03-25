"use client";

import { useState } from 'react';

export default function EmbedManager({ restaurantId }: { restaurantId: string }) {
    const [copied, setCopied] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'iframe' | 'button'>('iframe');
    
    // Use window.location.origin but fallback to production URL if needed
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://trueservedelivery.com';
    const embedUrl = `${baseUrl}/restaurants/${restaurantId}?embed=true`;
    
    const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="800px" 
  frameborder="0" 
  style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"
></iframe>`;

    const buttonCode = `<div id="trueserve-order-root">
  <style>
    .ts-order-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #f59e0b;
      color: #000;
      padding: 18px 36px;
      font-family: serif;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      border-radius: 12px;
      border: none;
      box-shadow: 0 10px 40px rgba(245, 158, 11, 0.4);
      cursor: pointer;
      z-index: 999999;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: all 0.3s ease;
      font-style: italic;
    }
    .ts-order-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 50px rgba(245, 158, 11, 0.6);
      filter: brightness(1.1);
    }
  </style>
  <a href="${baseUrl}/restaurants/${restaurantId}" target="_blank" class="ts-order-btn">
    Order Now →
  </a>
</div>`;

    const copyToClipboard = () => {
        const textToCopy = activeTab === 'iframe' ? iframeCode : buttonCode;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="group">
            <div className="flex justify-between items-end mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">🌐</div>
                    <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
                            Website Integration
                        </h2>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">
                            Connect your TrueServe menu to any external platform
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('iframe')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'iframe' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                        Full Embed
                    </button>
                    <button 
                        onClick={() => setActiveTab('button')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'button' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                        Action Button
                    </button>
                </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Instructions */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white italic">
                                {activeTab === 'iframe' ? 'How to embed your menu:' : 'How to add an Order Button:'}
                            </h3>
                            <ul className="space-y-3 text-slate-400 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                                    <span>{activeTab === 'iframe' ? 'Open your GHL or website builder.' : 'Open your existing website editor.'}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                                    <span>Add a "Custom HTML" or "JS/HTML" element.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</span>
                                    <span>Paste the snippet on the right and Save.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                            <p className="text-xs font-bold text-white mb-2">💡 Pro Tip:</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
                                {activeTab === 'iframe' 
                                    ? "Perfect for adding your full ordering experience inside another site. We remove our site-wide navigation so it looks built-in." 
                                    : "Perfect for existing websites that already have a design. This adds a floating button that stays in one place as users scroll."}
                            </p>
                        </div>
                    </div>

                    {/* Code Generator */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={copyToClipboard}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    {copied ? '✓ Copied' : 'Copy Snippet'}
                                </button>
                            </div>
                            <pre className="p-8 pb-12 bg-black border border-white/10 rounded-3xl text-[10px] text-primary font-mono overflow-x-auto selection:bg-primary/20 leading-relaxed scrollbar-thin">
                                {activeTab === 'iframe' ? iframeCode : buttonCode}
                            </pre>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">
                            Target URL: {embedUrl}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
