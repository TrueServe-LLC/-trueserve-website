"use client";

import { useState } from 'react';

export default function EmbedManager({ restaurantId }: { restaurantId: string }) {
    const [copied, setCopied] = useState(false);
    
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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(iframeCode);
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
                            Website Embed
                        </h2>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">
                            Integrate your menu into GoHighLevel or any external website
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Instructions */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white italic">How to embed in GoHighLevel:</h3>
                            <ul className="space-y-3 text-slate-400 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                                    <span>Open your GHL Page Builder.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                                    <span>Add a "JS/HTML Code" element to your section.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</span>
                                    <span>Paste the snippet from the right and Save.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                            <p className="text-xs font-bold text-white mb-2">💡 Pro Tip:</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Our iframe automatically detects its environment. This "Embedded Mode" removes our global headers so it looks native to your marketing site.
                            </p>
                        </div>
                    </div>

                    {/* Code Generator */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={copyToClipboard}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    {copied ? '✓ Copied' : 'Copy Snippet'}
                                </button>
                            </div>
                            <pre className="p-8 pb-12 bg-black border border-white/10 rounded-3xl text-xs text-primary font-mono overflow-x-auto selection:bg-primary/20">
                                {iframeCode}
                            </pre>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">
                            Secure Iframe Link: {embedUrl}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
